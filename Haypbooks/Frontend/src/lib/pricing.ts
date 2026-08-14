export type MarketingPricingPlan = {
  name: string
  price: string
  period: string
  description: string
  cta: string
  highlight: boolean
  features: string[]
}

export const MARKETING_PRICING_PLANS: MarketingPricingPlan[] = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'For solo entrepreneurs just getting started.',
    cta: 'Start Free',
    highlight: false,
    features: [
      '1 company',
      'Up to 50 transactions / month',
      'Invoicing & billing',
      'Basic financial reports',
      'Bank account tracking',
      'Email support',
    ],
  },
  {
    name: 'Business',
    price: '$29',
    period: '/mo',
    description: 'For growing businesses that need full bookkeeping.',
    cta: 'Start 14-Day Trial',
    highlight: true,
    features: [
      'Unlimited companies',
      'Unlimited transactions',
      'Full double-entry accounting',
      'AR & AP management',
      'Bank reconciliation',
      'Payroll basics',
      'Inventory tracking',
      'Custom reports & dashboards',
      'Multi-user access (up to 5)',
      'Priority email & chat support',
    ],
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/mo',
    description: 'For accountants and firms managing multiple clients.',
    cta: 'Contact Sales',
    highlight: false,
    features: [
      'Everything in Business',
      'Practice Hub for accountants',
      'Unlimited users & roles',
      'Client management & onboarding',
      'Advanced RBAC & audit trail',
      'API access & integrations',
      'Tax-ready reporting templates',
      'Dedicated account manager',
      'Phone & video support',
      'Custom training sessions',
    ],
  },
]

export const PRICING_PAGE_SUBTITLE =
  'Start free. Upgrade when you need more. All plans include automatic updates and tax compliance tools.'

export const PRICING_PAGE_FAQS = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes — upgrade or downgrade anytime from your account settings. Changes take effect on your next billing cycle.',
  },
  {
    q: 'Is my data secure?',
    a: 'All data is encrypted at rest and in transit. We use bank-grade security with row-level access control and full audit logging.',
  },
  {
    q: 'Do you support local tax compliance?',
    a: 'Yes. HaypBooks supports local tax compliance with customizable report templates that adapt to your country\'s requirements.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept major credit/debit cards and bank transfers. Additional local payment methods may be available depending on your region.',
  },
]

// TODO: JP to confirm final pricing and currency. Current plan values use placeholder USD amounts.
export const PRICING_CONSTANTS_NOTE =
  'TODO: JP to confirm final pricing and currency. Current plan values use placeholder USD amounts.'
