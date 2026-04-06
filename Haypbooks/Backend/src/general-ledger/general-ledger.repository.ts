import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { GlQueryDto } from './dto/gl-query.dto'

const JOURNAL_INCLUDE = {
    journal: {
        select: {
            id: true,
            entryNumber: true,
            date: true,
            description: true,
            postingStatus: true,
            createdBy: { select: { name: true, email: true } },
            invoices: { select: { id: true }, take: 1 },
            bills: { select: { id: true }, take: 1 },
            paymentsReceived: { select: { id: true }, take: 1 },
            billPayments: { select: { id: true }, take: 1 },
            bankDeposits: { select: { id: true }, take: 1 },
            customerRefunds: { select: { id: true }, take: 1 },
            vendorRefunds: { select: { id: true }, take: 1 },
        },
    },
    account: {
        select: {
            id: true,
            code: true,
            name: true,
            normalSide: true,
            type: { select: { name: true, category: true, normalSide: true } },
        },
    },
} as const

function buildWhere(companyId: string, opts: GlQueryDto) {
    const where: Record<string, any> = {
        companyId,
        journal: {
            postingStatus: 'POSTED',
            deletedAt: null,
        },
    }

    // Date range on journal.date
    if (opts.from || opts.to) {
        where['journal'] = {
            ...where['journal'],
            date: {
                ...(opts.from ? { gte: new Date(opts.from) } : {}),
                ...(opts.to ? { lte: new Date(opts.to) } : {}),
            },
        }
    }

    // entryNumber filter
    if (opts.entryNumber) {
        where['journal'] = {
            ...where['journal'],
            entryNumber: { contains: opts.entryNumber, mode: 'insensitive' },
        }
    }

    // search: OR on journal.description OR line description
    if (opts.search) {
        where['OR'] = [
            { journal: { ...where['journal'], description: { contains: opts.search, mode: 'insensitive' } } },
            { description: { contains: opts.search, mode: 'insensitive' } },
        ]
        // Remove the top-level journal key to avoid conflict — search OR replaces it
        delete where['journal']
        // But we must still enforce postingStatus/deletedAt inside both branches
    }

    // accountId filter
    if (opts.accountId) {
        where['accountId'] = opts.accountId
    }

    // accountCode prefix filter
    if (opts.accountCode) {
        where['account'] = {
            code: { startsWith: opts.accountCode },
        }
    }

    // accountCategory filter
    if (opts.accountCategory) {
        where['account'] = {
            ...(where['account'] ?? {}),
            type: { category: opts.accountCategory },
        }
    }

    return where
}

/** Build a clean where clause using Prisma's nested filter — avoids delete/merge issues */
function buildCleanWhere(companyId: string, opts: GlQueryDto) {
    const journalFilter: Record<string, any> = {
        postingStatus: 'POSTED',
        deletedAt: null,
    }

    if (opts.from || opts.to) {
        journalFilter['date'] = {
            ...(opts.from ? { gte: new Date(opts.from) } : {}),
            ...(opts.to ? { lte: new Date(opts.to) } : {}),
        }
    }

    if (opts.entryNumber) {
        journalFilter['entryNumber'] = { contains: opts.entryNumber, mode: 'insensitive' }
    }

    const lineFilter: Record<string, any> = { companyId }

    if (opts.accountId) {
        lineFilter['accountId'] = opts.accountId
    }

    const accountFilter: Record<string, any> = {}
    if (opts.accountCode) {
        accountFilter['code'] = { startsWith: opts.accountCode }
    }
    if (opts.accountCategory) {
        accountFilter['type'] = { category: opts.accountCategory }
    }
    if (Object.keys(accountFilter).length) {
        lineFilter['account'] = accountFilter
    }

    if (opts.search) {
        lineFilter['OR'] = [
            { description: { contains: opts.search, mode: 'insensitive' } },
            { journal: { ...journalFilter, description: { contains: opts.search, mode: 'insensitive' } } },
        ]
        // journal filter applied inside OR branches; also add top-level to enforce POSTED
        lineFilter['journal'] = journalFilter
    } else {
        lineFilter['journal'] = journalFilter
    }

    // sourceType filter: derive from related-record presence on the JournalEntry
    if (opts.sourceType && opts.sourceType !== 'ALL') {
        const st = opts.sourceType
        const existing = lineFilter['journal'] ?? {}
        if (st === 'INVOICE') {
            lineFilter['journal'] = { ...existing, invoices: { some: {} } }
        } else if (st === 'BILL') {
            lineFilter['journal'] = { ...existing, bills: { some: {} } }
        } else if (st === 'PAYMENT') {
            lineFilter['journal'] = { ...existing, paymentsReceived: { some: {} } }
        } else if (st === 'BILL_PAYMENT') {
            lineFilter['journal'] = { ...existing, billPayments: { some: {} } }
        } else if (st === 'BANK_DEPOSIT') {
            lineFilter['journal'] = { ...existing, bankDeposits: { some: {} } }
        } else if (st === 'REFUND') {
            lineFilter['journal'] = {
                ...existing,
                OR: [
                    { customerRefunds: { some: {} } },
                    { vendorRefunds: { some: {} } },
                ],
            }
        } else if (st === 'MANUAL_JOURNAL') {
            lineFilter['journal'] = {
                ...existing,
                invoices: { none: {} },
                bills: { none: {} },
                paymentsReceived: { none: {} },
                billPayments: { none: {} },
                bankDeposits: { none: {} },
                customerRefunds: { none: {} },
                vendorRefunds: { none: {} },
            }
        }
    }

    return lineFilter
}

@Injectable()
export class GeneralLedgerRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findGlEntries(companyId: string, opts: GlQueryDto) {
        const page = opts.page ?? 1
        const limit = opts.limit ?? 50
        const skip = (page - 1) * limit

        const where = buildCleanWhere(companyId, opts)

        const [rows, total] = await this.prisma.$transaction([
            this.prisma.journalEntryLine.findMany({
                where,
                include: JOURNAL_INCLUDE,
                orderBy: [{ journal: { date: 'asc' } }, { id: 'asc' }],
                take: limit,
                skip,
            }),
            this.prisma.journalEntryLine.count({ where }),
        ])

        return { rows, total }
    }

    async findGlSummary(companyId: string, opts: GlQueryDto) {
        const where = buildCleanWhere(companyId, opts)

        const agg = await this.prisma.journalEntryLine.aggregate({
            where,
            _sum: { debit: true, credit: true },
            _count: { id: true },
        })

        // Distinct journal count (entry count, not line count)
        const entryCount = await this.prisma.journalEntry.count({
            where: {
                companyId,
                postingStatus: 'POSTED',
                deletedAt: null,
                lines: { some: buildCleanWhere(companyId, opts) },
            },
        })

        return {
            totalDebits: Number(agg._sum.debit ?? 0),
            totalCredits: Number(agg._sum.credit ?? 0),
            lineCount: agg._count.id,
            entryCount,
        }
    }

    /**
     * Returns sum of all POSTED line debits/credits for a specific account
     * strictly BEFORE the given date — used to compute opening balance.
     */
    async findAccountBalanceBefore(companyId: string, accountId: string, beforeDate: Date) {
        const agg = await this.prisma.journalEntryLine.aggregate({
            where: {
                companyId,
                accountId,
                journal: {
                    postingStatus: 'POSTED',
                    deletedAt: null,
                    date: { lt: beforeDate },
                },
            },
            _sum: { debit: true, credit: true },
        })
        return {
            totalDebits: Number(agg._sum.debit ?? 0),
            totalCredits: Number(agg._sum.credit ?? 0),
        }
    }

    async findActiveAccounts(companyId: string) {
        return this.prisma.account.findMany({
            where: { companyId, isActive: true, deletedAt: null },
            select: {
                id: true,
                code: true,
                name: true,
                type: { select: { category: true, normalSide: true } },
            },
            orderBy: [{ code: 'asc' }],
        })
    }
}
