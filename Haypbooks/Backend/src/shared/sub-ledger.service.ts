import { Injectable, Logger } from '@nestjs/common'
import fs from 'fs'
import path from 'path'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { createAndPostJE, resolveAccount, SYSTEM_ACCOUNTS } from './gl-integration'

/**
 * SubLedgerService — the bridge between the AR/AP sub-ledgers and the General Ledger.
 *
 * Whenever an Invoice is sent, a Bill is approved, or a payment is recorded,
 * this service creates the corresponding POSTED JournalEntry so the GL
 * always reflects the full accounting picture.
 *
 * Account lookup strategy (by COA code, Philippine default):
 *   1100 — Accounts Receivable
 *   2010 — Accounts Payable
 *   2050 — Output VAT Payable
 *   1130 — Input VAT (Input Tax)   [assets]
 *   2060 — EWT Payable
 *   4010 — Sales Revenue (fallback when line has no accountId)
 *   5010 — Cost of Goods Sold / Purchases (fallback for AP lines)
 *   1010 — Cash (fallback bank account for payments)
 */
@Injectable()
export class SubLedgerService {
  private readonly logger = new Logger(SubLedgerService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ─── Account Lookup Helpers ───────────────────────────────────────────────

  private async findAccountByCode(companyId: string, code: string, tx?: any): Promise<string | null> {
    const db = tx ?? this.prisma
    const account = await db.account.findFirst({
      where: { companyId, code, deletedAt: null },
      select: { id: true },
    })
    return account?.id ?? null
  }

  private async resolveAccount(companyId: string, preferredId: string | null | undefined, fallbackCode: string, tx?: any): Promise<string | null> {
    if (preferredId) return preferredId
    return this.findAccountByCode(companyId, fallbackCode, tx)
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
  }

  private async findTaxLiabilityAccount(companyId: string): Promise<string | null> {
    const commonTaxLiabilityCodes = ['2050', '2051', '2205', '2200']
    for (const code of commonTaxLiabilityCodes) {
      const accountId = await this.findAccountByCode(companyId, code)
      if (accountId) return accountId
    }

    const fallback = await this.prisma.account.findFirst({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
        OR: [
          { name: { contains: 'Output VAT', mode: 'insensitive' } },
          { name: { contains: 'VAT Payable', mode: 'insensitive' } },
          { name: { contains: 'Sales Tax Payable', mode: 'insensitive' } },
          { name: { contains: 'Tax Payable', mode: 'insensitive' } },
        ],
      },
      select: { id: true },
      orderBy: [{ isSystem: 'desc' }, { code: 'asc' }],
    })
    return fallback?.id ?? null
  }

  // ─── Entry Number Generator ───────────────────────────────────────────────

  private async nextEntryNumber(companyId: string, prefix: string): Promise<string> {
    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { companyId, entryNumber: { startsWith: `${prefix}-` } },
      orderBy: { entryNumber: 'desc' },
      select: { entryNumber: true },
    })
    const lastNumber = lastEntry?.entryNumber?.match(new RegExp(`^${prefix}-(\\d+)$`))
    const next = lastNumber ? Number(lastNumber[1]) + 1 : 1
    return `${prefix}-${String(next).padStart(6, '0')}`
  }

  // ─── Core: create + immediately post a JE inside a transaction ────────────

  private async resolveCurrency(companyId: string, currency?: string): Promise<string> {
    if (currency) return currency
    const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { currency: true } })
    return company?.currency ?? 'PHP'
  }

  private async createPostedJE(tx: any, data: {
    workspaceId: string
    companyId: string
    date: Date
    description: string
    currency?: string
    createdById?: string
    entryNumber: string
    lines: Array<{ accountId: string; debit: number; credit: number; memo?: string }>
  }) {
    const totalDebit = data.lines.reduce((s, l) => s + l.debit, 0)
    const totalCredit = data.lines.reduce((s, l) => s + l.credit, 0)
    if (Math.abs(totalDebit - totalCredit) > 0.005) {
      this.logger.warn(`[SubLedger] Unbalanced JE skipped: ${data.entryNumber} (DR=${totalDebit} CR=${totalCredit})`)
      return null
    }

    const created = await tx.journalEntry.create({
      data: {
        workspaceId: data.workspaceId,
        companyId: data.companyId,
        date: data.date,
        description: data.description,
        currency: await this.resolveCurrency(data.companyId, data.currency),
        postingStatus: 'POSTED',
        entryNumber: data.entryNumber,
        createdById: data.createdById ?? null,
        lines: {
          create: data.lines.map(l => ({
            companyId: data.companyId,
            workspaceId: data.workspaceId,
            accountId: l.accountId,
            debit: l.debit,
            credit: l.credit,
            description: l.memo,
          })),
        },
      },
    })

    // Update account balances for each line (same logic as postJournalEntry)
    for (const line of data.lines) {
      const acct = await tx.account.findUnique({ where: { id: line.accountId } })
      if (!acct) continue
      const normalSide = (acct.normalSide as string) ?? 'DEBIT'
      const balanceDelta = normalSide === 'DEBIT'
        ? line.debit - line.credit
        : line.credit - line.debit
      await tx.account.update({
        where: { id: line.accountId },
        data: { balance: { increment: balanceDelta } },
      })
    }

    return created
  }

  private async findExpenseAccount(companyId: string, tx?: any): Promise<string | null> {
    const db = tx ?? this.prisma
    const account = await db.account.findFirst({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
        typeId: 2,
      },
      select: { id: true },
      orderBy: { code: 'asc' },
    })
    return account?.id ?? null
  }

  private async findAccountById(companyId: string, accountId: string, tx?: any): Promise<string | null> {
    const db = tx ?? this.prisma
    const account = await db.account.findFirst({
      where: { id: accountId, companyId, deletedAt: null, isActive: true },
      select: { id: true },
    })
    return account?.id ?? null
  }

  // ─── AR: Invoice Posted (DR: AR  CR: Revenue + Output VAT) ───────────────

  /**
   * Called when an invoice transitions from DRAFT → SENT or POSTED.
   * Creates a POSTED JournalEntry:
   *   DR Accounts Receivable  (gross amount incl. VAT)
   *   CR Revenue              (net amount per line)
   *   CR Output VAT Payable   (VAT portion)
   *
   * The entry is linked back to the invoice via journalEntryId.
   */
  async postInvoiceToGL(invoiceId: string, postedById?: string): Promise<void> {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { lines: { include: { LineTax: true } } },
      })
      if (!invoice) return
      if (invoice.journalEntryId) return // already posted

      const arAccountId = await this.findAccountByCode(invoice.companyId, '1100')
      const revenueAccountFallbackId = await this.findAccountByCode(invoice.companyId, '4010')
      const vatOutputAccountId = await this.findTaxLiabilityAccount(invoice.companyId)

      if (!arAccountId || !revenueAccountFallbackId) {
        this.logger.warn(`[SubLedger] Cannot post invoice ${invoiceId}: AR or Revenue account not found`)
        return
      }

      const lines = invoice.lines as any[]
      const grossTotal = this.roundMoney(Number(invoice.totalAmount ?? 0))

      // Build credit lines — one per invoice line
      const creditLines: Array<{ accountId: string; debit: number; credit: number; memo?: string }> = []
      let totalVatFromLineTaxes = 0
      let lineGrossTotal = 0

      for (const line of lines) {
        const lineAmount = this.roundMoney(Number(line.totalPrice ?? line.amount ?? 0))
        lineGrossTotal += lineAmount

        const lineTaxAmount = this.roundMoney(
          Array.isArray(line.LineTax)
            ? line.LineTax.reduce((sum: number, tax: any) => sum + Number(tax.amount ?? 0), 0)
            : 0,
        )
        const lineNetRevenue = Math.max(0, this.roundMoney(lineAmount - lineTaxAmount))

        const revenueAccountId = await this.resolveAccount(invoice.companyId, line.accountId, '4010')
        if (!revenueAccountId) continue

        if (lineNetRevenue > 0.005) {
          creditLines.push({ accountId: revenueAccountId, debit: 0, credit: lineNetRevenue, memo: line.description })
        }
        totalVatFromLineTaxes += lineTaxAmount
      }

      // Fallback in case no lines were credited (safety for malformed input)
      if (creditLines.length === 0) {
        creditLines.push({ accountId: revenueAccountFallbackId, debit: 0, credit: grossTotal, memo: 'Revenue' })
      }

      // Prefer tax from line-level tax records. If unavailable, infer from invoice header delta.
      let totalVat = this.roundMoney(totalVatFromLineTaxes)
      if (totalVat <= 0.005) {
        const inferredVat = this.roundMoney(grossTotal - this.roundMoney(lineGrossTotal))
        if (inferredVat > 0.005) totalVat = inferredVat
      }

      if (totalVat > 0.005) {
        if (vatOutputAccountId) {
          creditLines.push({ accountId: vatOutputAccountId, debit: 0, credit: totalVat, memo: 'Sales tax liability' })
        } else {
          this.logger.warn(`[SubLedger] Invoice ${invoiceId} has tax amount ${totalVat} but no tax liability account was found`)
        }
      }

      // Keep the JE balanced to the invoice gross amount.
      let totalCredit = this.roundMoney(creditLines.reduce((s, l) => s + l.credit, 0))
      const delta = this.roundMoney(grossTotal - totalCredit)
      if (Math.abs(delta) > 0.005) {
        creditLines[0].credit = this.roundMoney(creditLines[0].credit + delta)
        totalCredit = this.roundMoney(creditLines.reduce((s, l) => s + l.credit, 0))
      }

      // DR Accounts Receivable for the full gross amount
      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(invoice.companyId, 'AR')
        const je = await this.createPostedJE(tx, {
          workspaceId: invoice.workspaceId,
          companyId: invoice.companyId,
          date: (invoice as any).issuedAt ?? (invoice as any).date ?? new Date(),
          description: `Invoice ${(invoice as any).invoiceNumber ?? invoiceId}`,
          currency: invoice.currency ?? undefined,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: arAccountId, debit: totalCredit, credit: 0, memo: 'Accounts Receivable' },
            ...creditLines,
          ],
        })

        if (je) {
          await tx.invoice.update({ where: { id: invoiceId }, data: { journalEntryId: je.id, postingStatus: 'POSTED' as any } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post invoice ${invoiceId}: ${err?.message}`)
    }
  }

  // ─── AR: Invoice Reversed (DR: Revenue/Tax  CR: AR) ─────────────────────

  async reverseInvoiceGL(invoiceId: string, postedById?: string): Promise<void> {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: {
          id: true,
          companyId: true,
          workspaceId: true,
          invoiceNumber: true,
          currency: true,
          journalEntryId: true,
        },
      })
      if (!invoice?.journalEntryId) return

      const originalJE = await this.prisma.journalEntry.findUnique({
        where: { id: invoice.journalEntryId },
        include: { lines: true },
      })
      if (!originalJE || !originalJE.lines.length) return

      const reversalLines = originalJE.lines.map((line: any) => ({
        accountId: line.accountId,
        debit: Number(line.credit ?? 0),
        credit: Number(line.debit ?? 0),
        memo: line.description ? `Reversal: ${line.description}` : 'Invoice reversal',
      }))

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(invoice.companyId, 'ARV')
        const je = await this.createPostedJE(tx, {
          workspaceId: invoice.workspaceId,
          companyId: invoice.companyId,
          date: new Date(),
          description: `Invoice reversal ${invoice.invoiceNumber ?? invoice.id}`,
          currency: invoice.currency ?? undefined,
          createdById: postedById,
          entryNumber,
          lines: reversalLines,
        })

        if (je) {
          await tx.journalEntry.update({ where: { id: originalJE.id }, data: { postingStatus: 'VOIDED' as any } })
          await tx.invoice.update({ where: { id: invoiceId }, data: { journalEntryId: null } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to reverse invoice ${invoiceId}: ${err?.message}`)
    }
  }

  // ─── AR: Payment Received (DR: Cash/Bank  CR: Accounts Receivable) ────────

  /**
   * Called when a PaymentReceived is created.
   * Creates a POSTED JournalEntry:
   *   DR Cash / Bank Account   (payment amount)
   *   CR Accounts Receivable   (payment amount)
   */
  async postPaymentReceivedToGL(paymentId: string, postedById?: string): Promise<void> {
    try {
      const payment = await this.prisma.paymentReceived.findUnique({ where: { id: paymentId } })
      if (!payment) return
      if ((payment as any).journalEntryId) return

      const arAccountId = await this.findAccountByCode((payment as any).companyId, '1100')
      const cashAccountId = await this.resolveAccount((payment as any).companyId, null, '1010')

      if (!arAccountId || !cashAccountId) {
        this.logger.warn(`[SubLedger] Cannot post payment ${paymentId}: required accounts not found`)
        return
      }

      const amount = Number((payment as any).amount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber((payment as any).companyId, 'RCP')
        const je = await this.createPostedJE(tx, {
          workspaceId: (payment as any).workspaceId,
          companyId: (payment as any).companyId,
          date: (payment as any).paymentDate ?? new Date(),
          description: `Receipt ${(payment as any).referenceNumber ?? paymentId}`,
          currency: (payment as any).currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: cashAccountId, debit: amount, credit: 0, memo: 'Cash received' },
            { accountId: arAccountId, debit: 0, credit: amount, memo: 'Accounts Receivable' },
          ],
        })

        if (je) {
          await tx.paymentReceived.update({ where: { id: paymentId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post payment ${paymentId}: ${err?.message}`)
    }
  }

  // ─── AR: Reverse Payment Received (DR: Accounts Receivable  CR: Cash/Bank) ─

  /**
   * Called when a PaymentReceived is voided.
   * Reverses the original receipt JournalEntry by swapping debit/credit:
   *   DR Accounts Receivable   (payment amount)
   *   CR Cash / Bank Account   (payment amount)
   * Marks the original JE as VOIDED and clears journalEntryId on the payment.
   */
  async reversePaymentReceivedGL(paymentId: string, postedById?: string): Promise<void> {
    try {
      const payment = await this.prisma.paymentReceived.findUnique({ where: { id: paymentId } })
      if (!payment) return
      if (!(payment as any).journalEntryId) return

      const originalJE = await this.prisma.journalEntry.findUnique({
        where: { id: (payment as any).journalEntryId },
        include: { lines: true },
      })
      if (!originalJE || !originalJE.lines.length) return

      const reversalLines = originalJE.lines.map((line: any) => ({
        accountId: line.accountId,
        debit: Number(line.credit ?? 0),
        credit: Number(line.debit ?? 0),
        memo: line.description ? `Reversal: ${line.description}` : 'Payment receipt reversal',
      }))

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber((payment as any).companyId, 'RVP')
        const je = await this.createPostedJE(tx, {
          workspaceId: (payment as any).workspaceId,
          companyId: (payment as any).companyId,
          date: new Date(),
          description: `Payment reversal ${(payment as any).referenceNumber ?? paymentId}`,
          currency: (payment as any).currency,
          createdById: postedById,
          entryNumber,
          lines: reversalLines,
        })

        if (je) {
          await tx.journalEntry.update({ where: { id: originalJE.id }, data: { postingStatus: 'VOIDED' as any } })
          await tx.paymentReceived.update({ where: { id: paymentId }, data: { journalEntryId: null } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to reverse payment ${paymentId}: ${err?.message}`)
    }
  }

  // ─── AP: Bill Approved (DR: Expense/VAT Input/EWT  CR: Accounts Payable) ──

  /**
   * Called when a Bill transitions from DRAFT → APPROVED.
   * Creates a POSTED JournalEntry:
   *   DR Expense accounts     (net amount per line)
   *   DR Input VAT            (VAT portion, if applicable)
   *   DR EWT Payable          (EWT deducted at source, if applicable)
   *   CR Accounts Payable     (gross amount less EWT)
   *
   * Philippine EWT: the EWT reduces the AP amount — vendor invoices for
   * ₱1,000 + 12% VAT = ₱1,120 gross, less 1% EWT = ₱10.
   * DR Expense 1,000 | DR Input VAT 120 | CR AP 1,110 | CR EWT Payable 10
   */
  async postBillToGL(billId: string, postedById?: string, tx?: any): Promise<void> {
    try {
      const db = tx ?? this.prisma
      const bill = await db.bill.findUnique({
        where: { id: billId },
        include: { lines: { include: { LineTax: true } } },
      })
      if (!bill) return
      if (bill.journalEntryId) return

      const apAccount = await resolveAccount(db, bill.companyId, SYSTEM_ACCOUNTS.ACCOUNTS_PAYABLE)
      const apAccountId = apAccount?.id ?? null
      const vatInputAccountId = await this.findAccountByCode(bill.companyId, '1130', db)
      const ewtPayableAccountId = await this.findAccountByCode(bill.companyId, '2060', db)
      const expenseFallbackId = await this.findAccountByCode(bill.companyId, '5010', db)
      const expenseDefaultId = expenseFallbackId ?? await this.findExpenseAccount(bill.companyId, db)
      const resolvedExpenseAccountId = expenseDefaultId ?? (await resolveAccount(db, bill.companyId, { code: '5010', name: 'Cost of Goods Sold', typeId: 2 })).id

      if (!apAccountId) {
        const message = `[SubLedger] Cannot post bill ${billId}: Accounts Payable account (2010) not found`
        if (tx) throw new Error(message)
        this.logger.warn(message)
        return
      }

      const lines = bill.lines as any[]
      const debitLines: Array<{ accountId: string; debit: number; credit: number; memo?: string }> = []
      let totalVatInput = 0

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index]
        const amount = Number(line.amount ?? 0)
        const lineTaxAmount = Array.isArray(line.LineTax)
          ? line.LineTax.reduce((sum: number, tax: any) => sum + Number(tax.amount ?? 0), 0)
          : 0
        const netExpense = Math.max(0, amount - lineTaxAmount)

        const preferredExpenseAccountId = line.accountId ? await this.findAccountById(bill.companyId, line.accountId, tx) : null
        const expenseAccountId = preferredExpenseAccountId || resolvedExpenseAccountId
        if (!expenseAccountId) {
          throw new Error(`No expense account on line item ${index + 1} and no default expense account (5010) found for this company`)
        }

        if (netExpense > 0.005) {
          debitLines.push({ accountId: expenseAccountId, debit: netExpense, credit: 0, memo: line.description })
        }

        totalVatInput += lineTaxAmount
      }

      if (totalVatInput > 0.005 && !vatInputAccountId) {
        this.logger.warn(`[SubLedger] Bill ${billId} has VAT amount ${totalVatInput} but no Input VAT account (1130) found; VAT line skipped`)
      }

      if (totalVatInput > 0.005 && vatInputAccountId) {
        debitLines.push({ accountId: vatInputAccountId, debit: totalVatInput, credit: 0, memo: 'Input VAT' })
      }

      const ewtAmount = Number((bill as any).ewtAmount ?? 0)
      const totalDebits = debitLines.reduce((s, l) => s + l.debit, 0)
      const apCredit = totalDebits - ewtAmount

      const finalLines: Array<{ accountId: string; debit: number; credit: number; memo?: string }> = [
        ...debitLines,
        { accountId: apAccountId, debit: 0, credit: apCredit, memo: 'Accounts Payable' },
      ]

      if (ewtAmount > 0.005 && ewtPayableAccountId) {
        finalLines.push({ accountId: ewtPayableAccountId, debit: 0, credit: ewtAmount, memo: 'EWT Payable' })
      }

      if (tx) {
        const entryNumber = await this.nextEntryNumber(bill.companyId, 'AP')
        const je = await createAndPostJE(tx, {
          workspaceId: bill.workspaceId,
          companyId: bill.companyId,
          date: (bill as any).issuedAt ?? (bill as any).date ?? new Date(),
          description: `Bill ${(bill as any).billNumber ?? billId}`,
          currency: bill.currency ?? undefined,
          createdById: postedById,
          entryNumber,
          transactionSource: 'Bill',
          sourceReferenceId: billId,
          lines: finalLines,
        })

        if (je) {
          await tx.bill.update({ where: { id: billId }, data: { journalEntryId: je } })
        }
      } else {
        await this.prisma.$transaction(async (txClient) => {
          const entryNumber = await this.nextEntryNumber(bill.companyId, 'AP')
          const je = await createAndPostJE(txClient, {
            workspaceId: bill.workspaceId,
            companyId: bill.companyId,
            date: (bill as any).issuedAt ?? (bill as any).date ?? new Date(),
            description: `Bill ${(bill as any).billNumber ?? billId}`,
            currency: bill.currency ?? undefined,
            createdById: postedById,
            entryNumber,
            transactionSource: 'Bill',
            sourceReferenceId: billId,
            lines: finalLines,
          })

          if (je) {
            await txClient.bill.update({ where: { id: billId }, data: { journalEntryId: je } })
          }
        })
      }
    } catch (err: any) {
      const message = `[SubLedger] Failed to post bill ${billId}: ${err?.message ?? String(err)}`
      this.logger.error(message, err?.stack ?? String(err))
      console.error(message)
      console.error(err)
      try {
        const logDir = path.join(process.cwd(), 'tmp')
        fs.mkdirSync(logDir, { recursive: true })
        const logPath = path.join(logDir, 'subledger-postbill-errors.log')
        fs.appendFileSync(logPath, `${new Date().toISOString()} ${message}\n${err?.stack ?? String(err)}\n\n`)
      } catch {
        /* ignore logging failures */
      }
      if (tx) throw err
    }
  }

  // ─── AP: Bill Payment (DR: Accounts Payable  CR: Cash/Bank) ──────────────

  /**
   * Called when a BillPayment is recorded.
   * Creates a POSTED JournalEntry:
   *   DR Accounts Payable   (payment amount)
   *   CR Cash / Bank        (payment amount)
   */
  async postBillPaymentToGL(billPaymentId: string, postedById?: string): Promise<void> {
    try {
      const payment = await this.prisma.billPayment.findUnique({ where: { id: billPaymentId } })
      if (!payment) return
      if (payment.journalEntryId) return
      if (!payment.companyId) {
        this.logger.warn(`[SubLedger] BillPayment ${billPaymentId} has no companyId — skipping GL post`)
        return
      }
      // Capture as non-nullable local to satisfy TypeScript inside async closures
      const companyId = payment.companyId

      const apAccountId = await this.findAccountByCode(companyId, '2010')
      const cashAccountId = await this.resolveAccount(companyId, payment.bankAccountId ?? null, '1010')

      if (!apAccountId || !cashAccountId) {
        this.logger.warn(`[SubLedger] Cannot post bill payment ${billPaymentId}: required accounts not found`)
        return
      }

      const amount = Number(payment.amount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(companyId, 'DIS')
        const je = await this.createPostedJE(tx, {
          workspaceId: payment.workspaceId,
          companyId,
          date: payment.paymentDate ?? new Date(),
          description: `Bill Payment ${payment.referenceNumber ?? billPaymentId}`,
          currency: payment.currency ?? undefined,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: apAccountId, debit: amount, credit: 0, memo: 'Accounts Payable' },
            { accountId: cashAccountId, debit: 0, credit: amount, memo: 'Cash disbursed' },
          ],
        })

        if (je) {
          await tx.billPayment.update({ where: { id: billPaymentId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post bill payment ${billPaymentId}: ${err?.message}`)
    }
  }

  // ─── Banking: Bank Deposit Posted (DR: Cash/Bank CR: Undeposited Funds) ──

  async postBankDepositToGL(depositId: string, postedById?: string): Promise<void> {
    try {
      const deposit = await this.prisma.bankDeposit.findUnique({ where: { id: depositId } })
      if (!deposit) return
      if ((deposit as any).journalEntryId) return

      const cashAccountId = await this.resolveAccount(
        deposit.companyId,
        (deposit as any).bankAccountId,
        '1010',
      )
      const undepositedFundsId = await this.findAccountByCode(deposit.companyId, '1050')

      if (!cashAccountId || !undepositedFundsId) {
        this.logger.warn(`[SubLedger] Cannot post bank deposit ${depositId}: required accounts not found`)
        return
      }

      const amount = Number((deposit as any).amount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(deposit.companyId, 'BD')
        const je = await this.createPostedJE(tx, {
          workspaceId: deposit.workspaceId,
          companyId: deposit.companyId,
          date: (deposit as any).depositDate ?? (deposit as any).date ?? new Date(),
          description: `Bank Deposit ${(deposit as any).referenceNumber ?? depositId}`,
          currency: (deposit as any).currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: cashAccountId, debit: amount, credit: 0, memo: 'Bank deposit' },
            { accountId: undepositedFundsId, debit: 0, credit: amount, memo: 'Undeposited funds' },
          ],
        })

        if (je) {
          await tx.bankDeposit.update({ where: { id: depositId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post bank deposit ${depositId}: ${err?.message}`)
    }
  }

  // ─── AR: Customer Refund (DR: Revenue CR: AR - reverses invoice) ───────────

  async postCustomerRefundToGL(refundId: string, postedById?: string): Promise<void> {
    try {
      const refund = await this.prisma.customerRefund.findUnique({
        where: { id: refundId },
      })
      if (!refund) return
      if ((refund as any).journalEntryId) return

      const arAccountId = await this.findAccountByCode(refund.companyId, '1100')
      const revenueAccountId = await this.findAccountByCode(refund.companyId, '4010')

      if (!arAccountId || !revenueAccountId) {
        this.logger.warn(`[SubLedger] Cannot post customer refund ${refundId}`)
        return
      }

      const amount = Number((refund as any).amount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(refund.companyId, 'CRF')
        const je = await this.createPostedJE(tx, {
          workspaceId: refund.workspaceId,
          companyId: refund.companyId,
          date: (refund as any).refundDate ?? new Date(),
          description: `Customer Refund ${(refund as any).referenceNumber ?? refundId}`,
          currency: (refund as any).currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: revenueAccountId, debit: amount, credit: 0, memo: 'Revenue reversal (refund)' },
            { accountId: arAccountId, debit: 0, credit: amount, memo: 'AR reduction (refund)' },
          ],
        })

        if (je) {
          await tx.customerRefund.update({ where: { id: refundId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post customer refund ${refundId}: ${err?.message}`)
    }
  }

  // ─── AP: Vendor Refund (DR: AP CR: Expense - reverses bill) ────────────────

  async postVendorRefundToGL(refundId: string, postedById?: string): Promise<void> {
    try {
      const refund = await this.prisma.vendorRefund.findUnique({
        where: { id: refundId },
      })
      if (!refund) return
      if ((refund as any).journalEntryId) return

      const apAccount = await resolveAccount(this.prisma, refund.companyId, SYSTEM_ACCOUNTS.ACCOUNTS_PAYABLE)
      const apAccountId = apAccount?.id ?? null
      const expenseAccount = await resolveAccount(this.prisma, refund.companyId, { code: '5010', name: 'Cost of Goods Sold', typeId: 2 })
      const expenseAccountId = expenseAccount?.id ?? null

      if (!apAccountId || !expenseAccountId) {
        this.logger.warn(`[SubLedger] Cannot post vendor refund ${refundId}`)
        return
      }

      const amount = Number((refund as any).amount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(refund.companyId, 'VRF')
        const je = await this.createPostedJE(tx, {
          workspaceId: refund.workspaceId,
          companyId: refund.companyId,
          date: (refund as any).refundDate ?? new Date(),
          description: `Vendor Refund ${(refund as any).referenceNumber ?? refundId}`,
          currency: (refund as any).currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: apAccountId, debit: amount, credit: 0, memo: 'AP reduction (vendor refund)' },
            { accountId: expenseAccountId, debit: 0, credit: amount, memo: 'Expense reversal (vendor refund)' },
          ],
        })

        if (je) {
          await tx.vendorRefund.update({ where: { id: refundId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post vendor refund ${refundId}: ${err?.message}`)
    }
  }

  // ─── AR: Credit Note Issued (DR: Sales Returns & Allowances  CR: AR) ──────

  /**
   * Called when a CreditNote is created.
   * Creates a POSTED JournalEntry:
   *   DR Sales Returns and Allowances  (4040 — contra-revenue)
   *   CR Accounts Receivable           (1100)
   */
  async postCreditNoteToGL(creditNoteId: string, postedById?: string): Promise<void> {
    try {
      const cn = await this.prisma.creditNote.findUnique({ where: { id: creditNoteId } })
      if (!cn) return
      if (cn.journalEntryId) return // already posted

      const company = await this.prisma.company.findUnique({
        where: { id: cn.companyId },
        select: { workspaceId: true, currency: true },
      })
      if (!company) return

      const arAccountId = await this.findAccountByCode(cn.companyId, '1100')
      const salesReturnsId = await this.findAccountByCode(cn.companyId, '4040')

      if (!arAccountId || !salesReturnsId) {
        this.logger.warn(`[SubLedger] Cannot post credit note ${creditNoteId}: AR (1100) or Sales Returns (4040) account not found`)
        return
      }

      const amount = Number(cn.totalAmount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(cn.companyId, 'CN')
        const je = await this.createPostedJE(tx, {
          workspaceId: company.workspaceId,
          companyId: cn.companyId,
          date: cn.issuedAt ?? new Date(),
          description: `Credit Note ${cn.creditNoteNumber}`,
          currency: company.currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: salesReturnsId, debit: amount, credit: 0, memo: 'Sales returns and allowances' },
            { accountId: arAccountId, debit: 0, credit: amount, memo: 'Accounts Receivable reduction' },
          ],
        })

        if (je) {
          await tx.creditNote.update({ where: { id: creditNoteId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post credit note ${creditNoteId}: ${err?.message}`)
    }
  }

  // ─── AR: Credit Note Voided (DR: AR  CR: Sales Returns & Allowances) ───────

  /**
   * Called when a CreditNote is voided.
   * Reverses the original credit note GL entry:
   *   DR Accounts Receivable          (1100)
   *   CR Sales Returns and Allowances (4040)
   */
  async reverseCreditNoteGL(creditNoteId: string, postedById?: string): Promise<void> {
    try {
      const cn = await this.prisma.creditNote.findUnique({ where: { id: creditNoteId } })
      if (!cn) return

      const company = await this.prisma.company.findUnique({
        where: { id: cn.companyId },
        select: { workspaceId: true, currency: true },
      })
      if (!company) return

      const arAccountId = await this.findAccountByCode(cn.companyId, '1100')
      const salesReturnsId = await this.findAccountByCode(cn.companyId, '4040')

      if (!arAccountId || !salesReturnsId) {
        this.logger.warn(`[SubLedger] Cannot reverse credit note ${creditNoteId}: required accounts not found`)
        return
      }

      const amount = Number(cn.totalAmount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(cn.companyId, 'CNV')
        await this.createPostedJE(tx, {
          workspaceId: company.workspaceId,
          companyId: cn.companyId,
          date: new Date(),
          description: `Credit Note Void ${cn.creditNoteNumber}`,
          currency: company.currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: arAccountId, debit: amount, credit: 0, memo: 'AR reversal (credit note voided)' },
            { accountId: salesReturnsId, debit: 0, credit: amount, memo: 'Sales returns reversal' },
          ],
        })
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to reverse credit note ${creditNoteId}: ${err?.message}`)
    }
  }

  // ─── AR: Write-Off Approved (DR: Bad Debt Expense  CR: Accounts Receivable) ─

  /**
   * Called when a Write-Off is approved.
   * Creates a POSTED JournalEntry:
   *   DR Bad Debt Expense      (6100)
   *   CR Accounts Receivable   (1100)
   */
  async postWriteOffToGL(writeOffId: string, postedById?: string): Promise<void> {
    try {
      const writeOff = await this.prisma.writeOff.findUnique({ where: { id: writeOffId } })
      if (!writeOff) return
      if (writeOff.journalEntryId) return // already posted

      const company = await this.prisma.company.findUnique({
        where: { id: writeOff.companyId },
        select: { workspaceId: true, currency: true },
      })
      if (!company) return

      const arAccountId = await this.findAccountByCode(writeOff.companyId, '1100')
      const badDebtAccountId = await this.findAccountByCode(writeOff.companyId, '6100')

      if (!arAccountId || !badDebtAccountId) {
        this.logger.warn(`[SubLedger] Cannot post write-off ${writeOffId}: Bad Debt (6100) or AR (1100) account not found`)
        return
      }

      const amount = Number(writeOff.amount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(writeOff.companyId, 'WO')
        const je = await this.createPostedJE(tx, {
          workspaceId: company.workspaceId,
          companyId: writeOff.companyId,
          date: writeOff.writeOffDate ?? new Date(),
          description: writeOff.reason ? `Write-off: ${writeOff.reason}` : `Write-off ${writeOffId}`,
          currency: company.currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: badDebtAccountId, debit: amount, credit: 0, memo: 'Bad Debt Expense' },
            { accountId: arAccountId, debit: 0, credit: amount, memo: 'Accounts Receivable' },
          ],
        })
        if (je) {
          await tx.writeOff.update({ where: { id: writeOffId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post write-off ${writeOffId}: ${err?.message}`)
    }
  }

  // ─── AR: Write-Off Reversed (DR: AR  CR: Bad Debt Expense) ─────────────────

  async reverseWriteOffGL(writeOffId: string, postedById?: string): Promise<void> {
    try {
      const writeOff = await this.prisma.writeOff.findUnique({ where: { id: writeOffId } })
      if (!writeOff) return

      const company = await this.prisma.company.findUnique({
        where: { id: writeOff.companyId },
        select: { workspaceId: true, currency: true },
      })
      if (!company) return

      const arAccountId = await this.findAccountByCode(writeOff.companyId, '1100')
      const badDebtAccountId = await this.findAccountByCode(writeOff.companyId, '6100')
      if (!arAccountId || !badDebtAccountId) return

      const amount = Number(writeOff.amount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(writeOff.companyId, 'WOV')
        await this.createPostedJE(tx, {
          workspaceId: company.workspaceId,
          companyId: writeOff.companyId,
          date: new Date(),
          description: `Write-off Reversed ${writeOffId}`,
          currency: company.currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: arAccountId, debit: amount, credit: 0, memo: 'AR recovery (write-off reversed)' },
            { accountId: badDebtAccountId, debit: 0, credit: amount, memo: 'Bad Debt Expense reversal' },
          ],
        })
        await tx.writeOff.update({ where: { id: writeOffId }, data: { journalEntryId: null } })
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to reverse write-off ${writeOffId}: ${err?.message}`)
    }
  }

  // ─── AR: Cash Refund (DR: Sales Returns  CR: Cash/Bank) ─────────────────────

  /**
   * Called when a cash refund is processed.
   * Creates a POSTED JournalEntry:
   *   DR Sales Returns and Allowances   (4040 — contra-revenue)
   *   CR Cash / Bank                    (1000)
   */
  async postRefundToGL(refundId: string, postedById?: string): Promise<void> {
    try {
      const refund = await this.prisma.customerRefund.findUnique({ where: { id: refundId } })
      if (!refund) return
      if (refund.journalEntryId) return

      const company = await this.prisma.company.findUnique({
        where: { id: refund.companyId },
        select: { workspaceId: true, currency: true },
      })
      if (!company) return

      const salesReturnsId = await this.findAccountByCode(refund.companyId, '4040')
      const cashAccountId = await this.resolveAccount(refund.companyId, (refund as any).bankAccountId, '1000')

      if (!salesReturnsId || !cashAccountId) {
        this.logger.warn(`[SubLedger] Cannot post refund ${refundId}: Sales Returns (4040) or Cash (1000) account not found`)
        return
      }

      const amount = Number(refund.amount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(refund.companyId, 'RF')
        const je = await this.createPostedJE(tx, {
          workspaceId: company.workspaceId,
          companyId: refund.companyId,
          date: refund.refundDate ?? new Date(),
          description: `Refund ${refund.referenceNumber ?? refundId}`,
          currency: refund.currency ?? company.currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: salesReturnsId, debit: amount, credit: 0, memo: 'Sales Returns' },
            { accountId: cashAccountId, debit: 0, credit: amount, memo: 'Cash/Bank' },
          ],
        })
        if (je) {
          await tx.customerRefund.update({ where: { id: refundId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post refund ${refundId}: ${err?.message}`)
    }
  }

  // ─── AR: Cash Refund Reversed ─────────────────────────────────────────────

  async reverseRefundGL(refundId: string, postedById?: string): Promise<void> {
    try {
      const refund = await this.prisma.customerRefund.findUnique({ where: { id: refundId } })
      if (!refund) return

      const company = await this.prisma.company.findUnique({
        where: { id: refund.companyId },
        select: { workspaceId: true, currency: true },
      })
      if (!company) return

      const salesReturnsId = await this.findAccountByCode(refund.companyId, '4040')
      const cashAccountId = await this.resolveAccount(refund.companyId, (refund as any).bankAccountId, '1000')
      if (!salesReturnsId || !cashAccountId) return

      const amount = Number(refund.amount ?? 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(refund.companyId, 'RFV')
        await this.createPostedJE(tx, {
          workspaceId: company.workspaceId,
          companyId: refund.companyId,
          date: new Date(),
          description: `Refund Reversed ${refund.referenceNumber ?? refundId}`,
          currency: refund.currency ?? company.currency,
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: cashAccountId, debit: amount, credit: 0, memo: 'Cash/Bank recovery' },
            { accountId: salesReturnsId, debit: 0, credit: amount, memo: 'Sales Returns reversal' },
          ],
        })
        await tx.customerRefund.update({ where: { id: refundId }, data: { journalEntryId: null } })
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to reverse refund ${refundId}: ${err?.message}`)
    }
  }

  // ─── Revenue Recognition (DR: Deferred Revenue  CR: Revenue) ─────────────

  /**
   * Called when deferred revenue is recognized.
   * Creates a POSTED JournalEntry:
   *   DR Deferred Revenue   (2100)
   *   CR Revenue            (4000)
   */
  async postRevenueRecognitionToGL(data: {
    workspaceId: string
    companyId: string
    amount: number
    recognitionId: string
    description?: string
    currency?: string
    postedById?: string
  }): Promise<string | null> {
    try {
      const deferredRevenueId = await this.findAccountByCode(data.companyId, '2100')
      const revenueAccountId = await this.findAccountByCode(data.companyId, '4000')

      if (!deferredRevenueId || !revenueAccountId) {
        this.logger.warn(`[SubLedger] Cannot post revenue recognition ${data.recognitionId}: Deferred Revenue (2100) or Revenue (4000) account not found`)
        return null
      }

      let jeId: string | null = null
      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(data.companyId, 'RR')
        const je = await this.createPostedJE(tx, {
          workspaceId: data.workspaceId,
          companyId: data.companyId,
          date: new Date(),
          description: data.description ?? `Revenue Recognition ${data.recognitionId}`,
          currency: data.currency,
          createdById: data.postedById,
          entryNumber,
          lines: [
            { accountId: deferredRevenueId, debit: data.amount, credit: 0, memo: 'Deferred Revenue' },
            { accountId: revenueAccountId, debit: 0, credit: data.amount, memo: 'Recognized Revenue' },
          ],
        })
        jeId = je?.id ?? null
      })
      return jeId
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post revenue recognition ${data.recognitionId}: ${err?.message}`)
      return null
    }
  }

  // ─── Revenue Recognition Reversed ─────────────────────────────────────────

  async reverseRevenueRecognitionGL(data: {
    workspaceId: string
    companyId: string
    amount: number
    recognitionId: string
    currency?: string
    postedById?: string
  }): Promise<void> {
    try {
      const deferredRevenueId = await this.findAccountByCode(data.companyId, '2100')
      const revenueAccountId = await this.findAccountByCode(data.companyId, '4000')
      if (!deferredRevenueId || !revenueAccountId) return

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(data.companyId, 'RRV')
        await this.createPostedJE(tx, {
          workspaceId: data.workspaceId,
          companyId: data.companyId,
          date: new Date(),
          description: `Revenue Recognition Reversed ${data.recognitionId}`,
          currency: data.currency,
          createdById: data.postedById,
          entryNumber,
          lines: [
            { accountId: revenueAccountId, debit: data.amount, credit: 0, memo: 'Revenue reversal' },
            { accountId: deferredRevenueId, debit: 0, credit: data.amount, memo: 'Deferred Revenue re-deferred' },
          ],
        })
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to reverse revenue recognition ${data.recognitionId}: ${err?.message}`)
    }
  }

  // ─── Expenses: Expense Claim Approved ──────────────────────────────────────
  //   DR: Expense accounts (per line)
  //   CR: Accrued Expenses - Employee Payable (2100)

  async postExpenseClaimToGL(params: {
    companyId: string
    workspaceId: string
    expenseClaimId: string
    lines: Array<{ accountId?: string | null; amount: number }>
    totalAmount: number
    employeeId?: string | null
  }): Promise<void> {
    try {
      const { companyId, workspaceId, expenseClaimId, lines, totalAmount, employeeId } = params
      await this.prisma.$transaction(async (tx) => {
        const accruedAccount = await resolveAccount(tx, companyId, { code: '2100', name: 'Accrued Expenses - Employee Payable', typeId: 4 })
        const expenseFallback = await resolveAccount(tx, companyId, { code: '5010', name: 'Operating Expenses', typeId: 2 })

        const debitLines: Array<{ accountId: string; debit: number; credit: number; description?: string }> = []
        for (const line of lines) {
          const lineAmount = this.roundMoney(Number(line.amount ?? 0))
          if (lineAmount <= 0.005) continue
          let expAccountId: string | null = null
          if (line.accountId) expAccountId = await this.findAccountById(companyId, line.accountId, tx)
          expAccountId = expAccountId ?? expenseFallback.id
          debitLines.push({ accountId: expAccountId, debit: lineAmount, credit: 0, description: 'Expense claim line' })
        }

        if (debitLines.length === 0) {
          debitLines.push({ accountId: expenseFallback.id, debit: this.roundMoney(totalAmount), credit: 0, description: 'Expense claim' })
        }

        const totalDebit = this.roundMoney(debitLines.reduce((s, l) => s + l.debit, 0))
        const entryNumber = await this.nextEntryNumber(companyId, 'EXP')
        await createAndPostJE(tx, {
          workspaceId,
          companyId,
          date: new Date(),
          description: employeeId ? `Expense Claim ${expenseClaimId} (Employee ${employeeId})` : `Expense Claim ${expenseClaimId}`,
          entryNumber,
          transactionSource: 'Expense Report',
          sourceReferenceId: expenseClaimId,
          lines: [
            ...debitLines,
            { accountId: accruedAccount.id, debit: 0, credit: totalDebit, description: 'Accrued Expenses - Employee Payable' },
          ],
        })
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post expense claim ${params.expenseClaimId} to GL: ${err?.message}`)
    }
  }

  // ─── Expenses: Expense Reimbursement Paid ──────────────────────────────────
  //   DR: Accrued Expenses - Employee Payable (2100)
  //   CR: Cash / Bank

  async postExpenseReimbursementToGL(params: {
    companyId: string
    workspaceId: string
    expenseClaimId: string
    amount: number
    bankAccountId?: string | null
    description?: string
  }): Promise<void> {
    try {
      const { companyId, workspaceId, expenseClaimId, amount, bankAccountId } = params
      await this.prisma.$transaction(async (tx) => {
        const accruedAccount = await resolveAccount(tx, companyId, { code: '2100', name: 'Accrued Expenses - Employee Payable', typeId: 4 })
        const cashAccountRaw = bankAccountId
          ? await this.findAccountById(companyId, bankAccountId, tx)
          : null
        const cashAccountId = cashAccountRaw ?? (await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.CASH)).id

        const amt = this.roundMoney(amount)
        const entryNumber = await this.nextEntryNumber(companyId, 'EXR')
        await createAndPostJE(tx, {
          workspaceId,
          companyId,
          date: new Date(),
          description: params.description ?? `Expense Reimbursement ${expenseClaimId}`,
          entryNumber,
          transactionSource: 'Expense Reimbursement',
          sourceReferenceId: expenseClaimId,
          lines: [
            { accountId: accruedAccount.id, debit: amt, credit: 0, description: 'Accrued Expenses - Employee Payable' },
            { accountId: cashAccountId, debit: 0, credit: amt, description: 'Cash disbursed' },
          ],
        })
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post expense reimbursement ${params.expenseClaimId} to GL: ${err?.message}`)
    }
  }

  // ─── Expenses: Mileage Log Approved ────────────────────────────────────────
  //   DR: Expense account (accountId or default 5010)
  //   CR: Accrued Expenses - Employee Payable (2100)

  async postMileageToGL(params: {
    companyId: string
    workspaceId: string
    mileageLogId: string
    amount: number
    accountId?: string | null
    employeeId?: string | null
  }): Promise<void> {
    try {
      const { companyId, workspaceId, mileageLogId, amount, accountId } = params
      await this.prisma.$transaction(async (tx) => {
        const accruedAccount = await resolveAccount(tx, companyId, { code: '2100', name: 'Accrued Expenses - Employee Payable', typeId: 4 })
        const expenseFallback = await resolveAccount(tx, companyId, { code: '5010', name: 'Operating Expenses', typeId: 2 })
        let expAccountId: string | null = null
        if (accountId) expAccountId = await this.findAccountById(companyId, accountId, tx)
        expAccountId = expAccountId ?? expenseFallback.id

        const amt = this.roundMoney(amount)
        const entryNumber = await this.nextEntryNumber(companyId, 'MIL')
        await createAndPostJE(tx, {
          workspaceId,
          companyId,
          date: new Date(),
          description: `Mileage Log ${mileageLogId}`,
          entryNumber,
          transactionSource: 'Mileage',
          sourceReferenceId: mileageLogId,
          lines: [
            { accountId: expAccountId, debit: amt, credit: 0, description: 'Mileage expense' },
            { accountId: accruedAccount.id, debit: 0, credit: amt, description: 'Accrued Expenses - Employee Payable' },
          ],
        })
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post mileage log ${params.mileageLogId} to GL: ${err?.message}`)
    }
  }

  // ─── Expenses: Per Diem Claim Approved ─────────────────────────────────────
  //   DR: Expense account (accountId or default 5010)
  //   CR: Accrued Expenses - Employee Payable (2100)

  async postPerDiemToGL(params: {
    companyId: string
    workspaceId: string
    perDiemId: string
    amount: number
    accountId?: string | null
    employeeId?: string | null
  }): Promise<void> {
    try {
      const { companyId, workspaceId, perDiemId, amount, accountId } = params
      await this.prisma.$transaction(async (tx) => {
        const accruedAccount = await resolveAccount(tx, companyId, { code: '2100', name: 'Accrued Expenses - Employee Payable', typeId: 4 })
        const expenseFallback = await resolveAccount(tx, companyId, { code: '5010', name: 'Operating Expenses', typeId: 2 })
        let expAccountId: string | null = null
        if (accountId) expAccountId = await this.findAccountById(companyId, accountId, tx)
        expAccountId = expAccountId ?? expenseFallback.id

        const amt = this.roundMoney(amount)
        const entryNumber = await this.nextEntryNumber(companyId, 'PER')
        await createAndPostJE(tx, {
          workspaceId,
          companyId,
          date: new Date(),
          description: `Per Diem ${perDiemId}`,
          entryNumber,
          transactionSource: 'Per Diem',
          sourceReferenceId: perDiemId,
          lines: [
            { accountId: expAccountId, debit: amt, credit: 0, description: 'Per diem expense' },
            { accountId: accruedAccount.id, debit: 0, credit: amt, description: 'Accrued Expenses - Employee Payable' },
          ],
        })
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post per diem ${params.perDiemId} to GL: ${err?.message}`)
    }
  }
}
