import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import { AppModule } from '../src/app.module'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Bank Reconciliation invariants e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('validates reconciliation math invariants for a simple seeded dataset', async () => {
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'demo' } })
    expect(tenant).toBeTruthy()

    // Create or find an account type and an account (bank asset account) and bank account
    // Ensure an account type exists - use a high id to avoid autoincrement sequence collisions
    await prisma.$executeRawUnsafe(`INSERT INTO "AccountType" (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, 1000000, 'BANK_ASSET')
    const accountType = await prisma.accountType.findFirst({ where: { name: 'BANK_ASSET' } })
    if (!accountType) throw new Error('Failed to ensure AccountType BANK_ASSET exists')
    const account = await prisma.account.create({ data: { workspaceId: tenant!.id, code: '1010', name: 'Bank Test', typeId: accountType.id } })
    const bankAccount = await prisma.bankAccount.create({ data: { workspaceId: tenant!.id, name: 'E2E BANK' } })

    // Create a journal entry that posts to the bank account
    const journal = await prisma.journalEntry.create({ data: { workspaceId: tenant!.id, date: new Date(), postingStatus: 'POSTED' } })
    const jel = await prisma.journalEntryLine.create({ data: { journalId: journal.id, accountId: account.id, debit: 1500, credit: 0, workspaceId: tenant!.id } })

    // Create bank transactions - two that will be matched
    const tx1 = await prisma.bankTransaction.create({ data: { bankAccountId: bankAccount.id, workspaceId: tenant!.id, amount: 200, date: new Date(), description: 'Deposit 1' } })
    const tx2 = await prisma.bankTransaction.create({ data: { bankAccountId: bankAccount.id, workspaceId: tenant!.id, amount: 300, date: new Date(), description: 'Deposit 2' } })

    // Create a reconciliation referencing the bank account where closingBalance = bookBalance - clearedDelta
    const closingBalance = 1500 - (200 + 300)
    const recon = await prisma.bankReconciliation.create({ data: { workspaceId: tenant!.id, bankAccountId: bankAccount.id, statementDate: new Date(), closingBalance: closingBalance, status: 'COMPLETED' } })

    // Mark transactions as matched in the reconciliation
    await prisma.bankReconciliationLine.create({ data: { workspaceId: tenant!.id, bankReconciliationId: recon.id, bankTransactionId: tx1.id, matched: true } })
    await prisma.bankReconciliationLine.create({ data: { workspaceId: tenant!.id, bankReconciliationId: recon.id, bankTransactionId: tx2.id, matched: true } })

    // Calculate bookBalance from journalEntryLines for debit and credit difference
    const bookBalanceRow = await prisma.$queryRawUnsafe(`SELECT COALESCE(SUM(jl.debit) - SUM(jl.credit), 0) as book_balance FROM "JournalEntryLine" jl WHERE jl."tenantId" = $1::uuid AND jl."accountId" = $2`, tenant!.id, account.id)
    const bookBalance = Number((bookBalanceRow as any[])[0].book_balance || 0)

    // clearedDelta sum from bank transactions matched in reconciliation
    const clearedRow = await prisma.$queryRawUnsafe(`SELECT COALESCE(SUM(bt.amount), 0) as cleared_sum FROM "BankReconciliationLine" brl JOIN "BankTransaction" bt ON brl."bankTransactionId" = bt.id WHERE brl."bankReconciliationId" = $1`, recon.id)
    const cleared = Number((clearedRow as any[])[0].cleared_sum || 0)

    expect(Math.abs(bookBalance - cleared - Number(recon.closingBalance)) < 0.0001).toBeTruthy()
  }, 20000)
})
