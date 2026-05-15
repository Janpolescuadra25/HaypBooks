import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

type ExpensePolicyCategoryConfig = {
  maxAmount?: number
  requireReceiptAbove?: number
  maxDaysToSubmit?: number
  requireManagerApprovalAbove?: number
}

type ExpensePolicyConfig = {
  categories?: Record<string, ExpensePolicyCategoryConfig>
  default?: ExpensePolicyCategoryConfig
}

type ExpensePolicyLine = {
  category?: string | null
  amount: number
  receiptUrl?: string | null
  date: Date
}

@Injectable()
export class ExpensePolicyService {
  constructor(private readonly prisma: PrismaService) {}

  private formatAmount(value: number): string {
    return Number(value).toFixed(2)
  }

  private getCategoryPolicy(policy: ExpensePolicyConfig | null, category?: string | null): ExpensePolicyCategoryConfig | null {
    if (!policy) return null
    if (category && policy.categories?.[category]) return policy.categories[category]
    return policy.default ?? null
  }

  async getExpensePolicy(companyId: string): Promise<ExpensePolicyConfig | null> {
    const settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
      select: { expensePolicy: true },
    })
    return (settings?.expensePolicy as ExpensePolicyConfig) ?? null
  }

  async validateExpenseAgainstPolicy(
    companyId: string,
    payload: { lines: ExpensePolicyLine[]; submittedAt?: Date },
    mode: 'create' | 'approve' = 'create',
  ): Promise<string[]> {
    const policy = await this.getExpensePolicy(companyId)
    if (!policy) return []

    const violations: string[] = []
    const submittedAt = payload.submittedAt ?? new Date()

    for (const line of payload.lines) {
      const lineAmount = Number(line.amount ?? 0)
      if (lineAmount <= 0) continue
      const categoryPolicy = this.getCategoryPolicy(policy, line.category)
      if (!categoryPolicy) continue

      const maxAmount = categoryPolicy.maxAmount
      if (maxAmount != null && lineAmount > maxAmount) {
        violations.push(`Expense amount ₱${this.formatAmount(lineAmount)} exceeds category maximum of ₱${this.formatAmount(maxAmount)}`)
      }

      const requireReceiptAbove = categoryPolicy.requireReceiptAbove
      const hasReceipt = Boolean(line.receiptUrl && String(line.receiptUrl).trim().length > 0)
      if (requireReceiptAbove != null && lineAmount > requireReceiptAbove && !hasReceipt) {
        violations.push(`Receipt attachment required for expenses above ₱${this.formatAmount(requireReceiptAbove)}`)
      }

      const maxDaysToSubmit = categoryPolicy.maxDaysToSubmit
      if (maxDaysToSubmit != null && line.date) {
        const daysLate = Math.ceil((submittedAt.getTime() - new Date(line.date).getTime()) / 86400000)
        if (daysLate > maxDaysToSubmit) {
          violations.push(`Expense submitted ${daysLate} days after occurrence (max: ${maxDaysToSubmit} days)`)
        }
      }

      const requireManagerApprovalAbove = categoryPolicy.requireManagerApprovalAbove
      if (mode === 'approve' && requireManagerApprovalAbove != null && lineAmount > requireManagerApprovalAbove) {
        violations.push(`Expense amount ₱${this.formatAmount(lineAmount)} requires manager approval above ₱${this.formatAmount(requireManagerApprovalAbove)}`)
      }
    }

    return violations
  }
}
