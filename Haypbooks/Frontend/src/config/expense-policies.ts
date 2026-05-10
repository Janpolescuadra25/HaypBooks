export interface ExpensePolicy {
  maxAmount?: number
  maxDaysToSubmit?: number
  requireReceiptAbove?: number
  requireManagerApprovalAbove?: number
  requireDescription?: boolean
  allowedExpenseCategories?: string[]
  perDiemRates?: Record<string, number>
  mileageRate?: number
  customGuidance?: string
}

export interface ExpensePolicyConfig {
  global: ExpensePolicy
  categories: Record<string, ExpensePolicy>
}

const defaultPolicyConfig: ExpensePolicyConfig = {
  global: {
    maxDaysToSubmit: 60,
    requireReceiptAbove: 25,
    requireManagerApprovalAbove: 500,
    requireDescription: true,
    allowedExpenseCategories: ['Travel', 'Meals', 'Office Supplies', 'Software', 'Hardware', 'Professional Services', 'Marketing', 'Miscellaneous'],
    mileageRate: 0.67,
    customGuidance: 'Receipts required for all items over $25.00. Travel must be pre-authorized by department head. All entries must include a specific business purpose. Late submissions (>60 days) may be rejected.',
  },
  categories: {
    travel: { requireDescription: true, requireReceiptAbove: 10 },
    meals: { requireDescription: true, requireReceiptAbove: 15, maxAmount: 100 },
  },
}

export function getExpensePolicy(category?: string): ExpensePolicy {
  const global = defaultPolicyConfig.global
  const categoryPolicy = category ? defaultPolicyConfig.categories[category.toLowerCase()] : undefined
  return { ...global, ...categoryPolicy }
}

export function getPolicyGuidanceText(): string {
  return defaultPolicyConfig.global.customGuidance || ''
}

export default defaultPolicyConfig
