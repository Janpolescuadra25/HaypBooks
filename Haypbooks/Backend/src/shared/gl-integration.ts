/**
 * GL Integration Helper
 *
 * Provides functions to create, post, and reverse journal entries
 * from within AR/AP/Banking transactional operations.
 * Uses the Prisma transaction client directly for atomicity.
 */

import { BadRequestException } from '@nestjs/common'

/** Normal side by AccountType ID (matches seed.ts) */
const NORMAL_SIDE_BY_TYPE: Record<number, 'DEBIT' | 'CREDIT'> = {
    1: 'DEBIT',   // ASSET
    2: 'DEBIT',   // EXPENSE
    3: 'CREDIT',  // INCOME
    4: 'CREDIT',  // LIABILITY
    5: 'CREDIT',  // EQUITY
}

const ACCOUNT_TYPE_NAMES: Record<number, string> = {
    1: 'ASSET',
    2: 'EXPENSE',
    3: 'INCOME',
    4: 'LIABILITY',
    5: 'EQUITY',
}

async function ensureAccountType(tx: any, typeId: number) {
    await tx.accountType.upsert({
        where: { id: typeId },
        update: {},
        create: {
            id: typeId,
            name: ACCOUNT_TYPE_NAMES[typeId] ?? `TYPE_${typeId}`,
            normalSide: NORMAL_SIDE_BY_TYPE[typeId] ?? 'DEBIT',
        },
    })
}

/** Well-known system account definitions */
export const SYSTEM_ACCOUNTS = {
    CASH:                   { code: '1010', name: 'Cash on Hand',              typeId: 1 },
    ACCOUNTS_RECEIVABLE:    { code: '1100', name: 'Accounts Receivable',       typeId: 1 },
    UNDEPOSITED_FUNDS:      { code: '1170', name: 'Undeposited Funds',          typeId: 1 },
    ACCOUNTS_PAYABLE:       { code: '2010', name: 'Accounts Payable',           typeId: 4 },
    SERVICE_REVENUE:        { code: '4010', name: 'Sales Revenue',             typeId: 3 },
    OPERATING_EXPENSES:     { code: '6010', name: 'Salaries and Wages',        typeId: 2 },
    RETAINED_EARNINGS:      { code: '3030', name: 'Retained Earnings',         typeId: 5 },
    INCOME_SUMMARY:         { code: '3200', name: 'Income Summary',            typeId: 5 },
    OPENING_BALANCE_EQUITY: { code: '3050', name: 'Opening Balance Equity',    typeId: 5 },
    ACCRUED_EXPENSES:       { code: '2020', name: 'Accrued Expenses',          typeId: 4 },
} as const

/**
 * Resolve a system account by code within a company,
 * creating it if it doesn't exist.
 */
async function resolveCompanyCurrency(tx: any, companyId: string): Promise<string> {
    const company = await tx.company.findUnique({ where: { id: companyId }, select: { currency: true } })
    return company?.currency ?? 'PHP'
}

export async function resolveAccount(
    tx: any,
    companyId: string,
    def: { code: string; name: string; typeId: number; currency?: string },
): Promise<{ id: string; typeId: number; normalSide: string | null }> {
    const currency = def.currency ?? await resolveCompanyCurrency(tx, companyId)
    let acct = await tx.account.findUnique({
        where: { companyId_code: { companyId, code: def.code } },
        select: { id: true, typeId: true, normalSide: true },
    })
    if (!acct) {
        await ensureAccountType(tx, def.typeId)
        acct = await tx.account.create({
            data: {
                companyId,
                code: def.code,
                name: def.name,
                typeId: def.typeId,
                isSystem: true,
                currency,
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
        createdById?: string
        entryNumber?: string
        currency?: string
        postingStatus?: 'DRAFT' | 'POSTED' | 'VOIDED'
        transactionSource?: string
        sourceReferenceId?: string
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
            currency: data.currency ?? await resolveCompanyCurrency(tx, data.companyId),
            postingStatus: data.postingStatus ?? 'DRAFT',
            transactionSource: data.transactionSource,
            sourceReferenceId: data.sourceReferenceId,
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
        select: {
            id: true,
            lines: {
                select: {
                    accountId: true,
                    debit: true,
                    credit: true,
                },
            },
        },
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
            approvedAt: new Date(),
        },
        select: { id: true },
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
    date?: Date,
): Promise<string | null> {
    const origJe = await tx.journalEntry.findFirst({
        where: { id: originalJeId, companyId },
        select: {
            id: true,
            workspaceId: true,
            date: true,
            createdById: true,
            currency: true,
            postingStatus: true,
            lines: {
                select: {
                    accountId: true,
                    debit: true,
                    credit: true,
                    description: true,
                },
            },
        },
    })
    if (!origJe) return null
    if (origJe.postingStatus === 'VOIDED') {
        throw new BadRequestException('Journal entry is already voided')
    }

    const reversedLines = origJe.lines.map((l: any) => ({
        accountId: l.accountId,
        debit: Number(l.credit),
        credit: Number(l.debit),
        description: `Reversal: ${l.description ?? ''}`,
    }))

    const jeId = await createAndPostJE(tx, {
        workspaceId: origJe.workspaceId,
        companyId,
        date: date ?? origJe.date,
        description: `Reversal – ${reason}`,
        createdById: origJe.createdById ?? 'system',
        currency: origJe.currency ?? await resolveCompanyCurrency(tx, companyId),
        lines: reversedLines,
    })

    // Mark original as VOIDED
    await tx.journalEntry.update({
        where: { id: originalJeId },
        data: { postingStatus: 'VOIDED' },
        select: { id: true },
    })

    return jeId
}
