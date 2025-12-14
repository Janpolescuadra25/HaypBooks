import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })

const prisma = new PrismaClient()

async function hasColumn(table: string, column: string) {
  const res: Array<{ exists: boolean }> = await prisma.$queryRaw`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=${table} AND column_name=${column}) as exists` as any
  return res[0]?.exists === true
}

async function main() {
  console.log('Seeding database...')

  // Demo user
  const passwordHash = await bcrypt.hash('password', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@haypbooks.test' },
    update: {},
    create: {
      email: 'demo@haypbooks.test',
      name: 'Demo User',
      password: passwordHash,
      isEmailVerified: true,
    },
  })

  // Demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Tenant',
      subdomain: 'demo',
      baseCurrency: 'USD'
    },
  })

  // Link user to tenant (owner)
  const tenantUserHasStatus = await hasColumn('TenantUser', 'status')
  const tenantUserHasRoleId = await hasColumn('TenantUser', 'roleId')
  const tenantUserHasInvitedBy = await hasColumn('TenantUser', 'invitedBy')
  if (tenantUserHasStatus && tenantUserHasRoleId && tenantUserHasInvitedBy) {
    await prisma.tenantUser.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: {},
      create: { tenantId: tenant.id, userId: user.id, role: 'ADMIN', isOwner: true }
    })
  } else {
    // Use raw upsert when DB doesn't have schema column yet (avoid Prisma selecting missing columns)
    await prisma.$executeRaw`INSERT INTO public."TenantUser" ("tenantId","userId","role","isOwner","joinedAt") VALUES (${tenant.id}, ${user.id}, 'ADMIN', true, now()) ON CONFLICT ("tenantId","userId") DO UPDATE SET "role" = EXCLUDED."role", "isOwner" = EXCLUDED."isOwner";`
  }

    // Create a default company for the demo tenant
    const companyHasTenantId = await hasColumn('Company', 'tenantId')
    let demoCompany: any
    if (companyHasTenantId) {
      // Use composite unique by tenantId + name to avoid non-UUID id usage
      demoCompany = await prisma.company.upsert({ where: { tenantId_name: { tenantId: tenant.id, name: 'Demo Company' } }, update: {}, create: { tenantId: tenant.id, name: 'Demo Company' } })
    } else {
      // Older DB without tenantId on Company: insert id+name and select
      await prisma.$executeRaw`INSERT INTO public."Company" ("id","name") VALUES (${`company-${tenant.id}`}, ${'Demo Company'}) ON CONFLICT ("id") DO NOTHING;`
      const rows: any[] = await prisma.$queryRaw`SELECT id, name FROM public."Company" WHERE id = ${`company-${tenant.id}`} LIMIT 1;`
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
      const rows: any[] = await prisma.$queryRaw`SELECT id, tenantId, name FROM public."Role" WHERE tenantId = ${tenant.id} AND name = ${'ADMIN'} LIMIT 1;`
      role = rows && rows.length ? rows[0] : undefined
    }
  }
  const permissionHasKey = await hasColumn('Permission', 'key')
  let permission: any
  if (permissionHasKey) {
    permission = await prisma.permission.upsert({ where: { key: 'manage:all' }, update: {}, create: { key: 'manage:all', desc: 'Full access for admins' } }).catch(() => undefined as any)
  } else {
    await prisma.$executeRaw`INSERT INTO public."Permission" ("key","desc") VALUES (${`manage:all`}, ${`Full access for admins`}) ON CONFLICT ("key") DO NOTHING;`
    const rows: any[] = await prisma.$queryRaw`SELECT key, desc FROM public."Permission" WHERE key = ${`manage:all`} LIMIT 1;`
    permission = rows && rows.length ? rows[0] : undefined
  }
  try {
    if (role && permission) {
      await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: permission.id } }).catch(() => {})
    }
  } catch (e) { /* ignore errors in case of duplicate or type mismatch */ }

  // Update TenantUser record to reference roleId (use raw SQL if Prisma fails due to schema mismatch)
  if (role && role.id) {
    try {
      await prisma.tenantUser.update({ where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } }, data: { roleId: role.id } }).catch(() => {})
    } catch (e) {
      console.warn('tenantUser.update failed via Prisma; attempting raw SQL for legacy schema')
      await prisma.$executeRaw`UPDATE public."TenantUser" SET "roleId" = ${role.id} WHERE "tenantId" = ${tenant.id} AND "userId" = ${user.id}`
    }
  }

  // Create a demo TenantInvite (if migrations applied)
  try {
    await prisma.tenantInvite.create({ data: { tenantId: tenant.id, email: `invitee@${tenant.subdomain}.example`, roleId: role && role.id ? role.id : null, invitedBy: user.id, status: 'PENDING', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } })
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
}

main()
  .catch(async (e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); })
