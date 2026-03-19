/**
 * End-to-end accounting GL integration test.
 *
 * Verifies the full cycle:
 *   1. Customer → Invoice → Send (JE: Dr AR, Cr Revenue) → verify GL balances
 *   2. Record Payment (JE: Dr Cash, Cr AR) → verify GL balances
 *   3. Vendor → Bill → Approve (JE: Dr Expense, Cr AP) → verify GL balances
 *   4. Bill Payment (JE: Dr AP, Cr Cash) → verify GL balances
 *   5. Void invoice → reversing JE → verify GL balances revert
 *   6. Trial Balance consistency checks
 */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('GL Integration end-to-end', () => {
    let app: INestApplication
    let prisma: PrismaClient
    let companyId: string
    let workspaceId: string
    let userId: string
    let token: string

    // Account codes to verify
    const ACCOUNTS = {
        CASH: '1000',
        AR: '1100',
        AP: '2000',
        REVENUE: '4000',
        EXPENSE: '5000',
    }

    beforeAll(async () => {
        process.env.DATABASE_URL =
            'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

        execSync('node ./scripts/test/setup-test-db.js --recreate', {
            cwd: BACKEND_DIR,
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
        })

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()
        app = moduleFixture.createNestApplication()
        app.setGlobalPrefix('api')
        await app.init()

        prisma = new PrismaClient()

        // Create test user first (workspace requires ownerUserId)
        const user = await prisma.user.create({
            data: {
                name: 'GL Tester',
                email: `gl-test-${Date.now()}@test.com`,
                password: 'noop',
            },
        })
        userId = user.id

        // Create workspace owned by user
        const workspace = await prisma.workspace.create({
            data: { ownerUserId: userId },
        })
        workspaceId = workspace.id

        // Create role for workspace
        const role = await prisma.role.create({
            data: { workspaceId, name: 'OWNER' },
        })

        await prisma.workspaceUser.create({
            data: { workspaceId, userId, roleId: role.id, isOwner: true },
        })

        const company = await prisma.company.create({
            data: {
                workspaceId,
                name: 'GL Test Co',
                industry: 'TEST',
                currency: 'PHP',
            },
        })
        companyId = company.id

        // Ensure account types exist
        for (const [id, name, ns] of [
            [1, 'ASSET', 'DEBIT'],
            [2, 'EXPENSE', 'DEBIT'],
            [3, 'INCOME', 'CREDIT'],
            [4, 'LIABILITY', 'CREDIT'],
            [5, 'EQUITY', 'CREDIT'],
        ] as [number, string, string][]) {
            await prisma.accountType.upsert({
                where: { id },
                update: { normalSide: ns as any },
                create: { id, name, normalSide: ns as any },
            })
        }
    }, 90000)

    afterAll(async () => {
        await app?.close()
        await prisma?.$disconnect()
    })

    // ─── Helpers ──────────────────────────────────────────────────────────────

    async function getAccountBalance(code: string): Promise<number> {
        const acct = await prisma.account.findUnique({
            where: { companyId_code: { companyId, code } },
        })
        return acct ? Number(acct.balance) : 0
    }

    async function getJournalEntriesFor(sourceTable: string, sourceId: string) {
        // Check JE linked via FK
        if (sourceTable === 'invoice') {
            const inv = await prisma.invoice.findUnique({
                where: { id: sourceId },
                include: { journalEntry: { include: { lines: true } } },
            })
            return inv?.journalEntry
        }
        if (sourceTable === 'bill') {
            const bill = await prisma.bill.findUnique({
                where: { id: sourceId },
                include: { journalEntry: { include: { lines: true } } },
            })
            return bill?.journalEntry
        }
        if (sourceTable === 'paymentReceived') {
            const pay = await prisma.paymentReceived.findUnique({
                where: { id: sourceId },
                include: { journalEntry: { include: { lines: true } } },
            })
            return pay?.journalEntry
        }
        if (sourceTable === 'billPayment') {
            const bp = await prisma.billPayment.findUnique({
                where: { id: sourceId },
                include: { journalEntry: { include: { lines: true } } },
            })
            return bp?.journalEntry
        }
        return null
    }

    // ─── AR Tests ─────────────────────────────────────────────────────────────

    let customerId: string
    let invoiceId: string

    it('creates a customer', async () => {
        const customer = await prisma.contact.create({
            data: {
                workspaceId,
                type: 'CUSTOMER',
                displayName: 'GL Test Customer',
            },
        })
        const cust = await prisma.customer.create({
            data: { workspaceId, contactId: customer.id },
        })
        customerId = cust.contactId
        expect(customerId).toBeDefined()
    })

    it('creates and sends an invoice → JE posted (Dr AR, Cr Revenue)', async () => {
        const arBefore = await getAccountBalance(ACCOUNTS.AR)
        const revBefore = await getAccountBalance(ACCOUNTS.REVENUE)

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                workspaceId,
                companyId,
                customerId,
                totalAmount: 10000,
                balance: 10000,
                currency: 'PHP',
                status: 'DRAFT',
                postingStatus: 'DRAFT',
                createdById: userId,
                lines: {
                    create: [
                        {
                            companyId,
                            workspaceId,
                            description: 'Test service',
                            quantity: 1,
                            unitPrice: 10000,
                            totalPrice: 10000,
                        },
                    ],
                },
            },
        })
        invoiceId = invoice.id

        // Send invoice (triggers GL)
        // Use repository directly since we don't have JWT auth in this test
        const { ArRepository } = require('../src/ar/ar.repository')
        const arRepo = new ArRepository(prisma)
        const sent = await arRepo.sendInvoice(companyId, invoiceId)

        expect(sent).not.toBeNull()
        expect(sent.status).toBe('SENT')
        expect(sent.journalEntryId).toBeTruthy()
        expect(sent.postingStatus).toBe('POSTED')

        // Verify GL balances changed
        const arAfter = await getAccountBalance(ACCOUNTS.AR)
        const revAfter = await getAccountBalance(ACCOUNTS.REVENUE)

        expect(arAfter - arBefore).toBeCloseTo(10000, 2)
        expect(revAfter - revBefore).toBeCloseTo(10000, 2)

        // Verify JE structure
        const je = await getJournalEntriesFor('invoice', invoiceId)
        expect(je).not.toBeNull()
        expect(je!.postingStatus).toBe('POSTED')
        expect(je!.lines).toHaveLength(2)

        const debitLine = je!.lines.find((l: any) => Number(l.debit) > 0)
        const creditLine = je!.lines.find((l: any) => Number(l.credit) > 0)
        expect(Number(debitLine!.debit)).toBeCloseTo(10000, 2)
        expect(Number(creditLine!.credit)).toBeCloseTo(10000, 2)
    })

    it('records a payment → JE posted (Dr Cash, Cr AR)', async () => {
        const cashBefore = await getAccountBalance(ACCOUNTS.CASH)
        const arBefore = await getAccountBalance(ACCOUNTS.AR)

        const { ArRepository } = require('../src/ar/ar.repository')
        const arRepo = new ArRepository(prisma)

        const payment = await arRepo.recordPayment({
            workspaceId,
            companyId,
            customerId,
            amount: 10000,
            paymentDate: new Date(),
            createdById: userId,
            applications: [{ invoiceId, amount: 10000 }],
        })

        expect(payment).toBeDefined()
        expect(payment.journalEntryId).toBeTruthy()

        // Verify GL
        const cashAfter = await getAccountBalance(ACCOUNTS.CASH)
        const arAfter = await getAccountBalance(ACCOUNTS.AR)

        expect(cashAfter - cashBefore).toBeCloseTo(10000, 2)
        expect(arBefore - arAfter).toBeCloseTo(10000, 2) // AR decreased

        // Verify invoice is now PAID
        const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } })
        expect(Number(inv!.balance)).toBeCloseTo(0, 2)
    })

    // ─── AP Tests ─────────────────────────────────────────────────────────────

    let vendorContactId: string
    let billId: string

    it('creates a vendor', async () => {
        const contact = await prisma.contact.create({
            data: { workspaceId, type: 'VENDOR', displayName: 'GL Test Vendor' },
        })
        const vendor = await prisma.vendor.create({
            data: { workspaceId, contactId: contact.id },
        })
        vendorContactId = vendor.contactId
        expect(vendorContactId).toBeDefined()
    })

    it('creates and approves a bill → JE posted (Dr Expense, Cr AP)', async () => {
        const expBefore = await getAccountBalance(ACCOUNTS.EXPENSE)
        const apBefore = await getAccountBalance(ACCOUNTS.AP)

        // Create bill
        const bill = await prisma.bill.create({
            data: {
                workspaceId,
                companyId,
                vendorId: vendorContactId,
                total: 5000,
                balance: 5000,
                currency: 'PHP',
                status: 'DRAFT',
                postingStatus: 'DRAFT',
                createdById: userId,
                lines: {
                    create: [
                        {
                            companyId,
                            workspaceId,
                            description: 'Office supplies',
                            quantity: 1,
                            rate: 5000,
                            amount: 5000,
                        },
                    ],
                },
            },
        })
        billId = bill.id

        // Approve bill (triggers GL)
        const { ApRepository } = require('../src/ap/ap.repository')
        const apRepo = new ApRepository(prisma)
        const approved = await apRepo.approveBill(companyId, billId)

        expect(approved).not.toBeNull()
        expect(approved.status).toBe('APPROVED')
        expect(approved.journalEntryId).toBeTruthy()
        expect(approved.postingStatus).toBe('POSTED')

        // Verify GL
        const expAfter = await getAccountBalance(ACCOUNTS.EXPENSE)
        const apAfter = await getAccountBalance(ACCOUNTS.AP)

        expect(expAfter - expBefore).toBeCloseTo(5000, 2)
        expect(apAfter - apBefore).toBeCloseTo(5000, 2) // AP increased
    })

    it('records a bill payment → JE posted (Dr AP, Cr Cash)', async () => {
        const apBefore = await getAccountBalance(ACCOUNTS.AP)
        const cashBefore = await getAccountBalance(ACCOUNTS.CASH)

        const { ApRepository } = require('../src/ap/ap.repository')
        const apRepo = new ApRepository(prisma)

        const payment = await apRepo.recordBillPayment({
            workspaceId,
            companyId,
            billId,
            amount: 5000,
            paymentDate: new Date(),
            method: 'BANK_TRANSFER',
            createdById: userId,
            applications: [{ billId, amount: 5000 }],
        })

        expect(payment).toBeDefined()
        expect(payment.journalEntryId).toBeTruthy()

        // Verify GL
        const apAfter = await getAccountBalance(ACCOUNTS.AP)
        const cashAfter = await getAccountBalance(ACCOUNTS.CASH)

        expect(apBefore - apAfter).toBeCloseTo(5000, 2)   // AP decreased
        expect(cashBefore - cashAfter).toBeCloseTo(5000, 2) // Cash decreased

        // Verify bill is now PAID
        const bill = await prisma.bill.findUnique({ where: { id: billId } })
        expect(Number(bill!.balance)).toBeCloseTo(0, 2)
    })

    // ─── Void Tests ───────────────────────────────────────────────────────────

    it('voiding an invoice creates a reversing JE', async () => {
        // Create a new invoice to void
        const inv2 = await prisma.invoice.create({
            data: {
                workspaceId, companyId, customerId,
                totalAmount: 3000, balance: 3000, currency: 'PHP',
                status: 'DRAFT', postingStatus: 'DRAFT', createdById: userId,
                lines: {
                    create: [{
                        companyId, workspaceId,
                        description: 'Voidable service', quantity: 1, unitPrice: 3000, totalPrice: 3000,
                    }],
                },
            },
        })

        const { ArRepository } = require('../src/ar/ar.repository')
        const arRepo = new ArRepository(prisma)

        // Send it first
        await arRepo.sendInvoice(companyId, inv2.id)
        const arAfterSend = await getAccountBalance(ACCOUNTS.AR)

        // Now void it
        const voided = await arRepo.voidInvoice(companyId, inv2.id)
        expect(voided).not.toBeNull()
        expect(voided.status).toBe('VOID')
        expect(voided.postingStatus).toBe('VOIDED')

        // AR should be back to pre-send level
        const arAfterVoid = await getAccountBalance(ACCOUNTS.AR)
        expect(arAfterSend - arAfterVoid).toBeCloseTo(3000, 2)
    })

    // ─── Trial Balance ───────────────────────────────────────────────────────

    it('trial balance is balanced (total debits = total credits)', async () => {
        const { AccountingRepository } = require('../src/accounting/accounting.repository')
        const acctRepo = new AccountingRepository(prisma)

        const rows = await acctRepo.getTrialBalance(companyId)
        let totalDebits = 0
        let totalCredits = 0
        for (const row of rows) {
            totalDebits += Number(row.debit)
            totalCredits += Number(row.credit)
        }

        // Trial balance must be balanced
        expect(Math.abs(totalDebits - totalCredits)).toBeLessThan(0.01)
    })

    it('trial balance asOf works (date-filtered)', async () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const { AccountingRepository } = require('../src/accounting/accounting.repository')
        const acctRepo = new AccountingRepository(prisma)

        // asOf yesterday should return fewer or equal balances vs current
        const rowsAsOf = await acctRepo.getTrialBalance(companyId, yesterday)
        expect(Array.isArray(rowsAsOf)).toBe(true)
    })
})
