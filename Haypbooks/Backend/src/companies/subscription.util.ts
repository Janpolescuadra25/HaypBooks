export function validateSubscriptionOwnership(data: { companyId?: string; practiceId?: string }) {
  const hasCompany = !!data.companyId
  const hasPractice = !!data.practiceId
  if ((hasCompany && hasPractice) || (!hasCompany && !hasPractice)) {
    throw new Error('Subscription must have exactly one owner: either companyId or practiceId')
  }
}