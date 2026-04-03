import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { GeneralLedgerRepository } from './general-ledger.repository'
import { GlQueryDto } from './dto/gl-query.dto'

@Injectable()
export class GeneralLedgerService {
    constructor(
        private readonly repo: GeneralLedgerRepository,
        private readonly prisma: PrismaService,
    ) { }

    // ─── Auth helper ─────────────────────────────────────────────────────────

    private async assertCompanyAccess(userId: string, companyId: string) {
        const member = await this.prisma.workspaceUser.findFirst({
            where: {
                status: 'ACTIVE',
                workspace: { companies: { some: { id: companyId } } },
                userId,
            },
        })
        if (!member) throw new ForbiddenException('Access denied to this company')
        return member
    }

    // ─── GL Entries ───────────────────────────────────────────────────────────

    async getGlEntries(userId: string, companyId: string, opts: GlQueryDto) {
        await this.assertCompanyAccess(userId, companyId)

        const page = opts.page ?? 1
        const limit = opts.limit ?? 50
        const { rows, total } = await this.repo.findGlEntries(companyId, opts)

        const totalPages = Math.ceil(total / limit)

        // Map raw rows to response shape
        const entries = rows.map((line: any) => ({
            id: line.id,
            date: line.journal.date,
            entryNumber: line.journal.entryNumber ?? null,
            entryDescription: line.journal.description ?? null,
            description: line.description ?? null,
            accountId: line.accountId,
            accountCode: line.account.code,
            accountName: line.account.name,
            accountCategory: line.account.type?.category ?? null,
            debit: Number(line.debit),
            credit: Number(line.credit),
            postedBy: line.journal.createdBy
                ? { name: line.journal.createdBy.name, email: line.journal.createdBy.email }
                : null,
        }))

        const pagination = { page, limit, total, totalPages }

        // When filtering to a single account, include opening/closing balance
        if (opts.accountId) {
            const accountRow = rows.find((r: any) => r.accountId === opts.accountId)
            const account = accountRow
                ? {
                    id: accountRow.account.id,
                    code: accountRow.account.code,
                    name: accountRow.account.name,
                    type: {
                        category: accountRow.account.type?.category ?? null,
                        normalSide: accountRow.account.normalSide ?? accountRow.account.type?.normalSide ?? 'DEBIT',
                    },
                }
                : null

            // opening balance = everything BEFORE opts.from (or beginning of time if no from)
            const openingBalance = await this._calcOpeningBalance(
                companyId,
                opts.accountId,
                opts.from,
                account?.type?.normalSide ?? 'DEBIT',
            )

            // Attach running balance to each entry and calculate totals
            let runningBalance = openingBalance
            let totalDebits = 0
            let totalCredits = 0

            const entriesWithRunning = entries.map((e) => {
                totalDebits += e.debit
                totalCredits += e.credit
                const delta =
                    (account?.type?.normalSide ?? 'DEBIT') === 'DEBIT'
                        ? e.debit - e.credit
                        : e.credit - e.debit
                runningBalance += delta
                return { ...e, runningBalance }
            })

            const netChange =
                (account?.type?.normalSide ?? 'DEBIT') === 'DEBIT'
                    ? totalDebits - totalCredits
                    : totalCredits - totalDebits

            return {
                account,
                openingBalance,
                closingBalance: openingBalance + netChange,
                netChange,
                totalDebits,
                totalCredits,
                entries: entriesWithRunning,
                pagination,
            }
        }

        return { entries, pagination }
    }

    // ─── GL Summary ───────────────────────────────────────────────────────────

    async getGlSummary(userId: string, companyId: string, opts: GlQueryDto) {
        await this.assertCompanyAccess(userId, companyId)

        const { totalDebits, totalCredits, lineCount, entryCount } =
            await this.repo.findGlSummary(companyId, opts)

        return {
            totalDebits,
            totalCredits,
            netChange: totalDebits - totalCredits,
            lineCount,
            entryCount,
        }
    }

    // ─── Account List (for filter dropdown) ──────────────────────────────────

    async getAccountList(userId: string, companyId: string) {
        await this.assertCompanyAccess(userId, companyId)
        return this.repo.findActiveAccounts(companyId)
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private async _calcOpeningBalance(
        companyId: string,
        accountId: string,
        fromDate: string | undefined,
        normalSide: string,
    ): Promise<number> {
        if (!fromDate) return 0

        const { totalDebits, totalCredits } = await this.repo.findAccountBalanceBefore(
            companyId,
            accountId,
            new Date(fromDate),
        )

        return normalSide === 'DEBIT'
            ? totalDebits - totalCredits
            : totalCredits - totalDebits
    }
}
