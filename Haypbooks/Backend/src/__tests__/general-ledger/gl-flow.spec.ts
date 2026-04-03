import { ForbiddenException } from '@nestjs/common'
import { GeneralLedgerService } from '../../general-ledger/general-ledger.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRow(
    debit: number,
    credit: number,
    normalSide: 'DEBIT' | 'CREDIT',
    accountId = 'a1',
    idx = 0,
) {
    return {
        id: `line-${idx}`,
        accountId,
        description: null,
        debit,
        credit,
        journal: {
            id: 'je1',
            postingStatus: 'POSTED',
            date: new Date('2025-02-01'),
            entryNumber: 'JE-001',
            description: 'Test entry',
            createdBy: { name: 'Juan', email: 'juan@test.com' },
        },
        account: {
            id: accountId,
            code: '1010',
            name: 'Cash',
            normalSide: undefined, // no line-level override — fall through to type.normalSide
            type: { name: 'Asset', category: 'ASSET', normalSide },
        },
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GeneralLedgerService', () => {
    let mockRepo: any
    let mockPrisma: any
    let service: GeneralLedgerService

    beforeEach(() => {
        mockPrisma = {
            workspaceUser: {
                findFirst: jest.fn().mockResolvedValue({ id: 'wsu1' }),
            },
        }
        mockRepo = {
            findGlEntries: jest.fn(),
            findGlSummary: jest.fn(),
            findAccountBalanceBefore: jest.fn(),
            findActiveAccounts: jest.fn(),
        }
        service = new GeneralLedgerService(mockRepo as any, mockPrisma as any)
    })

    // ── Test 1 ────────────────────────────────────────────────────────────────
    test('returns only POSTED entries in GL', async () => {
        const rawRow = {
            id: 'l1',
            accountId: 'a1',
            description: null,
            debit: 5000,
            credit: 0,
            journal: {
                id: 'je1',
                postingStatus: 'POSTED',
                date: new Date('2025-01-15'),
                entryNumber: 'JE-001',
                description: 'Test',
                createdBy: { name: 'Juan', email: null },
            },
            account: {
                id: 'a1',
                code: '1010',
                name: 'Cash',
                normalSide: undefined,
                type: { category: 'ASSET', normalSide: 'DEBIT' },
            },
        }

        mockRepo.findGlEntries.mockResolvedValue({ rows: [rawRow], total: 1 })

        const result = await service.getGlEntries('u1', 'c1', {})

        expect(result.entries).toHaveLength(1)
        expect(result.entries[0].debit).toBe(5000)
    })

    // ── Test 2 ────────────────────────────────────────────────────────────────
    test('calculates running balance for DEBIT-normal account', async () => {
        const rows = [
            makeRow(5000, 0, 'DEBIT', 'a1', 0),
            makeRow(0, 2000, 'DEBIT', 'a1', 1),
            makeRow(1000, 0, 'DEBIT', 'a1', 2),
        ]

        mockRepo.findGlEntries.mockResolvedValue({ rows, total: 3 })
        // repo.findAccountBalanceBefore returns { totalDebits, totalCredits }
        mockRepo.findAccountBalanceBefore.mockResolvedValue({ totalDebits: 10000, totalCredits: 0 })

        const result: any = await service.getGlEntries('u1', 'c1', { accountId: 'a1', from: '2025-01-01' })

        expect(result.openingBalance).toBe(10000)                       // 10000 - 0
        expect(result.entries[0].runningBalance).toBe(15000)            // 10000 + 5000
        expect(result.entries[1].runningBalance).toBe(13000)            // 15000 - 2000
        expect(result.entries[2].runningBalance).toBe(14000)            // 13000 + 1000
        expect(result.closingBalance).toBe(14000)
    })

    // ── Test 3 ────────────────────────────────────────────────────────────────
    test('calculates running balance for CREDIT-normal account', async () => {
        const rows = [
            makeRow(5000, 0, 'CREDIT', 'a1', 0),
            makeRow(0, 2000, 'CREDIT', 'a1', 1),
            makeRow(1000, 0, 'CREDIT', 'a1', 2),
        ]

        mockRepo.findGlEntries.mockResolvedValue({ rows, total: 3 })
        mockRepo.findAccountBalanceBefore.mockResolvedValue({ totalDebits: 0, totalCredits: 5000 })

        const result: any = await service.getGlEntries('u1', 'c1', { accountId: 'a1', from: '2025-01-01' })

        // openingBalance for CREDIT normal = credit - debit = 5000 - 0
        expect(result.openingBalance).toBe(5000)
        // Line 1: delta = credit - debit = 0 - 5000 = -5000 → 5000 + (-5000) = 0
        expect(result.entries[0].runningBalance).toBe(0)
        // Line 2: delta = 2000 - 0 = 2000 → 0 + 2000 = 2000
        expect(result.entries[1].runningBalance).toBe(2000)
        // Line 3: delta = 0 - 1000 = -1000 → 2000 - 1000 = 1000
        expect(result.entries[2].runningBalance).toBe(1000)
        // closingBalance = openingBalance + netChange = 5000 + (2000 - 6000) = 1000
        expect(result.closingBalance).toBe(1000)
    })

    // ── Test 4 ────────────────────────────────────────────────────────────────
    test('no running balance when accountId not provided', async () => {
        const rows = [makeRow(3000, 0, 'DEBIT', 'a1', 0)]
        mockRepo.findGlEntries.mockResolvedValue({ rows, total: 1 })

        const result = await service.getGlEntries('u1', 'c1', {})

        expect((result as any).openingBalance).toBeUndefined()
        expect((result as any).closingBalance).toBeUndefined()
        expect((result.entries[0] as any).runningBalance).toBeUndefined()
        expect(mockRepo.findAccountBalanceBefore).not.toHaveBeenCalled()
    })

    // ── Test 5 ────────────────────────────────────────────────────────────────
    test('summary returns aggregated totals', async () => {
        mockRepo.findGlSummary.mockResolvedValue({
            totalDebits: 15000,
            totalCredits: 12000,
            lineCount: 20,
            entryCount: 8,
        })

        const result = await service.getGlSummary('u1', 'c1', {})

        expect(result.totalDebits).toBe(15000)
        expect(result.totalCredits).toBe(12000)
        expect(result.netChange).toBe(3000)
    })

    // ── Test 6 ────────────────────────────────────────────────────────────────
    test('account list returns active accounts', async () => {
        mockRepo.findActiveAccounts.mockResolvedValue([
            { id: 'a1', code: '1010', name: 'Cash', type: { category: 'ASSET' } },
        ])

        const result = await service.getAccountList('u1', 'c1')

        expect(result).toHaveLength(1)
        expect(result[0].code).toBe('1010')
    })

    // ── Test 7 ────────────────────────────────────────────────────────────────
    test('assertCompanyAccess blocks unauthorized user', async () => {
        mockPrisma.workspaceUser.findFirst.mockResolvedValue(null)

        await expect(
            service.getGlEntries('u1', 'c1', {}),
        ).rejects.toThrow(ForbiddenException)
    })
})
