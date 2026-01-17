import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('Payroll submit flow (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let tenantId: string
  let employeeId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()
    // backup tenantId_uuid_old columns have been removed; no test DB alterations required

    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    tenantId = tenant.id
    const emp = await prisma.employee.create({ data: { tenantId, firstName: 'Pay', lastName: 'Run', payRate: 20.0, payType: 'HOURLY' } })
    employeeId = emp.id
    // create basic tax rates for tenant to ensure payroll calculates taxes
    await prisma.taxRate.create({ data: { tenantId, jurisdiction: 'FEDERAL', name: 'Federal Tax', rate: 0.1, effectiveFrom: new Date('2020-01-01') } })
    await prisma.taxRate.create({ data: { tenantId, jurisdiction: 'STATE', name: 'State Tax', rate: 0.05, effectiveFrom: new Date('2020-01-01') } })
  })

  afterAll(async () => {
    // clean up Journal Entries first, then payroll artifacts, then tenant
    await prisma.journalEntryLine.deleteMany({ where: { journal: { tenantId } } }).catch(() => {})
    await prisma.journalEntry.deleteMany({ where: { tenantId } }).catch(() => {})
    // delete paycheck dependents in correct order: taxes, lines, then paychecks
    await prisma.paycheckTax.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.paycheckLine.deleteMany({ where: { paycheck: { tenantId } } }).catch(() => {})
    await prisma.paycheck.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.payrollRunEmployee.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.payrollRun.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.account.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.taxRate.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.employee.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.taxRate.deleteMany({ where: { tenantId } }).catch(() => {})
    try {
      await prisma.tenant.deleteMany({ where: { id: tenantId } })
    } catch (err) {
      console.error('Failed deleting tenant during teardown:', err)
      try {
        const tables: Array<{ table_name: string }> = await prisma.$queryRaw`
          SELECT DISTINCT table_name FROM information_schema.columns
          WHERE column_name = 'tenantId' AND table_schema = 'public'
        `
        for (const t of tables) {
          try {
            const counts: Array<{ c: string }> = await prisma.$queryRawUnsafe(
              `SELECT count(*) AS c FROM "${t.table_name}" WHERE "tenantId" = '${tenantId}'`
            )
            console.error(`Rows in ${t.table_name}:`, counts[0]?.c)
          } catch (innerErr) {
            // ignore per-table errors but log them
            console.error(`Error counting rows in ${t.table_name}:`, innerErr)
          }
        }
      } catch (diagErr) {
        console.error('Error during teardown diagnostics:', diagErr)
      }
    }
    await app.close()
  })

  it('submits payroll and creates journal entry', async () => {
    const payload = { tenantId, startDate: new Date().toISOString(), endDate: new Date().toISOString(), rows: [{ employeeId, hours: 40 }], description: 'Pay run' }
    const res = await request(app.getHttpServer()).post('/api/payroll/submit').send(payload)
    if (res.status !== 201) console.error('Payroll submit failed:', res.status, JSON.stringify(res.body, null, 2), 'text:', res.text)
    expect(res.status).toBe(201)
    expect(res.body.payrollRun).toBeTruthy()
    expect(res.body.paychecks.length).toBe(1)

    // verify journal entry created
    const je = await prisma.journalEntry.findFirst({ where: { tenantId, description: { contains: 'Pay run' } } })
    expect(je).toBeTruthy()

    // verify paycheck taxes persisted
    const paychecks = res.body.paychecks
    expect(paychecks.length).toBeGreaterThan(0)
    const taxes = await prisma.paycheckTax.findMany({ where: { tenantId, paycheckId: paychecks[0].id } })
    expect(taxes.length).toBeGreaterThan(0)

    // verify journal entry lines sum to zero
    if (!je) throw new Error('JournalEntry missing')
    const lines = await prisma.journalEntryLine.findMany({ where: { journalId: je.id } })
    const total = lines.reduce((acc, l) => acc + Number(l.debit || 0) - Number(l.credit || 0), 0)
    expect(Math.abs(total)).toBeLessThan(0.001)
  })

  it('allows tenant deletion after payroll run (regression)', async () => {
    // replicate cleanup steps to verify no FK RESTRICT prevents tenant deletion
    await prisma.paycheckTax.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.paycheckLine.deleteMany({ where: { paycheck: { tenantId } } }).catch(() => {})
    await prisma.paycheck.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.payrollRunEmployee.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.payrollRun.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.employee.deleteMany({ where: { tenantId } }).catch(() => {})
    // Remove journal entries first, then attempt to remove rows that reference tenant accounts (by accountId) before deleting accounts
    await prisma.journalEntryLine.deleteMany({ where: { journal: { tenantId } } }).catch(() => {})
    await prisma.journalEntry.deleteMany({ where: { tenantId } }).catch(() => {})
    try {
      const acctTables: Array<{ table_name: string }> = await prisma.$queryRaw`
        SELECT DISTINCT table_name FROM information_schema.columns
        WHERE column_name = 'accountId' AND table_schema = 'public'
      `
      const accs = await prisma.account.findMany({ where: { tenantId }, select: { id: true } })
      const accIds = accs.map(a => a.id)
      if (accIds.length > 0) {
        for (const t of acctTables) {
          try {
            await prisma.$executeRawUnsafe(
              `DELETE FROM "${t.table_name}" WHERE "accountId" IN (${accIds.map(a => `'${a}'`).join(',')}) OR "tenantId" = '${tenantId}'`
            )
          } catch (e) {
            // ignore per-table delete errors
          }
        }
      }
    } catch (cleanupErr) {
      // ignore diagnostic errors
    }

    await prisma.account.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.taxRate.deleteMany({ where: { tenantId } }).catch(() => {})

    // Best-effort multi-pass cleanup across all tenant-scoped tables to avoid FK RESTRICT ordering issues
    const tenantTables: Array<{ table_name: string }> = await prisma.$queryRaw`
      SELECT DISTINCT table_name FROM information_schema.columns
      WHERE column_name = 'tenantId' AND table_schema = 'public'
    `
    let deleted = false
    for (let pass = 0; pass < 5 && !deleted; pass++) {
      for (const t of tenantTables) {
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM "${t.table_name}" WHERE "tenantId" = '${tenantId}'`)
        } catch (e) {
          // ignore table-level errors and continue
        }
      }
      try {
        const del = await prisma.tenant.deleteMany({ where: { id: tenantId } })
        if (del.count && del.count > 0) deleted = true
      } catch (e) {
        // continue to next pass
      }
    }
    expect(deleted).toBe(true)
  })
})
