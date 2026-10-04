export const DEFAULT_TRIAL_PLAN_ID = '00000000-0000-4000-8000-000000000001'

export const CANONICAL_PAID_PLANS = {
  STARTER: '00000000-0000-4000-8000-000000000101',
  PROFESSIONAL: '00000000-0000-4000-8000-000000000102',
  ENTERPRISE: '00000000-0000-4000-8000-000000000103',
  PRACTICE: '00000000-0000-4000-8000-000000000104',
} as const

export function validateSubscriptionOwnership(data: {
  companyId?: string
  practiceId?: string
  planId?: string
  plan?: string
}) {
  const hasCompany = !!data.companyId
  const hasPractice = !!data.practiceId
  if ((hasCompany && hasPractice) || (!hasCompany && !hasPractice)) {
    throw new Error('Subscription must have exactly one owner: either companyId or practiceId')
  }
  if (data.plan === 'FREE' || data.planId === 'FREE') {
    throw new Error('Deprecated FREE plan is not permitted; use a valid planId with TRIAL or ACTIVE status')
  }
  if (data.planId !== undefined && (typeof data.planId !== 'string' || data.planId.trim().length === 0)) {
    throw new Error('Subscription planId must be a non-empty plan identifier')
  }
}