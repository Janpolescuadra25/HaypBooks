import Link from 'next/link'
import LandingHeader from '@/components/landing/LandingHeader'
import { MARKETING_PRICING_PLANS, PRICING_PAGE_SUBTITLE, PRICING_PAGE_FAQS } from '@/lib/pricing'

export const metadata = {
  title: 'Pricing — HaypBooks',
  description: 'Simple, transparent pricing for growing businesses of every size.',
}

const PLANS = MARKETING_PRICING_PLANS

export default function PricingPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen pt-24 md:pt-28 bg-white">
        {/* Hero */}
        <section className="text-center px-6 py-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Simple pricing,<br />no surprises
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {PRICING_PAGE_SUBTITLE}
          </p>
        </section>

        {/* Plans Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border p-8 flex flex-col ${
                  plan.highlight
                    ? 'border-emerald-500 shadow-2xl shadow-emerald-600/10 bg-white ring-2 ring-emerald-500'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                <Link
                  href="/signup"
                  className={`mt-6 block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="mt-8 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 px-6 py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently asked questions</h2>
            <div className="space-y-6">
              {PRICING_PAGE_FAQS.map(({ q, a }) => (
                <div key={q} className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-800">{q}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
