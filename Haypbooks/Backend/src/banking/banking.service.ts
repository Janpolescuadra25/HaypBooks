import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { BankingRepository } from './banking.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'

@Injectable()
export class BankingService {
    constructor(
      private readonly repo: BankingRepository,
      private readonly prisma: PrismaService,
      private readonly subLedger: SubLedgerService,
    ) { }

    private async getWorkspaceId(companyId: string) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    private async assertAccess(userId: string, companyId: string) {
        const m = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!m) throw new ForbiddenException('Access denied')
    }

    // ─── Bank Accounts ────────────────────────────────────────────────────────

    async listBankAccounts(userId: string, companyId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.findBankAccounts(wid)
    }

    async getBankAccount(userId: string, companyId: string, bankAccountId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const acct = await this.repo.findBankAccountById(wid, bankAccountId)
        if (!acct) throw new NotFoundException('Bank account not found')
        return acct
    }

    async createBankAccount(userId: string, companyId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('Bank account name is required')
        return this.repo.createBankAccount(wid, data)
    }

    async updateBankAccount(userId: string, companyId: string, bankAccountId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const acct = await this.repo.findBankAccountById(wid, bankAccountId)
        if (!acct) throw new NotFoundException('Bank account not found')
        return this.repo.updateBankAccount(wid, bankAccountId, data)
    }

    async deleteBankAccount(userId: string, companyId: string, bankAccountId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const acct = await this.repo.findBankAccountById(wid, bankAccountId)
        if (!acct) throw new NotFoundException('Bank account not found')
        return this.repo.softDeleteBankAccount(bankAccountId)
    }

    // ─── Transactions ─────────────────────────────────────────────────────────

    async listTransactions(userId: string, companyId: string, bankAccountId: string, opts: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.findTransactions(wid, bankAccountId, {
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 100,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async importTransactions(userId: string, companyId: string, bankAccountId: string, data: any[]) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!Array.isArray(data) || !data.length) throw new BadRequestException('No transactions provided')
        const txns = data.map((t) => ({
            date: new Date(t.date),
            description: t.description ?? '',
            amount: Number(t.amount),
        }))
        return this.repo.importTransactions(wid, bankAccountId, txns)
    }

    async createTransaction(userId: string, companyId: string, bankAccountId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.date) throw new BadRequestException('date is required')
        if (!data.description) throw new BadRequestException('description is required')
        if (data.amount === undefined || data.amount === null) throw new BadRequestException('amount is required')
        return this.repo.createTransaction(wid, bankAccountId, {
            date: new Date(data.date),
            description: data.description,
            amount: Number(data.amount),
            category: data.category,
            memo: data.memo,
        })
    }

    async updateTransaction(userId: string, companyId: string, bankAccountId: string, bankTransactionId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)

        // ── GL Integration: create a Journal Entry when categorizing ─────────
        let journalEntryId: string | undefined
        const isCategorizing = (data.status === 'categorized' || data.status === 'CATEGORIZED') && data.accountId
        if (isCategorizing) {
            try {
                const txn = await this.prisma.bankTransaction.findUnique({
                    where: { id: bankTransactionId },
                    select: { date: true, description: true, amount: true, bankAccountId: true },
                })
                if (txn) {
                    // Find the GL account linked to the bank account (glAccountId)
                    const bankAcct = await this.prisma.bankAccount.findUnique({
                        where: { id: txn.bankAccountId },
                        select: { glAccountId: true, name: true },
                    })

                    // Find the COA account for the bank account — fallback to first asset account if no glAccountId set
                    let bankGlAccountId = bankAcct?.glAccountId
                    if (!bankGlAccountId) {
                        const cashAcct = await this.prisma.account.findFirst({
                            where: {
                                companyId,
                                isActive: true,
                                deletedAt: null,
                                isHeader: false,
                                type: { category: { in: ['ASSET'] } },
                                name: { contains: 'Cash', mode: 'insensitive' },
                            },
                            select: { id: true },
                        })
                        bankGlAccountId = cashAcct?.id
                    }

                    if (bankGlAccountId) {
                        const amount = Math.abs(Number(txn.amount))
                        const isMoney_IN = Number(txn.amount) > 0
                        // Money IN (credit): DR Bank Account, CR selected Category Account
                        // Money OUT (debit): DR selected Category Account, CR Bank Account
                        const lines = isMoney_IN
                            ? [
                                { accountId: bankGlAccountId, debit: amount, credit: 0, description: txn.description },
                                { accountId: data.accountId,  debit: 0, credit: amount, description: data.category ?? txn.description },
                              ]
                            : [
                                { accountId: data.accountId,  debit: amount, credit: 0, description: data.category ?? txn.description },
                                { accountId: bankGlAccountId, debit: 0, credit: amount, description: txn.description },
                              ]

                        const je = await this.prisma.journalEntry.create({
                            data: {
                                workspaceId: wid,
                                companyId,
                                date: txn.date,
                                description: `Bank Transaction — ${txn.description}`,
                                currency: 'PHP',
                                postingStatus: 'DRAFT',
                                createdById: userId,
                                transactionSource: 'Bank Transaction',
                                sourceReferenceId: bankTransactionId,
                                lines: { create: lines.map(l => ({ companyId, workspaceId: wid, accountId: l.accountId, debit: l.debit, credit: l.credit, description: l.description })) },
                            },
                            select: { id: true },
                        })
                        journalEntryId = je.id
                    }
                }
            } catch {
                // Journal entry creation is best-effort — do not block categorization
            }
        }

        return this.repo.updateTransaction(wid, bankTransactionId, {
            category: data.category,
            memo: data.memo,
            status: data.status,
            contactId: data.contactId,
            transactionType: data.transactionType ?? (isCategorizing ? 'Bank Transaction' : undefined),
            journalEntryId,
        })
    }

    async splitTransaction(userId: string, companyId: string, bankAccountId: string, bankTransactionId: string, splits: any[]) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!Array.isArray(splits) || splits.length < 2) throw new BadRequestException('At least 2 split lines required')

        // ── GL Integration: create a Journal Entry for split ─────────────────
        try {
            const txn = await this.prisma.bankTransaction.findUnique({
                where: { id: bankTransactionId },
                select: { date: true, description: true, amount: true, bankAccountId: true },
            })
            if (txn) {
                const bankAcct = await this.prisma.bankAccount.findUnique({
                    where: { id: txn.bankAccountId },
                    select: { glAccountId: true },
                })
                let bankGlAccountId = bankAcct?.glAccountId
                if (!bankGlAccountId) {
                    const cashAcct = await this.prisma.account.findFirst({
                        where: { companyId, isActive: true, deletedAt: null, isHeader: false, type: { category: 'ASSET' }, name: { contains: 'Cash', mode: 'insensitive' } },
                        select: { id: true },
                    })
                    bankGlAccountId = cashAcct?.id
                }

                const splitAccountIds = splits.filter(s => s.accountId).map(s => s.accountId)
                if (bankGlAccountId && splitAccountIds.length > 0) {
                    const total = splits.reduce((s, l) => s + Math.abs(Number(l.amount)), 0)
                    const isMoney_IN = Number(txn.amount) > 0
                    const splitLines = splits.map(s => ({
                        accountId: s.accountId,
                        debit:  isMoney_IN ? 0 : Math.abs(Number(s.amount)),
                        credit: isMoney_IN ? Math.abs(Number(s.amount)) : 0,
                        description: s.description ?? txn.description,
                    }))
                    const bankLine = {
                        accountId: bankGlAccountId,
                        debit:  isMoney_IN ? total : 0,
                        credit: isMoney_IN ? 0 : total,
                        description: txn.description,
                    }
                    await this.prisma.journalEntry.create({
                        data: {
                            workspaceId: wid,
                            companyId,
                            date: txn.date,
                            description: `Bank Transaction (Split) — ${txn.description}`,
                            currency: 'PHP',
                            postingStatus: 'DRAFT',
                            createdById: userId,
                            transactionSource: 'Bank Transaction (Split)',
                            sourceReferenceId: bankTransactionId,
                            lines: { create: [...splitLines, bankLine].map(l => ({ companyId, workspaceId: wid, accountId: l.accountId, debit: l.debit, credit: l.credit, description: l.description })) },
                        },
                    })
                }
            }
        } catch {
            // best-effort
        }

        return this.repo.splitTransaction(wid, bankTransactionId, splits.map(s => ({
            accountCode: s.accountCode ?? s.accountId ?? '',
            accountId: s.accountId,
            description: s.description ?? '',
            amount: Number(s.amount),
        })))
    }

    async batchCategorize(userId: string, companyId: string, bankAccountId: string, body: {
        transactionIds: string[]
        accountId: string
        contactId?: string
        transactionType?: string
        category?: string
    }) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)

        if (!body.transactionIds?.length) throw new BadRequestException('transactionIds is required')
        if (!body.accountId)             throw new BadRequestException('accountId (COA) is required')

        // Validate all transactions belong to this bank account
        const txns = await this.prisma.bankTransaction.findMany({
            where: { id: { in: body.transactionIds }, workspaceId: wid, bankAccountId },
            select: { id: true, date: true, description: true, amount: true },
        })
        if (txns.length === 0) throw new BadRequestException('No valid transactions found')

        // Find GL account for bank account (for the bank side of each JE line)
        const bankAcct = await this.prisma.bankAccount.findUnique({
            where: { id: bankAccountId },
            select: { glAccountId: true, name: true },
        })
        let bankGlAccountId = bankAcct?.glAccountId
        if (!bankGlAccountId) {
            const cashAcct = await this.prisma.account.findFirst({
                where: { companyId, isActive: true, deletedAt: null, isHeader: false, type: { category: 'ASSET' }, name: { contains: 'Cash', mode: 'insensitive' } },
                select: { id: true },
            })
            bankGlAccountId = cashAcct?.id
        }

        // Get category name from COA account
        const coaAccount = await this.prisma.account.findFirst({
            where: { id: body.accountId, companyId },
            select: { name: true, code: true },
        })
        const categoryName = body.category ?? coaAccount?.name ?? body.accountId
        const txType = body.transactionType ?? 'Bank Transaction'

        // Create ONE Journal Entry with multiple lines (one per transaction + bank offset per)
        let jeId: string | undefined
        if (bankGlAccountId) {
            try {
                const jeLines: Array<{ companyId: string; workspaceId: string; accountId: string; debit: number; credit: number; description?: string }> = []
                let totalBankDebit = 0
                let totalBankCredit = 0

                for (const txn of txns) {
                    const amount = Math.abs(Number(txn.amount))
                    const isMoney_IN = Number(txn.amount) > 0
                    if (isMoney_IN) {
                        jeLines.push({ companyId, workspaceId: wid, accountId: body.accountId, debit: 0, credit: amount, description: txn.description })
                        totalBankDebit += amount
                    } else {
                        jeLines.push({ companyId, workspaceId: wid, accountId: body.accountId, debit: amount, credit: 0, description: txn.description })
                        totalBankCredit += amount
                    }
                }
                // One bank account offset line for all debits, one for all credits
                if (totalBankDebit > 0) jeLines.push({ companyId, workspaceId: wid, accountId: bankGlAccountId, debit: totalBankDebit, credit: 0, description: 'Bank — batch categorize' })
                if (totalBankCredit > 0) jeLines.push({ companyId, workspaceId: wid, accountId: bankGlAccountId, debit: 0, credit: totalBankCredit, description: 'Bank — batch categorize' })

                const je = await this.prisma.journalEntry.create({
                    data: {
                        workspaceId: wid,
                        companyId,
                        date: txns[0].date,
                        description: `Batch Categorize — ${categoryName} (${txns.length} transactions)`,
                        currency: 'PHP',
                        postingStatus: 'DRAFT',
                        createdById: userId,
                        transactionSource: 'Bank Transaction (Batch)',
                        lines: { create: jeLines },
                    },
                    select: { id: true },
                })
                jeId = je.id
            } catch {
                // best-effort
            }
        }

        // Update all transactions
        await this.prisma.bankTransaction.updateMany({
            where: { id: { in: body.transactionIds }, workspaceId: wid },
            data: {
                status: 'CATEGORIZED',
                category: categoryName,
                contactId: body.contactId ?? null,
                transactionType: txType,
                journalEntryId: jeId ?? null,
            },
        })

        return {
            categorized: txns.length,
            journalEntryId: jeId,
            category: categoryName,
        }
    }

    async createTransfer(userId: string, companyId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.fromBankAccountId) throw new BadRequestException('fromBankAccountId is required')
        if (!data.toBankAccountId) throw new BadRequestException('toBankAccountId is required')
        if (!data.amount) throw new BadRequestException('amount is required')
        if (!data.date) throw new BadRequestException('date is required')
        return this.repo.createTransfer(wid, {
            fromBankAccountId: data.fromBankAccountId,
            toBankAccountId: data.toBankAccountId,
            amount: Number(data.amount),
            date: new Date(data.date),
            memo: data.memo,
        })
    }

    // ─── Bank Reconciliation ──────────────────────────────────────────────────

    async listReconciliations(userId: string, companyId: string, bankAccountId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.findReconciliations(wid, bankAccountId)
    }

    async getReconciliation(userId: string, companyId: string, reconId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const recon = await this.repo.findReconciliationById(wid, reconId)
        if (!recon) throw new NotFoundException('Reconciliation not found')
        return recon
    }

    async createReconciliation(userId: string, companyId: string, bankAccountId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.statementDate) throw new BadRequestException('statementDate is required')
        if (data.closingBalance === undefined) throw new BadRequestException('closingBalance is required')
        return this.repo.createReconciliation(wid, {
            bankAccountId, statementDate: new Date(data.statementDate), closingBalance: Number(data.closingBalance),
        })
    }

    async matchTransaction(userId: string, companyId: string, reconId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.bankTransactionId) throw new BadRequestException('bankTransactionId is required')
        return this.repo.matchTransactionToJournalLine(wid, reconId, data)
    }

    async unmatchTransaction(userId: string, companyId: string, reconId: string, bankTransactionId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.unmatchTransaction(wid, reconId, bankTransactionId)
    }

    async completeReconciliation(userId: string, companyId: string, reconId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const recon = await this.repo.findReconciliationById(wid, reconId)
        if (!recon) throw new NotFoundException('Reconciliation not found')
        if (recon.status === 'COMPLETED') throw new BadRequestException('Reconciliation is already completed')
        return this.repo.completeReconciliation(wid, reconId)
    }

    async undoReconciliation(userId: string, companyId: string, reconId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const recon = await this.repo.findReconciliationById(wid, reconId)
        if (!recon) throw new NotFoundException('Reconciliation not found')
        if (recon.status !== 'COMPLETED') throw new BadRequestException('Only completed reconciliations can be undone')
        return this.prisma.bankReconciliation.update({
            where: { id: reconId },
            data: { status: 'IN_PROGRESS' },
        })
    }

    async autoMatchReconciliation(userId: string, companyId: string, reconId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const recon = await this.repo.findReconciliationById(wid, reconId)
        if (!recon) throw new NotFoundException('Reconciliation not found')
        if (recon.status === 'COMPLETED') throw new BadRequestException('Reconciliation is already completed')

        // Fetch unmatched bank transactions for this account
        const transactions = await this.prisma.bankTransaction.findMany({
            where: { workspaceId: wid, bankAccountId: recon.bankAccountId },
        })
        const alreadyMatchedIds = new Set((recon.BankReconciliationLine ?? []).filter((l: any) => l.matched).map((l: any) => l.bankTransactionId))
        const unmatched = transactions.filter((t: any) => !alreadyMatchedIds.has(t.id))

        // Simple exact match: match transactions within statement period
        const statementDate = new Date(recon.statementDate)
        const matchCandidates = unmatched.filter((t: any) => new Date(t.date) <= statementDate)

        let matched = 0
        for (const txn of matchCandidates) {
            await this.repo.matchTransactionToJournalLine(wid, reconId, {
                bankTransactionId: txn.id, matchType: 'AUTO',
            })
            matched++
        }
        return { matched, total: unmatched.length }
    }

    async getReconciliationDiscrepancies(userId: string, companyId: string, reconId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const recon = await this.repo.findReconciliationById(wid, reconId)
        if (!recon) throw new NotFoundException('Reconciliation not found')

        const lines: any[] = (recon as any).BankReconciliationLine ?? []
        const matchedLines = lines.filter((l: any) => l.matched)
        const closingBalance = Number(recon.closingBalance)
        const clearedSum = matchedLines.reduce((s: number, l: any) => s + Number(l.bankTransaction?.amount ?? 0), 0)
        const difference = closingBalance - clearedSum

        return {
            reconId, status: recon.status,
            statementBalance: closingBalance,
            clearedBalance: clearedSum,
            difference,
            isBalanced: Math.abs(difference) < 0.01,
            clearedCount: matchedLines.length,
            unclearedCount: lines.filter((l: any) => !l.matched).length,
        }
    }

    async addReconciliationAdjustment(userId: string, companyId: string, reconId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const recon = await this.repo.findReconciliationById(wid, reconId)
        if (!recon) throw new NotFoundException('Reconciliation not found')
        if (recon.status === 'COMPLETED') throw new BadRequestException('Cannot add adjustment to a completed reconciliation')
        if (!data.description) throw new BadRequestException('description is required')
        if (data.amount === undefined) throw new BadRequestException('amount is required')

        // Create an adjustment bank transaction and immediately match it to the reconciliation
        const adjAmount = data.type === 'DEBIT' ? -Math.abs(Number(data.amount)) : Math.abs(Number(data.amount))
        const adjTxn = await this.prisma.bankTransaction.create({
            data: {
                workspaceId: wid,
                bankAccountId: recon.bankAccountId,
                date: new Date(),
                description: `[Adjustment] ${data.description}`,
                amount: adjAmount,
            },
        })
        await this.repo.matchTransactionToJournalLine(wid, reconId, {
            bankTransactionId: adjTxn.id, matchType: 'ADJUSTMENT',
        })
        return { adjustment: adjTxn, message: 'Adjustment added and cleared' }
    }

    // ─── Bank Deposits ────────────────────────────────────────────────────────

    async listDeposits(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findDeposits(companyId, {
            bankAccountId: opts.bankAccountId,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getDeposit(userId: string, companyId: string, depositId: string) {
        await this.assertAccess(userId, companyId)
        const d = await this.repo.findDepositById(companyId, depositId)
        if (!d) throw new NotFoundException('Deposit not found')
        return d
    }

    async createDeposit(userId: string, companyId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.bankAccountId) throw new BadRequestException('bankAccountId is required')
        if (!data.paymentIds?.length) throw new BadRequestException('At least one payment is required')
        return this.repo.createDeposit({
            workspaceId: wid, companyId, bankAccountId: data.bankAccountId,
            depositDate: data.depositDate ? new Date(data.depositDate) : new Date(),
            currency: data.currency, referenceNumber: data.referenceNumber,
            paymentIds: data.paymentIds,
        })
    }

    async postDeposit(userId: string, companyId: string, depositId: string) {
        await this.assertAccess(userId, companyId)
        const result = await this.repo.postDeposit(companyId, depositId)
        if (!result) throw new NotFoundException('Deposit not found')

        await this.subLedger.postBankDepositToGL(depositId, userId)
        return result
    }

    async voidDeposit(userId: string, companyId: string, depositId: string) {
        await this.assertAccess(userId, companyId)
        const d = await this.repo.findDepositById(companyId, depositId)
        if (!d) throw new NotFoundException('Deposit not found')
        if (d.status === 'VOID') throw new BadRequestException('Deposit is already voided')
        return this.repo.voidDeposit(companyId, depositId)
    }

    // ─── Undeposited Funds ────────────────────────────────────────────────────

    async listUndepositedFunds(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.findUndepositedPayments(companyId)
    }

    // ─── Cash Position ────────────────────────────────────────────────────────

    async getCashPosition(userId: string, companyId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.getCashPosition(wid)
    }
    // ─── Smart Rules (BankFeedRule) ──────────────────────────────────

    async listSmartRules(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.bankFeedRule.findMany({ where: { companyId }, orderBy: { priority: 'asc' } })
    }

    async createSmartRule(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return this.prisma.bankFeedRule.create({
            data: {
                companyId,
                name: data.name,
                matchType: data.trigger ?? data.matchType ?? 'CONTAINS',
                matchString: data.condition ?? data.matchString ?? '',
                assignmentPayee: data.action ?? data.assignmentPayee,
                isActive: data.isActive ?? true,
            },
        })
    }

    async updateSmartRule(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.bankFeedRule.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Rule not found')
        return this.prisma.bankFeedRule.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.trigger != null && { matchType: data.trigger }),
                ...(data.condition != null && { matchString: data.condition }),
                ...(data.action != null && { assignmentPayee: data.action }),
                ...(data.isActive != null && { isActive: data.isActive }),
            },
        })
    }

    async deleteSmartRule(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.bankFeedRule.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Rule not found')
        await this.prisma.bankFeedRule.delete({ where: { id } })
        return { success: true }
    }

    // ─── Feed Connections ────────────────────────────────────────────────────

    async listFeedConnections(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.bankFeedConnection.findMany({
            where: { companyId },
            include: { accounts: { include: { bankAccount: { select: { id: true, name: true, institution: true, accountNumber: true } } } } },
            orderBy: { createdAt: 'desc' },
        })
    }

    async createFeedConnection(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        if (!data.provider) throw new BadRequestException('provider is required')
        return this.prisma.bankFeedConnection.create({
            data: {
                workspaceId: wid,
                companyId,
                provider: data.provider,
                externalId: data.externalId,
                status: 'ACTIVE',
            },
        })
    }

    async updateFeedConnection(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const conn = await this.prisma.bankFeedConnection.findFirst({ where: { id, companyId } })
        if (!conn) throw new NotFoundException('Feed connection not found')
        return this.prisma.bankFeedConnection.update({
            where: { id },
            data: {
                ...(data.status && { status: data.status }),
                ...(data.externalId && { externalId: data.externalId }),
            },
        })
    }

    async deleteFeedConnection(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const conn = await this.prisma.bankFeedConnection.findFirst({ where: { id, companyId } })
        if (!conn) throw new NotFoundException('Feed connection not found')
        await this.prisma.bankFeedConnection.delete({ where: { id } })
        return { success: true }
    }

    async syncFeedConnection(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const conn = await this.prisma.bankFeedConnection.findFirst({ where: { id, companyId } })
        if (!conn) throw new NotFoundException('Feed connection not found')
        // Update lastSyncedAt timestamp
        return this.prisma.bankFeedConnection.update({
            where: { id },
            data: { lastSyncedAt: new Date(), status: 'ACTIVE' },
        })
    }

    async getFeedStatus(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const connections = await this.prisma.bankFeedConnection.findMany({
            where: { companyId },
            select: { id: true, status: true, lastSyncedAt: true, provider: true },
        })
        const total = connections.length
        const active = connections.filter(c => c.status === 'ACTIVE').length
        const error = connections.filter(c => c.status === 'ERROR').length
        return { total, active, error, connections }
    }

    // ─── Credit Cards ─────────────────────────────────────────────────────────

    async listCreditCards(userId: string, companyId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        // Credit cards are bank accounts whose balance is negative (liabilities).
        // We return all bank accounts and let the frontend distinguish them, or
        // the user can label them accordingly.
        const accounts = await this.prisma.bankAccount.findMany({
            where: { workspaceId: wid, deletedAt: null },
            select: {
                id: true, name: true, institution: true, accountNumber: true,
                isDefault: true, createdAt: true,
            },
        })
        const result = await Promise.all(accounts.map(async (acct) => {
            const agg = await this.prisma.bankTransaction.aggregate({
                where: { bankAccountId: acct.id }, _sum: { amount: true },
            })
            return { ...acct, currentBalance: Number(agg._sum.amount ?? 0) }
        }))
        // Return accounts with negative balances as credit card candidates
        return result.filter(a => a.currentBalance < 0 || a.name.toLowerCase().includes('credit') || a.name.toLowerCase().includes('card'))
    }

    async listCardStatements(userId: string, companyId: string, cardId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const acct = await this.prisma.bankAccount.findFirst({ where: { id: cardId, workspaceId: wid, deletedAt: null } })
        if (!acct) throw new NotFoundException('Card account not found')
        // Group transactions by month as statement periods
        const txns = await this.prisma.bankTransaction.findMany({
            where: { bankAccountId: cardId },
            orderBy: { date: 'desc' },
        })
        const months = new Map<string, any[]>()
        for (const t of txns) {
            const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`
            if (!months.has(key)) months.set(key, [])
            months.get(key)!.push(t)
        }
        return Array.from(months.entries()).map(([period, items]) => {
            const charges = items.filter(i => Number(i.amount) < 0).reduce((s, i) => s + Math.abs(Number(i.amount)), 0)
            const payments = items.filter(i => Number(i.amount) > 0).reduce((s, i) => s + Number(i.amount), 0)
            return { period, card: acct.name, charges, payments, netBalance: charges - payments, transactionCount: items.length }
        })
    }

    // ─── Checks ───────────────────────────────────────────────────────────────

    async listChecks(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const where: any = { companyId }
        if (opts?.status) where.status = opts.status
        return this.prisma.check.findMany({
            where,
            include: { bankAccount: { select: { name: true, accountNumber: true } } },
            orderBy: { date: 'desc' },
            take: opts?.limit ? parseInt(opts.limit) : 100,
        })
    }

    async createCheck(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.bankAccountId) throw new BadRequestException('bankAccountId is required')
        if (!data.payee) throw new BadRequestException('payee is required')
        if (data.amount === undefined) throw new BadRequestException('amount is required')
        if (!data.checkNumber) throw new BadRequestException('checkNumber is required')
        return this.prisma.check.create({
            data: {
                companyId,
                bankAccountId: data.bankAccountId,
                checkNumber: data.checkNumber,
                payee: data.payee,
                amount: data.amount,
                date: data.date ? new Date(data.date) : new Date(),
                memo: data.memo,
                status: 'DRAFT',
            },
        })
    }

    async updateCheck(userId: string, companyId: string, checkId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const check = await this.prisma.check.findFirst({ where: { id: checkId, companyId } })
        if (!check) throw new NotFoundException('Check not found')
        return this.prisma.check.update({
            where: { id: checkId },
            data: {
                ...(data.status && { status: data.status }),
                ...(data.memo !== undefined && { memo: data.memo }),
                ...(data.status === 'CLEARED' && { clearedAt: new Date() }),
                ...(data.status === 'VOID' && { voidedAt: new Date() }),
                ...(data.status === 'ISSUED' && { issuedAt: new Date() }),
                ...(data.status === 'PRINTED' && { printedAt: new Date() }),
            },
        })
    }
}
