"use client"
import Link from 'next/link'
import { MARKETING_PRICING_PLANS } from '@/lib/pricing'

export default function PricingPreview() {
  const plans = MARKETING_PRICING_PLANS

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 via-slate-100 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-3">Pricing preview</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Simple plans for growing teams
          </h2>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
            See the most popular plans at a glance. Pricing below matches the full pricing page and links to complete details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-6 shadow-sm transition-shadow duration-300 bg-white ${plan.highlight ? 'border-emerald-300 shadow-2xl' : 'border-slate-200 hover:shadow-lg'}`}
            >
              <div className="mb-4">
                <p className="text-sm uppercase tracking-[0.24em] font-semibold text-emerald-600">{plan.name}</p>
                <p className="mt-3 text-4xl font-extrabold text-slate-900">
                  {plan.price}
                  <span className="text-slate-500 text-base font-medium">{plan.period}</span>
                </p>
              </div>

              <p className="text-slate-500 mb-6 text-sm leading-relaxed">{plan.description}</p>

              <ul className="space-y-3 mb-6 text-sm text-slate-600">
                {plan.features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 text-emerald-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/pricing"
                className={`block w-full rounded-2xl py-3 text-center font-semibold transition ${plan.highlight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                See Full Pricing
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
