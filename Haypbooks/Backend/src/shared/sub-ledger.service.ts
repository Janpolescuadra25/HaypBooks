import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

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
 *   1200 — Input VAT (Input Tax)   [assets]
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

  private async findAccountByCode(companyId: string, code: string): Promise<string | null> {
    const account = await this.prisma.account.findFirst({
      where: { companyId, code, deletedAt: null },
      select: { id: true },
    })
    return account?.id ?? null
  }

  private async resolveAccount(companyId: string, preferredId: string | null | undefined, fallbackCode: string): Promise<string | null> {
    if (preferredId) return preferredId
    return this.findAccountByCode(companyId, fallbackCode)
  }

  // ─── Entry Number Generator ───────────────────────────────────────────────

  private async nextEntryNumber(companyId: string, prefix: string): Promise<string> {
    const count = await this.prisma.journalEntry.count({ where: { companyId } })
    return `${prefix}-${String(count + 1).padStart(6, '0')}`
  }

  // ─── Core: create + immediately post a JE inside a transaction ────────────

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
        currency: data.currency ?? 'PHP',
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
        include: { lines: true },
      })
      if (!invoice) return
      if (invoice.journalEntryId) return // already posted

      const arAccountId = await this.findAccountByCode(invoice.companyId, '1100')
      const revenueAccountFallbackId = await this.findAccountByCode(invoice.companyId, '4010')
      const vatOutputAccountId = await this.findAccountByCode(invoice.companyId, '2050')

      if (!arAccountId || !revenueAccountFallbackId) {
        this.logger.warn(`[SubLedger] Cannot post invoice ${invoiceId}: AR or Revenue account not found`)
        return
      }

      const lines = invoice.lines as any[]
      const grossTotal = Number(invoice.totalAmount ?? 0)

      // Build credit lines — one per invoice line
      const creditLines: Array<{ accountId: string; debit: number; credit: number; memo?: string }> = []
      let totalCreditedRevenue = 0
      let totalVat = 0

      for (const line of lines) {
        const amount = Number(line.totalPrice ?? line.amount ?? 0)
        const vatRate = Number(line.vatRate ?? 0)
        const vatAmount = vatRate > 0 ? Math.round(amount * vatRate / (1 + vatRate) * 100) / 100 : 0
        const netRevenue = amount - vatAmount

        const revenueAccountId = await this.resolveAccount(invoice.companyId, line.accountId, '4010')
        if (!revenueAccountId) continue

        creditLines.push({ accountId: revenueAccountId, debit: 0, credit: netRevenue, memo: line.description })
        totalCreditedRevenue += netRevenue
        totalVat += vatAmount
      }

      // If VAT is non-zero and we have a VAT Output account, add the VAT credit line
      if (totalVat > 0.005 && vatOutputAccountId) {
        creditLines.push({ accountId: vatOutputAccountId, debit: 0, credit: totalVat, memo: 'Output VAT' })
      }

      // DR Accounts Receivable for the full gross amount
      const totalCredit = creditLines.reduce((s, l) => s + l.credit, 0)

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(invoice.companyId, 'AR')
        const je = await this.createPostedJE(tx, {
          workspaceId: invoice.workspaceId,
          companyId: invoice.companyId,
          date: (invoice as any).issuedAt ?? (invoice as any).date ?? new Date(),
          description: `Invoice ${(invoice as any).invoiceNumber ?? invoiceId}`,
          currency: invoice.currency ?? 'PHP',
          createdById: postedById,
          entryNumber,
          lines: [
            { accountId: arAccountId, debit: totalCredit, credit: 0, memo: 'Accounts Receivable' },
            ...creditLines,
          ],
        })

        if (je) {
          await tx.invoice.update({ where: { id: invoiceId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post invoice ${invoiceId}: ${err?.message}`)
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
          currency: (payment as any).currency ?? 'PHP',
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
  async postBillToGL(billId: string, postedById?: string): Promise<void> {
    try {
      const bill = await this.prisma.bill.findUnique({
        where: { id: billId },
        include: { lines: true },
      })
      if (!bill) return
      if (bill.journalEntryId) return // already posted

      const apAccountId = await this.findAccountByCode(bill.companyId, '2010')
      const vatInputAccountId = await this.findAccountByCode(bill.companyId, '1200')
      const ewtPayableAccountId = await this.findAccountByCode(bill.companyId, '2060')
      const expenseFallbackId = await this.findAccountByCode(bill.companyId, '5010')

      if (!apAccountId || !expenseFallbackId) {
        this.logger.warn(`[SubLedger] Cannot post bill ${billId}: AP or Expense account not found`)
        return
      }

      const lines = bill.lines as any[]
      const debitLines: Array<{ accountId: string; debit: number; credit: number; memo?: string }> = []
      let totalExpense = 0
      let totalVatInput = 0

      for (const line of lines) {
        const amount = Number(line.amount ?? 0)
        const vatRate = Number(line.vatRate ?? 0)
        const vatAmount = vatRate > 0 ? Math.round(amount * vatRate / (1 + vatRate) * 100) / 100 : 0
        const netExpense = amount - vatAmount

        const expenseAccountId = await this.resolveAccount(bill.companyId, line.accountId, '5010')
        if (!expenseAccountId) continue

        debitLines.push({ accountId: expenseAccountId, debit: netExpense, credit: 0, memo: line.description })
        totalExpense += netExpense
        totalVatInput += vatAmount
      }

      // Input VAT debit line
      if (totalVatInput > 0.005 && vatInputAccountId) {
        debitLines.push({ accountId: vatInputAccountId, debit: totalVatInput, credit: 0, memo: 'Input VAT' })
      }

      // EWT: read from bill-level ewt amount if stored
      const ewtAmount = Number((bill as any).ewtAmount ?? 0)
      const totalDebits = debitLines.reduce((s, l) => s + l.debit, 0)
      // AP credit = total debits reduced by EWT (EWT is the net payable to vendor)
      const apCredit = totalDebits - ewtAmount

      const finalLines: Array<{ accountId: string; debit: number; credit: number; memo?: string }> = [
        ...debitLines,
        { accountId: apAccountId, debit: 0, credit: apCredit, memo: 'Accounts Payable' },
      ]

      if (ewtAmount > 0.005 && ewtPayableAccountId) {
        finalLines.push({ accountId: ewtPayableAccountId, debit: 0, credit: ewtAmount, memo: 'EWT Payable' })
      }

      await this.prisma.$transaction(async (tx) => {
        const entryNumber = await this.nextEntryNumber(bill.companyId, 'AP')
        const je = await this.createPostedJE(tx, {
          workspaceId: bill.workspaceId,
          companyId: bill.companyId,
          date: (bill as any).issuedAt ?? (bill as any).date ?? new Date(),
          description: `Bill ${(bill as any).billNumber ?? billId}`,
          currency: bill.currency ?? 'PHP',
          createdById: postedById,
          entryNumber,
          lines: finalLines,
        })

        if (je) {
          await tx.bill.update({ where: { id: billId }, data: { journalEntryId: je.id } })
        }
      })
    } catch (err: any) {
      this.logger.error(`[SubLedger] Failed to post bill ${billId}: ${err?.message}`)
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
      const cashAccountId = await this.resolveAccount(companyId, null, '1010')

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
          currency: payment.currency ?? 'PHP',
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
          currency: (deposit as any).currency ?? 'PHP',
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
}
