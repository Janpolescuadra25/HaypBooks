"use client"

import React from 'react'

export type PlanKey = 'starter' | 'growth' | 'pro' | 'enterprise'

export default function PlanSelector({ selected, onSelect }: { selected?: PlanKey, onSelect: (p: PlanKey) => void }) {
  const [billing, setBilling] = React.useState<'monthly'|'annual'>('monthly')
  const plans: {
    key: PlanKey,
    title: string,
    subtitle?: string,
    priceMonthly?: string,
    priceAnnual?: string,
    cta?: string,
    features: string[],
    badge?: string
  }[] = [
    {
      key: 'starter',
      title: 'Starter',
      subtitle: 'For freelancers & solopreneurs',
      priceMonthly: '$0',
      priceAnnual: '$0',
      cta: 'Get Started Free',
      badge: 'Free Forever 🌱',
      features: [
        'Up to 50 invoices/month',
        'Basic financial reports',
        'Email support',
        '1 user',
        'Mobile app access',
        'Basic integrations'
      ]
    },
    {
      key: 'growth',
      title: 'Growth',
      subtitle: 'For growing businesses',
      priceMonthly: '$29',
      priceAnnual: '$278',
      cta: 'Start Subscription',
      badge: 'Most Popular 💼',
      features: [
        'Unlimited invoices & bills',
        'Advanced reports & analytics',
        'Priority email support',
        'Up to 5 users',
        'Mobile app access',
        'Bank reconciliation',
        'Inventory tracking (basic)',
        'Custom branding'
      ]
    },
    {
      key: 'pro',
      title: 'Professional',
      subtitle: 'For established companies',
      priceMonthly: '$79',
      priceAnnual: '$758',
      cta: 'Start Subscription',
      badge: '⭐ Premium',
      features: [
        'Everything in Growth',
        'Up to 15 users',
        'Advanced inventory management',
        'Multi-currency support',
        'API access',
        'Custom branding',
        '24/7 priority support',
        'Dedicated account manager'
      ]
    },
    {
      key: 'enterprise',
      title: 'Enterprise',
      subtitle: 'For enterprise needs',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      cta: 'Contact Sales',
      badge: '🏢 Custom',
      features: [
        'Everything in Premium',
        'Custom deployment options',
        'On-premise hosting available',
        'Advanced security features',
        'Custom contract terms',
        'Dedicated support team',
        'Custom development',
        'Volume discounts'
      ]
    }
  ]

  function displayPrice(p: typeof plans[number]) {
    if (p.priceMonthly && billing === 'monthly') return p.priceMonthly + (p.priceMonthly === '$0' ? '' : ' /month')
    if (p.priceAnnual && billing === 'annual') return p.priceAnnual + (p.priceAnnual === 'Custom' ? '' : ' /year')
    return p.priceMonthly || p.priceAnnual || 'Custom'
  }

  const [expanded, setExpanded] = React.useState<PlanKey | null>(null)

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Billing:</span>
          <div className="inline-flex bg-slate-100 p-1 rounded-full">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 text-sm rounded-full transition font-medium ${billing === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('annual')}
              className={`px-4 py-1.5 text-sm rounded-full transition font-medium flex items-center gap-1.5 ${billing === 'annual' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Annual
              <span className="text-xs text-emerald-600 font-semibold">Save 20%</span>
            </button>
          </div>
        </div>
        <span className="text-sm text-slate-400">Choose a plan that fits your business</span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map(p => {
          const isSelected = selected === p.key
          return (
            <div
              key={p.key}
              data-testid={`plan-${p.key}`}
              onClick={() => onSelect(p.key)}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelect(p.key)}
              className={`relative flex flex-col rounded-2xl border-2 p-5 text-left cursor-pointer focus:outline-none transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              {/* Badge */}
              {p.badge && (
                <span className={`self-start mb-3 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold leading-tight ${
                  isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {p.badge}
                </span>
              )}

              {/* Title + price */}
              <div className="mb-1">
                <p className="text-lg font-bold text-slate-900 leading-tight">{p.title}</p>
                <p className="text-sm font-semibold text-emerald-600 mt-0.5">{displayPrice(p)}</p>
              </div>

              {/* Subtitle */}
              {p.subtitle && (
                <p className="text-xs text-slate-500 mb-3">{p.subtitle}</p>
              )}

              {/* Features */}
              <ul className="flex-1 space-y-1.5 mt-1">
                {(expanded === p.key ? p.features : p.features.slice(0, 3)).map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className={`mt-0.5 w-3.5 h-3.5 flex-shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2"
                  onClick={e => { e.stopPropagation(); setExpanded(expanded === p.key ? null : p.key) }}
                  data-testid={`plan-${p.key}-see-full`}
                >
                  {expanded === p.key ? 'Hide' : 'See all features'}
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onSelect(p.key) }}
                  data-testid={`plan-${p.key}-select`}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow'
                      : 'border border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-700'
                  }`}
                >
                  {isSelected ? '✓ Selected' : 'Select'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
