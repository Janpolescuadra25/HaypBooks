/**
 * GL Integration Helper
 *
 * Provides functions to create, post, and reverse journal entries
 * from within AR/AP/Banking transactional operations.
 * Uses the Prisma transaction client directly for atomicity.
 */

/** Normal side by AccountType ID (matches seed.ts) */
const NORMAL_SIDE_BY_TYPE: Record<number, 'DEBIT' | 'CREDIT'> = {
    1: 'DEBIT',   // ASSET
    2: 'DEBIT',   // EXPENSE
    3: 'CREDIT',  // INCOME
    4: 'CREDIT',  // LIABILITY
    5: 'CREDIT',  // EQUITY
}

/** Well-known system account definitions */
export const SYSTEM_ACCOUNTS = {
    CASH:                 { code: '1000', name: 'Cash',                typeId: 1 },
    ACCOUNTS_RECEIVABLE:  { code: '1100', name: 'Accounts Receivable', typeId: 1 },
    UNDEPOSITED_FUNDS:    { code: '1050', name: 'Undeposited Funds',   typeId: 1 },
    ACCOUNTS_PAYABLE:     { code: '2000', name: 'Accounts Payable',    typeId: 4 },
    SERVICE_REVENUE:      { code: '4000', name: 'Service Revenue',     typeId: 3 },
    OPERATING_EXPENSES:   { code: '5000', name: 'Operating Expenses',  typeId: 2 },
    RETAINED_EARNINGS:    { code: '3100', name: 'Retained Earnings',   typeId: 5 },
    INCOME_SUMMARY:       { code: '3200', name: 'Income Summary',      typeId: 5 },
} as const

/**
 * Resolve a system account by code within a company,
 * creating it if it doesn't exist.
 */
export async function resolveAccount(
    tx: any,
    companyId: string,
    def: { code: string; name: string; typeId: number },
): Promise<{ id: string; typeId: number; normalSide: string | null }> {
    let acct = await tx.account.findUnique({
        where: { companyId_code: { companyId, code: def.code } },
        select: { id: true, typeId: true, normalSide: true },
    })
    if (!acct) {
        acct = await tx.account.create({
            data: {
                companyId,
                code: def.code,
                name: def.name,
                typeId: def.typeId,
                isSystem: true,
                currency: 'PHP',
            },
            select: { id: true, typeId: true, normalSide: true },
        })
    }
    return acct
}

function effectiveNormalSide(acct: { typeId: number; normalSide: string | null }): 'DEBIT' | 'CREDIT' {
    if (acct.normalSide) return acct.normalSide as 'DEBIT' | 'CREDIT'
    return NORMAL_SIDE_BY_TYPE[acct.typeId] ?? 'DEBIT'
}

/**
 * Create a journal entry, post it (update account balances), and return the JE id.
 * Must be called within a Prisma $transaction.
 */
export async function createAndPostJE(
    tx: any,
    data: {
        workspaceId: string
        companyId: string
        date: Date
        description: string
        createdById: string
        lines: Array<{ accountId: string; debit: number; credit: number; description?: string }>
    },
): Promise<string> {
    // Double-entry validation
    const totalDebits  = data.lines.reduce((s, l) => s + (l.debit ?? 0), 0)
    const totalCredits = data.lines.reduce((s, l) => s + (l.credit ?? 0), 0)
    if (Math.abs(totalDebits - totalCredits) > 0.001) {
        throw new Error(`Journal entry is not balanced: debits ${totalDebits} ≠ credits ${totalCredits}`)
    }

    // Create JE + lines
    const je = await tx.journalEntry.create({
        data: {
            workspaceId: data.workspaceId,
            companyId: data.companyId,
            date: data.date,
            description: data.description,
            currency: 'PHP',
            postingStatus: 'DRAFT',
            createdById: data.createdById,
            lines: {
                create: data.lines.map(l => ({
                    companyId: data.companyId,
                    workspaceId: data.workspaceId,
                    accountId: l.accountId,
                    debit: l.debit ?? 0,
                    credit: l.credit ?? 0,
                    description: l.description,
                })),
            },
        },
        include: { lines: true },
    })

    // Post: update account balances
    for (const line of je.lines) {
        const acct = await tx.account.findUnique({
            where: { id: line.accountId },
            select: { id: true, typeId: true, normalSide: true },
        })
        if (!acct) continue
        const ns = effectiveNormalSide(acct)
        const delta = ns === 'DEBIT'
            ? Number(line.debit) - Number(line.credit)
            : Number(line.credit) - Number(line.debit)
        await tx.account.update({
            where: { id: line.accountId },
            data: { balance: { increment: delta } },
        })
    }

    // Mark POSTED
    await tx.journalEntry.update({
        where: { id: je.id },
        data: {
            postingStatus: 'POSTED',
            entryNumber: `JE-${Date.now()}`,
            approvedAt: new Date(),
        },
    })

    return je.id
}

/**
 * Create a reversing journal entry for an existing posted JE.
 * Swaps debits/credits, posts, and returns the reversing JE id.
 */
export async function createReversingJE(
    tx: any,
    companyId: string,
    originalJeId: string,
    reason: string,
): Promise<string | null> {
    const origJe = await tx.journalEntry.findFirst({
        where: { id: originalJeId, companyId },
        include: { lines: true },
    })
    if (!origJe) return null

    const reversedLines = origJe.lines.map((l: any) => ({
        accountId: l.accountId,
        debit: Number(l.credit),
        credit: Number(l.debit),
        description: `Reversal: ${l.description ?? ''}`,
    }))

    const jeId = await createAndPostJE(tx, {
        workspaceId: origJe.workspaceId,
        companyId,
        date: new Date(),
        description: `Reversal – ${reason}`,
        createdById: origJe.createdById ?? 'system',
        lines: reversedLines,
    })

    // Mark original as VOIDED
    await tx.journalEntry.update({
        where: { id: originalJeId },
        data: { postingStatus: 'VOIDED' },
    })

    return jeId
}
