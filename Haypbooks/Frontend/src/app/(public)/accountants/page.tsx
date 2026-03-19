import Link from 'next/link'
import LandingHeader from '@/components/landing/LandingHeader'
import { Users, BarChart3, Clock, ShieldCheck, Zap, Globe } from 'lucide-react'

export const metadata = {
  title: 'For Accountants & Bookkeepers — HaypBooks',
  description: 'Manage all your clients in one place with HaypBooks Practice Hub. Built for Philippine accounting professionals.',
}

const BENEFITS = [
  {
    icon: Users,
    title: 'Client Portfolio Management',
    description: 'Onboard clients, manage engagements, and access all client books from a single dashboard — no more juggling spreadsheets.',
  },
  {
    icon: BarChart3,
    title: 'Cross-Client Reporting',
    description: 'Generate consolidated reports across your entire practice. See which clients need attention at a glance.',
  },
  {
    icon: Clock,
    title: 'Work Queue & Deadlines',
    description: 'Track BIR filing deadlines, monthly closes, and recurring tasks. Never miss a compliance date again.',
  },
  {
    icon: Zap,
    title: 'Faster Month-End Close',
    description: 'Bank reconciliation, adjusting entries, and financial statement preparation — all streamlined into fewer clicks.',
  },
  {
    icon: ShieldCheck,
    title: 'Full Audit Trail',
    description: 'Every transaction is logged with who, what, and when. Give your clients confidence and satisfy regulatory reviews.',
  },
  {
    icon: Globe,
    title: 'BIR-Ready From Day One',
    description: 'Auto-generated 2307s, VAT returns, withholding tax forms, and CAS/CRS output — built specifically for Philippine tax rules.',
  },
]

const STEPS = [
  { number: '1', title: 'Sign up as an Accountant', detail: 'Create your free practice account in under two minutes.' },
  { number: '2', title: 'Add your clients', detail: 'Invite existing clients or create new company profiles on their behalf.' },
  { number: '3', title: 'Start managing', detail: 'Access client books, run reports, and hit deadlines — all from Practice Hub.' },
]

export default function AccountantsPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen pt-24 md:pt-28 bg-white">
        {/* Hero */}
        <section className="text-center px-6 py-16 max-w-4xl mx-auto">
          <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            For Accounting Professionals
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Your practice,<br />supercharged
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            HaypBooks Practice Hub gives accountants and bookkeepers a single workspace to manage every client — with Philippine compliance built in.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Start Free Practice Account
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="rounded-2xl border border-slate-200 p-6 bg-white hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-slate-50 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-12">Get started in 3 simple steps</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((s) => (
                <div key={s.number}>
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                    {s.number}
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center px-6 py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to grow your practice?</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            Join Philippine accountants and bookkeepers already using HaypBooks to save time and serve their clients better.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            Create Free Account
          </Link>
        </section>
      </main>
    </>
  )
}
