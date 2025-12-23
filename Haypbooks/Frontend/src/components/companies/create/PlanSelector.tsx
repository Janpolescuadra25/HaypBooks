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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">Billing:</div>
          <div className="inline-flex gap-2 bg-slate-100 p-1 rounded-full">
            <button type="button" aria-pressed={billing === 'monthly'} onClick={() => setBilling('monthly')} className={`px-3 py-1 rounded-full ${billing === 'monthly' ? 'bg-white shadow' : 'text-slate-600'}`}>Monthly</button>
            <button type="button" aria-pressed={billing === 'annual'} onClick={() => setBilling('annual')} className={`px-3 py-1 rounded-full ${billing === 'annual' ? 'bg-white shadow' : 'text-slate-600'}`}>Annual <span className="ml-2 text-xs text-emerald-600 font-semibold">Save 20%</span></button>
          </div>
        </div>
        <div className="text-sm text-slate-500">Choose a plan that fits your business</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {plans.map(p => (
          <div key={p.key}>
            <div
              data-testid={`plan-${p.key}`}
              role="button"
              onClick={() => onSelect(p.key)}
              aria-pressed={selected === p.key}
              tabIndex={0}
              className={`flex flex-col justify-between min-h-[200px] p-6 rounded-lg border text-left focus:outline-none transition-shadow cursor-pointer ${selected === p.key ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200 shadow-md' : 'border-slate-200 hover:shadow-md'}`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-lg leading-5">{p.title}</div>
                      {p.badge && <div className="text-xs text-slate-500 ml-2">{p.badge}</div>}
                    </div>
                    {p.subtitle && <div className="text-xs text-slate-500 mt-1">{p.subtitle}</div>}
                  </div>
                  <div className="text-sm text-slate-600 whitespace-nowrap font-medium text-right">{displayPrice(p)}</div>
                </div>

                <ul className="mt-3 text-sm text-slate-600 space-y-1">
                  {p.features.slice(0, 3).map((f, i) => <li key={i}>• {f}</li>)}
                </ul>

                {expanded === p.key && (
                  <div className="mt-3 text-sm text-slate-600 space-y-1">
                    {p.features.map((f, i) => <div key={i}>• {f}</div>)}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  {selected === p.key ? <span className="inline-block text-xs font-semibold text-blue-700">Selected</span> : null}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="text-xs text-slate-500" onClick={(e) => { e.stopPropagation(); setExpanded(expanded === p.key ? null : p.key) }} data-testid={`plan-${p.key}-see-full`}>{expanded === p.key ? 'Hide' : 'See full features'}</button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(p.key) }} className={`btn-sm ${selected === p.key ? 'btn-ghost' : 'btn-outline'}`} data-testid={`plan-${p.key}-select`}>{selected === p.key ? 'Selected' : 'Select'}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
