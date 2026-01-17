import { PrismaClient } from '@prisma/client'
// Prefer native bcrypt when available, otherwise fall back to bcryptjs to avoid native build issues in dev/test environments.
let bcrypt: any
try { bcrypt = require('bcrypt') } catch (e) { bcrypt = require('bcryptjs') }
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })

const prisma = new PrismaClient()

async function hasColumn(table: string, column: string) {
  const res: Array<{ exists: boolean }> = await prisma.$queryRaw`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=${table} AND column_name=${column}) as exists` as any
  return res[0]?.exists === true
}

async function main() {
  console.log('Seeding database...')

  // Demo user (raw upsert to remain compatible while Prisma client is being regenerated)
  const passwordHash = await bcrypt.hash('password', 10)
  const demoUserId = require('crypto').randomUUID()
  await prisma.$executeRaw`INSERT INTO public."User" ("id","email","name","passwordhash","isemailverified","createdAt","updatedAt") VALUES (${ demoUserId }, ${ 'demo@haypbooks.test' }, ${ 'Demo User' }, ${ passwordHash }, ${ true }, now(), now()) ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name", "passwordhash" = EXCLUDED."passwordhash", "isemailverified" = EXCLUDED."isemailverified";`
  const users = await prisma.$queryRaw<any[]>`SELECT id, email, name, "isemailverified" as "isEmailVerified", "createdAt", "updatedAt" FROM public."User" WHERE email = ${ 'demo@haypbooks.test' } LIMIT 1;`
  const user = Array.isArray(users) && users.length ? users[0] : undefined

  // Demo tenant: seed a deterministic demo tenant id and avoid name/subdomain (moved to Company)
  const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000001'
  try {
    const tenantId = DEMO_TENANT_ID
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","baseCurrency","createdAt","updatedAt") VALUES (${tenantId}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO UPDATE SET "baseCurrency" = EXCLUDED."baseCurrency";`
  } catch (e) {
    // ignore — subsequent SELECT will fetch existing row
  }
  // Ensure comparison works regardless of id column type (uuid or text)
  const tenants = await prisma.$queryRaw<any[]>`SELECT id, "baseCurrency" FROM public."Tenant" WHERE CAST(id AS text) = ${DEMO_TENANT_ID} LIMIT 1;`
  let tenant: any = tenants && tenants.length ? tenants[0] : undefined
  if (!tenant) {
    const fallbackTenantId = DEMO_TENANT_ID
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES (CAST(${fallbackTenantId} AS uuid), now(), now())`;
    const tenants2 = await prisma.$queryRaw<any[]>`SELECT id, "baseCurrency" FROM public."Tenant" WHERE id = CAST(${DEMO_TENANT_ID} AS uuid) LIMIT 1;`
    tenant = tenants2 && tenants2.length ? tenants2[0] : undefined
  }

  // Link user to tenant (owner)
  const tenantUserHasStatus = await hasColumn('TenantUser', 'status')
  const tenantUserHasRoleId = await hasColumn('TenantUser', 'roleId')
  const tenantUserHasInvitedBy = await hasColumn('TenantUser', 'invitedBy')
  if (tenantUserHasStatus && tenantUserHasRoleId && tenantUserHasInvitedBy) {
    await prisma.tenantUser.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: {},
      create: { tenantId: tenant.id, userId: user.id, role: 'ADMIN', isOwner: true, lastAccessedAt: new Date() }
    })
  } else {
    // Use raw upsert when DB doesn't have schema column yet (avoid Prisma selecting missing columns)
    await prisma.$executeRaw`INSERT INTO public."TenantUser" ("tenantId","userId","role","isOwner","joinedAt","lastAccessedAt") VALUES (${tenant.id}, ${user.id}, 'ADMIN', true, now(), now()) ON CONFLICT ("tenantId","userId") DO UPDATE SET "role" = EXCLUDED."role", "isOwner" = EXCLUDED."isOwner", "lastAccessedAt" = COALESCE(public."TenantUser"."lastAccessedAt", EXCLUDED."lastAccessedAt")`;
  }

    // Create a default company for the demo tenant
    const companyHasTenantId = await hasColumn('Company', 'tenantId')
    let demoCompany: any
    if (companyHasTenantId) {
      try {
        demoCompany = await prisma.company.upsert({
          where: { tenantId_name: { tenantId: tenant.id, name: 'Demo Company' } },
          update: {},
          create: { tenantId: tenant.id, name: 'Demo Company', businessType: 'Demo', industry: 'Demo Industry', address: '123 Demo St', taxId: 'DEMO-TIN', logoUrl: 'https://cdn.example/demo-logo.png', invoicePrefix: 'DEMO', vatRegistered: true, vatRate: 12.00, pricesInclusive: false, defaultPaymentTerms: 'NET 30', accountingMethod: 'ACCRUAL', inventoryEnabled: true, payrollEnabled: false }
        })
      } catch (e) {
        const isMissingColumnError = e && (e.code === 'P2022' || (e.message && e.message.includes('does not exist')))
        if (!isMissingColumnError) throw e

        // Fallback: raw SQL path to handle legacy schemas where Company.tenantId may be non-UUID or missing
        const companyId = require('crypto').randomUUID()
        console.log('checking for existing demo company for tenant', tenant.id)

        try {
          const colType = await prisma.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Company' AND column_name='tenantId'` as any
          const companyTenantIsUuid = colType && colType.length && (colType[0] as any).data_type === 'uuid'
          console.log('company.tenantId data_type', (colType && colType[0] && (colType[0] as any).data_type) || 'unknown')

          let exists: any[] = []
          try {
            if (companyTenantIsUuid) {
              exists = await prisma.$queryRawUnsafe('SELECT 1 FROM public."Company" WHERE "tenantId" = $1::uuid AND name = $2 LIMIT 1', tenant.id, 'Demo Company')
            } else {
              exists = await prisma.$queryRawUnsafe('SELECT 1 FROM public."Company" WHERE CAST("tenantId" AS text) = $1 AND name = $2 LIMIT 1', tenant.id, 'Demo Company')
            }
          } catch (err) {
            console.error('company existence check failed', err)
            throw err
          }

          if (!exists || !exists.length) {
            console.log('inserting minimal demo company for tenant', tenant.id)
            try {
              if (companyTenantIsUuid) {
                await prisma.$executeRawUnsafe('INSERT INTO public."Company" ("id","tenantId","name") VALUES ($1::uuid,$2::uuid,$3)', companyId, tenant.id, 'Demo Company')
              } else {
                await prisma.$executeRawUnsafe('INSERT INTO public."Company" ("id","tenantId","name") VALUES ($1,$2,$3)', companyId, tenant.id, 'Demo Company')
              }
            } catch (err) {
              console.error('company insert failed', err)
              throw err
            }
          }

          // Lookup the inserted or existing company
          try {
            const idType = await prisma.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Company' AND column_name='id'` as any
            const idIsUuid = idType && idType.length && (idType[0] as any).data_type === 'uuid'
            if (idIsUuid) {
              const rows: any[] = await prisma.$queryRaw`SELECT id, "tenantId", name FROM public."Company" WHERE id = CAST(${companyId} AS uuid) LIMIT 1;`
              demoCompany = rows && rows.length ? rows[0] : undefined
            } else {
              const rows: any[] = await prisma.$queryRawUnsafe(`SELECT id, "tenantId", name FROM public."Company" WHERE id = '${companyId}' LIMIT 1;`)
              demoCompany = rows && rows.length ? rows[0] : undefined
            }
          } catch (err) {
            console.error('company lookup failed', err)
            throw err
          }
        } catch (err) {
          console.error('company fallback path failed', err)
          throw err
        }
      }
    } else {
      // Older DB without tenantId on Company: insert id+name and select
      await prisma.$executeRaw`INSERT INTO public."Company" ("id","name") VALUES (${ 'company-' + tenant.id }, ${'Demo Company'}) ON CONFLICT ("id") DO NOTHING;`
      const rows: any[] = await prisma.$queryRaw`SELECT id, name FROM public."Company" WHERE id = ${ 'company-' + tenant.id } LIMIT 1;`
      demoCompany = rows && rows.length ? rows[0] : undefined
    }

  // Ensure some AccountTypes exist
  const assetType = await prisma.accountType.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: 'ASSET' } })
  const expenseType = await prisma.accountType.upsert({ where: { id: 2 }, update: {}, create: { id: 2, name: 'EXPENSE' } })
  const incomeType = await prisma.accountType.upsert({ where: { id: 3 }, update: {}, create: { id: 3, name: 'INCOME' } })
  const liabilityType = await prisma.accountType.upsert({ where: { id: 4 }, update: {}, create: { id: 4, name: 'LIABILITY' } })
  const equityType = await prisma.accountType.upsert({ where: { id: 5 }, update: {}, create: { id: 5, name: 'EQUITY' } })

  // Create some default Accounts for the tenant
  const cash = await prisma.account.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: "1000" } }, update: {}, create: { tenantId: tenant.id, code: "1000", name: 'Cash', typeId: assetType.id } })
  const ar = await prisma.account.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: "1100" } }, update: {}, create: { tenantId: tenant.id, code: "1100", name: 'Accounts Receivable', typeId: assetType.id } })
  const rev = await prisma.account.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: "4000" } }, update: {}, create: { tenantId: tenant.id, code: "4000", name: 'Service Revenue', typeId: incomeType.id } })
  const invSuspense = await prisma.account.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: "INV-SUSPENSE" } }, update: {}, create: { tenantId: tenant.id, code: "INV-SUSPENSE", name: 'Inventory Suspense', typeId: expenseType.id } })

  // Create a contact and customer (tenant-scoped)
  let contact = await prisma.contact.findFirst({ where: { tenantId: tenant.id, displayName: 'Acme Corp' } })
  if (!contact) contact = await prisma.contact.create({ data: { tenantId: tenant.id, type: 'CUSTOMER', displayName: 'Acme Corp' } })
  const customer = await prisma.customer.upsert({ where: { contactId: contact.id }, update: {}, create: { contactId: contact.id, tenantId: tenant.id, terms: 'NET 7' } })
  try {
    await prisma.contactEmail.upsert({ where: { contactId_email: { contactId: contact.id, email: `${contact.id}@acme.example` } }, update: {}, create: { contactId: contact.id, email: `${contact.id}@acme.example`, type: 'WORK', isPrimary: true } })
  } catch (e) { /* table may not exist yet if migrations not applied */ }
  try {
    const existingPhone = await prisma.contactPhone.findFirst({ where: { contactId: contact.id, phone: '+10000000000' } })
    if (!existingPhone) {
      await prisma.contactPhone.create({ data: { contactId: contact.id, phone: '+10000000000', type: 'WORK', isPrimary: true } })
    }
  } catch (e) { /* table may not exist yet if migrations not applied */ }

  // Create an invoice for the customer - include required fields (balance, total)
  let invoice: any
  try {
    invoice = await prisma.invoice.create({ data: { tenantId: tenant.id, companyId: demoCompany.id, customerId: contact.id, invoiceNumber: 'INV-1001', date: new Date(), dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), totalAmount: 1000, balance: 1000, status: 'SENT' } })
    await prisma.invoiceLine.create({ data: { tenantId: tenant.id, invoiceId: invoice.id, companyId: demoCompany.id, description: 'Consulting services', quantity: 1, unitPrice: 1000, totalPrice: 1000 } })
    console.log('Seeded demo tenant, tenant user, accounts, customer, and invoice')
  } catch (e) {
    // If the Invoice table or status column isn't present yet, proceed without seeding invoices
    console.warn('Skipping invoice seed, table or column may not exist yet', e)
  }

  // Seed sample Tasks if migrations applied
  try {
    const taskTableExists = await hasColumn('Task', 'id')
    if (taskTableExists) {
      const existing = await prisma.task.findFirst({ where: { tenantId: tenant.id } })
      if (!existing) {
        // Be defensive about companyId types: some legacy DBs use non-UUID company ids (e.g. 'company-...'),
        // while Task.companyId column may be defined as UUID. If types mismatch, insert null for companyId.
        const companyColumnIsUuid = (await prisma.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Task' AND column_name='companyId'`) as any
        let companyIdToInsert: string | null = null
        if (demoCompany?.id) {
          const isUuidColumn = companyColumnIsUuid && companyColumnIsUuid.length && (companyColumnIsUuid[0] as any).data_type === 'uuid'
          const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(demoCompany.id)
          companyIdToInsert = isUuidColumn && !looksLikeUuid ? null : demoCompany.id
        }
        const t1 = await prisma.task.create({ data: { tenantId: tenant.id, companyId: companyIdToInsert, title: 'Welcome: get started', description: 'A sample task for your demo tenant', status: 'PENDING', priority: 'MEDIUM', createdById: user.id } })
        await prisma.taskComment.create({ data: { taskId: t1.id, userId: user.id, comment: 'This is a demo comment' } })
      }
    }
  } catch (e) { console.warn('Skipping task seed; Task table may not exist yet', e) }
  // Create a sample CustomerCredit for demo (if table exists)
  try {
    await prisma.customerCredit.create({ data: { tenantId: tenant.id, companyId: demoCompany.id, customerId: contact.id, creditNumber: 'CRED-1001', total: 100.00, balance: 100.00, status: 'ISSUED' } })
    console.log('Seeded sample CustomerCredit (if migrations applied)')
  } catch (e) { /* safe ignore if table missing */ }

  // Seed basic governance and configuration for demo tenant
  try {
    await prisma.accountingPeriod.upsert({ where: { id: `period-${tenant.id}` }, update: {}, create: { id: `period-${tenant.id}`, tenantId: tenant.id, startDate: new Date(new Date().getFullYear(), 0, 1), endDate: new Date(new Date().getFullYear(), 11, 31), status: 'OPEN' } })
  } catch (e) {
    console.warn('Skipping accountingPeriod seed, table or column may not exist yet', e)
  }
  // Ensure 'ADMIN' role exists using fallback raw SQL for legacy DBs
  let role: any = await prisma.role.findFirst({ where: { tenantId: tenant.id, name: 'ADMIN' } }).catch(() => undefined as any)
  if (!role) {
    try {
      role = await prisma.role.create({ data: { tenantId: tenant.id, name: 'ADMIN' } })
    } catch (e) {
      console.warn('Prisma role.create failed, attempting raw INSERT (legacy DB)')
      await prisma.$executeRaw`INSERT INTO public."Role" ("tenantId","name") VALUES (${tenant.id}, ${'ADMIN'}) ON CONFLICT ("tenantId","name") DO NOTHING;`
      const roleColType = await prisma.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Role' AND column_name='tenantId'` as any
      const roleTenantIsUuid = roleColType && roleColType.length && (roleColType[0] as any).data_type === 'uuid'
      let rows: any[] = []
      if (roleTenantIsUuid) {
        rows = await prisma.$queryRaw`SELECT id, tenantId, name FROM public."Role" WHERE "tenantId" = CAST(${tenant.id} AS uuid) AND name = ${'ADMIN'} LIMIT 1;`
      } else {
        rows = await prisma.$queryRaw`SELECT id, tenantId, name FROM public."Role" WHERE CAST("tenantId" AS text) = ${tenant.id.toString()} AND name = ${'ADMIN'} LIMIT 1;`
      }
      role = rows && rows.length ? rows[0] : undefined
    }
  }
  const permissionHasKey = await hasColumn('Permission', 'key')
  let permission: any
  if (permissionHasKey) {
    permission = await prisma.permission.upsert({ where: { key: 'manage:all' }, update: {}, create: { key: 'manage:all', desc: 'Full access for admins' } }).catch(() => undefined as any)
    // Add recommended permissions for tasks and attachments
    await prisma.permission.upsert({ where: { key: 'tasks:read' }, update: {}, create: { key: 'tasks:read', desc: 'Read tasks' } }).catch(() => {})
    await prisma.permission.upsert({ where: { key: 'tasks:write' }, update: {}, create: { key: 'tasks:write', desc: 'Create/update tasks' } }).catch(() => {})
    await prisma.permission.upsert({ where: { key: 'attachments:upload' }, update: {}, create: { key: 'attachments:upload', desc: 'Upload attachments' } }).catch(() => {})
  } else {
    await prisma.$executeRaw`INSERT INTO public."Permission" ("key","desc") VALUES (${ 'manage:all' }, ${ 'Full access for admins' }) ON CONFLICT ("key") DO NOTHING;`
    const rows: any[] = await prisma.$queryRaw`SELECT key, desc FROM public."Permission" WHERE key = ${ 'manage:all' } LIMIT 1;`
    permission = rows && rows.length ? rows[0] : undefined
  }
  try {
    if (role && permission) {
      await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: permission.id } }).catch(() => {})
      // Attach recommended permissions to ADMIN role
      const perms = await prisma.permission.findMany({ where: { key: { in: ['tasks:read','tasks:write','attachments:upload'] } } })
      for (const p of perms) {
        await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: p.id } }).catch(() => {})
      }
    }
  } catch (e) { /* ignore errors in case of duplicate or type mismatch */ }

  // Update TenantUser record to reference roleId (use raw SQL if Prisma fails due to schema mismatch)
  if (role && role.id) {
    try {
      await prisma.tenantUser.update({ where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } }, data: { roleId: role.id } }).catch(() => {})
    } catch (e) {
      console.warn('tenantUser.update failed via Prisma; attempting raw SQL for legacy schema')
      const tuColType = await prisma.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='TenantUser' AND column_name='tenantId'` as any
      const tuTenantIsUuid = tuColType && tuColType.length && (tuColType[0] as any).data_type === 'uuid'
      if (tuTenantIsUuid) {
        await prisma.$executeRaw`UPDATE public."TenantUser" SET "roleId" = ${role.id} WHERE "tenantId" = CAST(${tenant.id} AS uuid) AND "userId" = ${user.id}`
      } else {
        await prisma.$executeRaw`UPDATE public."TenantUser" SET "roleId" = ${role.id} WHERE CAST("tenantId" AS text) = ${tenant.id.toString()} AND "userId" = ${user.id}`
      }
    }
  }

  // Create a demo TenantInvite (if migrations applied)
  try {
    await prisma.tenantInvite.create({ data: { tenantId: tenant.id, email: `invitee@demo-tenant.example`, roleId: role && role.id ? role.id : null, invitedBy: user.id, status: 'PENDING', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } })
    console.log('Seeded a sample TenantInvite (if migrations applied)')
  } catch (e) { /* ignore if migrations not applied or record exists */ }



  // Create some example AccountSubTypes for tenant (if not exists)
  const subtype1 = await prisma.accountSubType.findFirst({ where: { tenantId: tenant.id, name: 'CURRENT_ASSET', typeId: assetType.id } })
  if (!subtype1) {
    await prisma.accountSubType.create({ data: { tenantId: tenant.id, name: 'CURRENT_ASSET', typeId: assetType.id } })
  }
  const subtype2 = await prisma.accountSubType.findFirst({ where: { tenantId: tenant.id, name: 'FIXED_ASSET', typeId: assetType.id } })
  if (!subtype2) {
    await prisma.accountSubType.create({ data: { tenantId: tenant.id, name: 'FIXED_ASSET', typeId: assetType.id } })
  }

  // Payroll demo data (employee + pay schedule)
  // Use firstName+lastName for deterministic lookup in dev
  let employee = await prisma.employee.findFirst({ where: { tenantId: tenant.id, firstName: 'Jane', lastName: 'Doe' } })
  if (!employee) {
    employee = await prisma.employee.create({ data: { tenantId: tenant.id, firstName: 'Jane', lastName: 'Doe', ssnHash: await bcrypt.hash('123-45-6789', 10), hireDate: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), payRate: 35.00, payType: 'HOURLY' } })
  }

  let paySchedule = await prisma.paySchedule.findFirst({ where: { tenantId: tenant.id, name: 'Weekly' } })
  if (!paySchedule) paySchedule = await prisma.paySchedule.create({ data: { tenantId: tenant.id, name: 'Weekly', frequency: 'WEEKLY' } })

  console.log('Seeded demo employee and pay schedule')

  // Payroll default GL accounts (create if not present)
  await prisma.account.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: "SAL-EXP" } }, update: {}, create: { tenantId: tenant.id, code: "SAL-EXP", name: 'Salary Expense', typeId: expenseType.id } })
  await prisma.account.upsert({ where: { tenantId_code: { tenantId: tenant.id, code: "PAYROLL-LIAB" } }, update: {}, create: { tenantId: tenant.id, code: "PAYROLL-LIAB", name: 'Payroll Liabilities', typeId: 4 } })

  console.log('Seeded payroll accounts')

  // Seed basic tax rates (federal/state stub for payroll testing)
  let federalTax = await prisma.taxRate.findFirst({ where: { tenantId: tenant.id, jurisdiction: 'FEDERAL' } })
  if (!federalTax) {
    federalTax = await prisma.taxRate.create({ data: { tenantId: tenant.id, jurisdiction: 'FEDERAL', name: 'Federal Income Tax', rate: 0.10, effectiveFrom: new Date('2020-01-01') } })
  }
  let stateTax = await prisma.taxRate.findFirst({ where: { tenantId: tenant.id, jurisdiction: 'STATE' } })
  if (!stateTax) {
    stateTax = await prisma.taxRate.create({ data: { tenantId: tenant.id, jurisdiction: 'STATE', name: 'State Income Tax', rate: 0.05, effectiveFrom: new Date('2020-01-01') } })
  }
  console.log('Seeded basic tax rates')

  // Seed Time Tracking demo data (timesheet + entry + approval)
  // Create or find a demo project for timesheet entries
  let project = await prisma.project.findFirst({ where: { tenantId: tenant.id, name: 'Demo Project' } })
  if (!project) project = await prisma.project.create({ data: { tenantId: tenant.id, name: 'Demo Project' } })

  let demoTimesheet = await prisma.timesheet.findFirst({ where: { tenantId: tenant.id, employeeId: employee.id } })
  if (!demoTimesheet) {
    try {
      demoTimesheet = await prisma.timesheet.create({ data: { tenantId: tenant.id, employeeId: employee.id, weekStart: new Date(), status: 'DRAFT' } })
    } catch (e) {
      console.warn('Skipping timesheet seed, table or status column may not exist', e)
      demoTimesheet = await prisma.timesheet.create({ data: { tenantId: tenant.id, employeeId: employee.id, weekStart: new Date() } }).catch(() => undefined as any)
    }
  }

  // Create demo time entry (one day, 8 hours)
  if (demoTimesheet) {
    await prisma.timeEntry.createMany({ data: [ { tenantId: demoTimesheet.tenantId, timesheetId: demoTimesheet.id, employeeId: employee.id, projectId: project.id, date: new Date(), hours: 8.00, description: 'Demo timesheet entry' } ] }).catch(() => {})

    // Create an approval (simulate approved timesheet)
    await prisma.timesheetApproval.create({ data: { tenantId: demoTimesheet.tenantId, timesheetId: demoTimesheet.id, approverId: user.id, approvedAt: new Date(), comment: 'Approved for demo' } }).catch(() => {})

    console.log('Seeded demo timesheet, entry, and approval')
  } else {
    console.warn('Skipping timesheet entry and approval seeds; timesheet not created')
  }

  // Seed demo budget and lines
  // Create or find demo budget
  let demoBudget = await prisma.budget.findFirst({ where: { tenantId: tenant.id, name: 'Demo Operating Budget' } })
  if (!demoBudget) {
    try {
      demoBudget = await prisma.budget.create({ data: { tenantId: tenant.id, name: 'Demo Operating Budget', scenario: 'BUDGET', status: 'APPROVED', fiscalYear: new Date().getFullYear(), totalAmount: 120000.00 } })
    } catch (e) {
      console.warn('Skipping budget seed, budget table or status column may not exist', e)
      demoBudget = await prisma.budget.create({ data: { tenantId: tenant.id, name: 'Demo Operating Budget', scenario: 'BUDGET', fiscalYear: new Date().getFullYear(), totalAmount: 120000.00 } }).catch(() => undefined as any)
    }
  }

  // Create demo budget lines
  if (demoBudget) {
    await prisma.budgetLine.createMany({ data: [
      { budgetId: demoBudget.id, tenantId: tenant.id, accountId: rev.id, month: 1, amount: 10000.00 },
      { budgetId: demoBudget.id, tenantId: tenant.id, accountId: rev.id, month: 2, amount: 12000.00 }
    ] }).catch(() => { /* ignore duplicate insert errors during seed */ })

    console.log('Seeded demo budget and lines')
  } else {
    console.warn('Skipping demo budget lines; demoBudget not created')
  }

  // Seed fixed asset category and an example asset
  // Create or find fixed asset category
  let fac = await prisma.fixedAssetCategory.findFirst({ where: { tenantId: tenant.id, name: 'Office Equipment' } })
  if (!fac) {
    fac = await prisma.fixedAssetCategory.create({ data: { tenantId: tenant.id, name: 'Office Equipment' } })
  }

  // Create or find asset
  let asset = await prisma.fixedAsset.findFirst({ where: { tenantId: tenant.id, name: 'Laptop - Demo' } })
  if (!asset) {
    asset = await prisma.fixedAsset.create({ data: { tenantId: tenant.id, categoryId: fac.id, name: 'Laptop - Demo', acquisitionDate: new Date(), cost: 2500.00, salvageValue: 200.00, usefulLifeMonths: 36, assetAccountId: invSuspense.id } })
  }

  // Create a sample depreciation entry (first month)
  await prisma.fixedAssetDepreciation.createMany({ data: [ { tenantId: tenant.id, assetId: asset.id, periodStart: new Date(), periodEnd: new Date(Date.now() + 30*24*60*60*1000), amount: 68.89 } ] }).catch(() => {})

  console.log('Seeded fixed asset and depreciation')

  // Seed default permissions for RBAC system
  await seedPermissions()

  // Seed default roles for demo tenant
  await seedDefaultRolesForTenant(tenant.id)
}

// Seed global permissions (tenant-agnostic)
async function seedPermissions() {
  const permissions = [
    // User management
    { key: 'users.view', desc: 'View users' },
    { key: 'users.create', desc: 'Create users' },
    { key: 'users.edit', desc: 'Edit users' },
    { key: 'users.delete', desc: 'Delete users' },
    { key: 'users.invite', desc: 'Invite users to tenant' },

    // Role management
    { key: 'roles.view', desc: 'View roles' },
    { key: 'roles.create', desc: 'Create roles' },
    { key: 'roles.edit', desc: 'Edit roles' },
    { key: 'roles.delete', desc: 'Delete roles' },

    // Company management
    { key: 'companies.view', desc: 'View companies' },
    { key: 'companies.create', desc: 'Create companies' },
    { key: 'companies.edit', desc: 'Edit companies' },
    { key: 'companies.delete', desc: 'Delete companies' },

    // Accounting - Invoices
    { key: 'invoices.view', desc: 'View invoices' },
    { key: 'invoices.create', desc: 'Create invoices' },
    { key: 'invoices.edit', desc: 'Edit invoices' },
    { key: 'invoices.delete', desc: 'Delete invoices' },
    { key: 'invoices.approve', desc: 'Approve invoices' },
    { key: 'invoices.send', desc: 'Send invoices' },

    // Accounting - Bills
    { key: 'bills.view', desc: 'View bills' },
    { key: 'bills.create', desc: 'Create bills' },
    { key: 'bills.edit', desc: 'Edit bills' },
    { key: 'bills.delete', desc: 'Delete bills' },
    { key: 'bills.approve', desc: 'Approve bills' },

    // Accounting - Payments
    { key: 'payments.view', desc: 'View payments' },
    { key: 'payments.create', desc: 'Create payments' },
    { key: 'payments.edit', desc: 'Edit payments' },
    { key: 'payments.delete', desc: 'Delete payments' },

    // Accounting - Journal Entries
    { key: 'journal.view', desc: 'View journal entries' },
    { key: 'journal.create', desc: 'Create journal entries' },
    { key: 'journal.edit', desc: 'Edit journal entries' },
    { key: 'journal.delete', desc: 'Delete journal entries' },

    // Bank accounts
    { key: 'bank.view', desc: 'View bank accounts' },
    { key: 'bank.connect', desc: 'Connect bank accounts' },
    { key: 'bank.reconcile', desc: 'Reconcile bank transactions' },

    // Reports
    { key: 'reports.view', desc: 'View reports' },
    { key: 'reports.export', desc: 'Export reports' },
    { key: 'reports.advanced', desc: 'Access advanced reports' },

    // Settings
    { key: 'settings.view', desc: 'View settings' },
    { key: 'settings.edit', desc: 'Edit settings' },
    { key: 'settings.tenant', desc: 'Manage tenant settings' },

    // Audit logs
    { key: 'audit.view', desc: 'View audit logs' },
  ];

  console.log('📝 Seeding permissions...');
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { desc: perm.desc },
      create: perm,
    });
  }
  console.log(`✅ Created ${permissions.length} permissions`);
}

// Helper function to create default roles for a tenant
export async function seedDefaultRolesForTenant(tenantId: string) {
  const permissions = await prisma.permission.findMany();
  const permissionMap = new Map(permissions.map((p) => [p.key, p.id]));

  const roleTemplates = [
    {
      name: 'Owner',
      permissionKeys: permissions.map((p) => p.key), // All permissions
    },
    {
      name: 'Admin',
      permissionKeys: permissions
        .filter((p) => !p.key.startsWith('settings.tenant'))
        .map((p) => p.key),
    },
    {
      name: 'Bookkeeper',
      permissionKeys: [
        'companies.view',
        'invoices.view',
        'invoices.create',
        'invoices.edit',
        'invoices.send',
        'bills.view',
        'bills.create',
        'bills.edit',
        'payments.view',
        'payments.create',
        'payments.edit',
        'journal.view',
        'journal.create',
        'journal.edit',
        'bank.view',
        'bank.reconcile',
        'reports.view',
        'reports.export',
      ],
    },
    {
      name: 'Viewer',
      permissionKeys: [
        'companies.view',
        'invoices.view',
        'bills.view',
        'payments.view',
        'journal.view',
        'bank.view',
        'reports.view',
      ],
    },
  ];

  console.log(`📋 Creating default roles for tenant ${tenantId}...`);
  
  for (const template of roleTemplates) {
    // Check if role already exists
    let role = await prisma.role.findFirst({
      where: { tenantId, name: template.name }
    });

    if (!role) {
      try {
        role = await prisma.role.create({
          data: {
            tenantId,
            name: template.name,
          },
        });
        console.log(`   ✓ Created role: ${template.name}`);
      } catch (e) {
        // Fallback for legacy DBs with tenantId_old non-NULL constraint: insert via raw SQL.
        try {
          const { randomUUID } = await import('crypto')
          const roleId = randomUUID()
          const rows: any[] = await prisma.$queryRawUnsafe(
            `INSERT INTO public."Role" ("id","tenantId","name","tenantId_old") VALUES ($1::uuid,$2::uuid,$3,$4) RETURNING *`,
            roleId,
            tenantId,
            template.name,
            tenantId,
          )
          role = rows && rows.length ? rows[0] : null
          if (role) console.log(`   ✓ Created role (raw): ${template.name}`)
        } catch (e2) {
          // If fallback fails, log and continue; this is non-fatal for the tenant create flow.
          console.warn('role creation fallback failed', e2?.message)
        }
      }
    }

    // Create role permissions (only if role creation succeeded)
    if (role) {
      for (const permKey of template.permissionKeys) {
        const permId = permissionMap.get(permKey);
        if (permId) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permId,
              }
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permId,
            },
          }).catch(() => {
            // Ignore duplicates
          });
        }
      }
    } else {
      console.warn(`Skipping rolePermission creation: role not created for tenant ${tenantId} and template ${template.name}`)
    }
  }

  console.log(`✅ Default roles created for tenant ${tenantId}`);
}

if (require.main === module) {
  main()
    .catch(async (e) => { console.error(e); process.exitCode = 1; })
    .finally(async () => { await prisma.$disconnect(); })
}
