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
            transactionSource: true,
            sourceReferenceId: true,
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
            lineFilter['journal'] = {
                ...existing,
                OR: [
                    { invoices: { some: {} } },
                    { transactionSource: { contains: 'INVOICE', mode: 'insensitive' } },
                ],
            }
        } else if (st === 'BILL') {
            lineFilter['journal'] = {
                ...existing,
                OR: [
                    { bills: { some: {} } },
                    { transactionSource: { contains: 'BILL', mode: 'insensitive' } },
                ],
            }
        } else if (st === 'PAYMENT') {
            lineFilter['journal'] = {
                ...existing,
                OR: [
                    { paymentsReceived: { some: {} } },
                    { transactionSource: { contains: 'PAYMENT', mode: 'insensitive' } },
                ],
            }
        } else if (st === 'BILL_PAYMENT') {
            lineFilter['journal'] = {
                ...existing,
                OR: [
                    { billPayments: { some: {} } },
                    { transactionSource: { contains: 'BILL PAYMENT', mode: 'insensitive' } },
                ],
            }
        } else if (st === 'BANK_DEPOSIT') {
            lineFilter['journal'] = {
                ...existing,
                OR: [
                    { bankDeposits: { some: {} } },
                    { transactionSource: { contains: 'BANK', mode: 'insensitive' } },
                ],
            }
        } else if (st === 'REFUND') {
            lineFilter['journal'] = {
                ...existing,
                OR: [
                    { customerRefunds: { some: {} } },
                    { vendorRefunds: { some: {} } },
                    { transactionSource: { contains: 'REFUND', mode: 'insensitive' } },
                ],
            }
        } else if (st === 'MILEAGE') {
            lineFilter['journal'] = {
                ...existing,
                transactionSource: { contains: 'Mileage', mode: 'insensitive' },
            }
        } else if (st === 'PER_DIEM') {
            lineFilter['journal'] = {
                ...existing,
                transactionSource: { contains: 'Per Diem', mode: 'insensitive' },
            }
        } else if (st === 'EXPENSE_REPORT') {
            lineFilter['journal'] = {
                ...existing,
                transactionSource: { contains: 'Expense Report', mode: 'insensitive' },
            }
        } else if (st === 'EXPENSE_REIMBURSEMENT') {
            lineFilter['journal'] = {
                ...existing,
                transactionSource: { contains: 'Expense Reimbursement', mode: 'insensitive' },
            }
        } else if (st === 'VENDOR_CREDIT') {
            lineFilter['journal'] = {
                ...existing,
                transactionSource: { contains: 'VendorCredit', mode: 'insensitive' },
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
                NOT: {
                    OR: [
                        { transactionSource: { contains: 'Mileage', mode: 'insensitive' } },
                        { transactionSource: { contains: 'Per Diem', mode: 'insensitive' } },
                        { transactionSource: { contains: 'Expense Report', mode: 'insensitive' } },
                        { transactionSource: { contains: 'Expense Reimbursement', mode: 'insensitive' } },
                        { transactionSource: { contains: 'VendorCredit', mode: 'insensitive' } },
                    ],
                },
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

        const dir = opts.sortDir ?? 'desc'
        const sortMap: Record<string, any[]> = {
            date:        [{ journal: { date: dir } }, { id: 'asc' }],
            entryNumber: [{ journal: { entryNumber: dir } }, { journal: { date: 'desc' } }],
            accountName: [{ account: { name: dir } }, { journal: { date: 'desc' } }],
            sourceType:  [{ account: { name: dir } }, { journal: { date: 'desc' } }], // proxy: no direct field
            debit:       [{ debit: dir }, { journal: { date: 'desc' } }],
            credit:      [{ credit: dir }, { journal: { date: 'desc' } }],
        }
        const orderBy: any[] = opts.sortBy ? (sortMap[opts.sortBy] ?? sortMap['date']) : sortMap['date']

        const [rows, total] = await this.prisma.$transaction([
            this.prisma.journalEntryLine.findMany({
                where,
                include: JOURNAL_INCLUDE,
                orderBy,
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

    async findAccountBalancesBefore(companyId: string, beforeDate: Date) {
        const accounts = await this.prisma.account.findMany({
            where: { companyId, isActive: true, deletedAt: null },
            select: {
                id: true,
                code: true,
                name: true,
                normalSide: true,
                type: { select: { category: true, normalSide: true } },
            },
            orderBy: [{ code: 'asc' }],
        })

        const accountSummaries = await this.prisma.journalEntryLine.groupBy({
            by: ['accountId'],
            where: {
                companyId,
                journal: {
                    postingStatus: 'POSTED',
                    deletedAt: null,
                    date: { lt: beforeDate },
                },
            },
            _sum: { debit: true, credit: true },
        })

        const summaryMap = new Map(
            accountSummaries.map((summary) => [summary.accountId, {
                totalDebits: Number(summary._sum.debit ?? 0),
                totalCredits: Number(summary._sum.credit ?? 0),
            }]),
        )

        return accounts.map((account) => ({
            ...account,
            totalDebits: summaryMap.get(account.id)?.totalDebits ?? 0,
            totalCredits: summaryMap.get(account.id)?.totalCredits ?? 0,
        }))
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
