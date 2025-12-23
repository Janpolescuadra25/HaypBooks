"use client"
import { useState } from 'react'

export default function PricingPreview() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      id: 'freemium',
      name: 'Freemium',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Try HaypBooks free — ideal for sole proprietors and testing the product',
      features: [
        '1 company',
        'Limited transactions (100/month)',
        'Basic reports',
        'Email support'
      ],
      cta: 'Create Free Account',
      highlighted: false
    },
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 19,
      priceAnnual: 199, // ~16/mo equivalent
      description: 'For freelancers and micro-businesses',
      features: [
        'Unlimited invoices & bills',
        'Bank reconciliation',
        'Basic financial reports',
        'Up to 2 users',
        'Email support'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      id: 'growth',
      name: 'Growth',
      priceMonthly: 49,
      priceAnnual: 499, // ~41.5/mo
      description: 'For growing businesses that need more automation',
      features: [
        'Everything in Starter',
        'Inventory management',
        'Advanced reports & analytics',
        'Up to 10 users',
        'Priority support',
        'API access'
      ],
      cta: 'Get Started',
      highlighted: true
    },
    {
      id: 'scale',
      name: 'Business',
      priceMonthly: 89,
      priceAnnual: 899, // ~75/mo
      description: 'For scaling businesses with larger teams',
      features: [
        'Everything in Growth',
        'Advanced automation',
        'Custom integrations',
        '20+ seats optional',
        'Dedicated onboarding support'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      priceMonthly: null,
      priceAnnual: null,
      description: 'Custom pricing and SLA for large organizations',
      features: [
        'Unlimited users',
        'Dedicated account manager',
        'SLA & compliance support',
        'Custom integrations & onboarding'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ]

  function displayPrice(plan: any) {
    if (plan.priceMonthly === 0 && billingCycle === 'monthly') return '$0'
    if (plan.priceMonthly === 0 && billingCycle === 'annual') return '$0'
    if (!plan.priceMonthly) return 'Custom'
    if (billingCycle === 'monthly') return `$${plan.priceMonthly}`
    // show per-year price but format as $xxx /yr and monthly equivalent below
    return `$${plan.priceAnnual}`
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-sky-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Start with a free account. No credit card required. Cancel anytime.</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="inline-flex rounded-full bg-white shadow-sm p-1">
            <button
              aria-pressed={billingCycle === 'monthly'}
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full font-medium ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-700'}`}
            >
              Monthly
            </button>
            <button
              aria-pressed={billingCycle === 'annual'}
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-full font-medium ${billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-slate-700'}`}
            >
              Annual (save 2 months)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-6 ${plan.highlighted ? 'border-2 border-blue-500 shadow-2xl scale-105' : 'border border-gray-200 shadow-lg'}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm font-semibold px-4 py-1 rounded-full">Most Popular</span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[44px]">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{displayPrice(plan)}</span>
                {plan.priceMonthly && billingCycle === 'monthly' && <span className="text-gray-500 ml-2">/ month</span>}
                {plan.priceAnnual && billingCycle === 'annual' && <span className="text-gray-500 ml-2">/ year</span>}
                {plan.priceAnnual && billingCycle === 'annual' && plan.priceMonthly && (
                  <div className="text-sm text-gray-500">(~${(plan.priceAnnual / 12).toFixed(0)}/mo)</div>
                )}
              </div>

              <ul className="space-y-3 mb-6 text-sm">
                {plan.features.map((feature: string, featureIdx: number) => (
                  <li key={featureIdx} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.highlighted ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">All plans include free updates, data migration assistance, and online training resources.</p>
        </div>
      </div>
    </section>
  )
}
