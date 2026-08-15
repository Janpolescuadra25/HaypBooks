import { ArrowRight, Code2, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AboutHaypBooks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 text-emerald-600 text-sm font-semibold uppercase tracking-[0.24em]">
              <span>Why HaypBooks?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
              Built by accountants, for modern accounting teams.
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              HaypBooks is an accounting and ERP platform designed to give business owners and accounting professionals a single source of truth. It brings real-time double-entry accounting, reporting, and finance workflows together in one easy-to-use system.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Powerful accounting doesn’t need to be complicated or expensive. HaypBooks helps teams automate bookkeeping, stay audit-ready, and collaborate across clients or companies without juggling multiple disconnected apps.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              Built for business owners and practice firms alike, HaypBooks combines AI-assisted automation, unified books, and flexible reporting so finance teams can focus on growth and compliance, not manual data entry.
            </p>
            <div className="mt-10">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700"
              >
                Learn more about pricing
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[40px] border border-slate-200 bg-slate-50 p-8 shadow-xl">
            <div className="grid gap-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-3xl bg-emerald-600 text-white grid place-items-center">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] font-semibold text-emerald-600">Built for extensibility</p>
                    <p className="text-slate-600 text-sm">Transparent engineering with flexible customization and continual improvement.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-3xl bg-slate-900 text-white grid place-items-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] font-semibold text-emerald-600">Audit-ready bookkeeping</p>
                    <p className="text-slate-600 text-sm">Every transaction is recorded with audit trails, so compliance and reviews are easier by design.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-3xl bg-blue-600 text-white grid place-items-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] font-semibold text-emerald-600">Unified business workflow</p>
                    <p className="text-slate-600 text-sm">Run invoicing, expenses, inventory, payroll, and reporting from one platform, without switching apps.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
