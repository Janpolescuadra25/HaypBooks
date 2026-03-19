import Link from 'next/link'
import LandingHeader from '@/components/landing/LandingHeader'

export const metadata = {
  title: 'Pricing — HaypBooks',
  description: 'Simple, transparent pricing for Philippine businesses of every size.',
}

const PLANS = [
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
    price: '₱1,499',
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
    price: '₱3,499',
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
      'BIR-ready tax reports',
      'Dedicated account manager',
      'Phone & video support',
      'Custom training sessions',
    ],
  },
]

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
            Start free. Upgrade when you need more. All plans include automatic updates and Philippine tax compliance tools.
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
              {[
                { q: 'Can I switch plans later?', a: 'Yes — upgrade or downgrade anytime from your account settings. Changes take effect on your next billing cycle.' },
                { q: 'Is my data secure?', a: 'All data is encrypted at rest and in transit. We use bank-grade security with row-level access control and full audit logging.' },
                { q: 'Do you support BIR compliance?', a: 'Yes. HaypBooks generates BIR-ready forms including 2307, 2550M/Q, 1601-C, and more for Philippine businesses.' },
                { q: 'Can my accountant access my books?', a: 'Absolutely. Invite your accountant with their own login. They get Practice Hub access to manage your books alongside their other clients.' },
                { q: 'What payment methods do you accept?', a: 'We accept major credit/debit cards, GCash, Maya, and bank transfers for Philippine customers.' },
              ].map(({ q, a }) => (
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
