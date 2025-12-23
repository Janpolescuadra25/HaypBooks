import LandingHeader from '@/components/landing/LandingHeader'
import Features from '@/components/landing/Features'

export const metadata = {
  title: 'Features — HaypBooks',
  description: 'Explore HaypBooks features: invoices, bank reconciliation, reports, automation, and more.'
}

export default function FeaturesPage() {
  return (
    <>
      <LandingHeader />

      <main className="min-h-screen pt-24 md:pt-28 py-16">
        <section className="max-w-5xl mx-auto text-center px-4">
          <h1 className="text-5xl font-extrabold mb-4">Product features designed for growing businesses</h1>
          <p className="text-xl text-slate-600 mb-8">Powerful accounting tools that help you automate bookkeeping, reconcile banks, run reports, and scale.</p>

          <div className="flex items-center justify-center gap-4">
            <a href="/get-started/subscribe" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700">Start Subscription</a>
            <a href="/contact" className="inline-block border border-slate-300 px-6 py-3 rounded-lg hover:bg-slate-50">Contact Sales</a>
          </div>
        </section>

        {/* Reuse existing Features block (the landing feature grid) */}
        <Features />

        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-6">Deep functionality — simple experience</h2>
          <p className="text-center text-slate-600 mb-6">From automated bank feeds and reconciliation to customizable reports and secure access controls, HaypBooks gives you the essentials plus advanced tools when you need them.</p>

          <ul className="max-w-3xl mx-auto text-slate-700 list-disc list-inside space-y-3">
            <li>Invoices, bills, and payments — fast and customizable</li>
            <li>Bank feeds + smart reconciliation — save hours each month</li>
            <li>Inventory, projects, and multi-user permissions for growing teams</li>
            <li>Live dashboards and exportable reports for accounting and tax</li>
            <li>Enterprise-grade security and reliable data backups</li>
          </ul>
        </section>
      </main>
    </>
  )
}
