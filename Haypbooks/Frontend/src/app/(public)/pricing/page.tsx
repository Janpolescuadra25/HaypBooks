import LandingHeader from '@/components/landing/LandingHeader'
import PricingPreview from '@/components/landing/PricingPreview'

export const metadata = {
  title: 'Pricing — HaypBooks',
  description: 'Simple, transparent pricing for modern accounting. Start your subscription today. Cancel anytime.'
}

export default function PricingPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen pt-24 md:pt-28 py-16">
        <section className="max-w-5xl mx-auto text-center px-4">
          <h1 className="text-5xl font-extrabold mb-4">Pricing Plans that scale with your business</h1>
        <p className="text-xl text-slate-600 mb-8">Choose the plan that fits. All plans include full access to HaypBooks — charges apply immediately.</p>
        <div className="flex items-center justify-center gap-4">
          <a href="/get-started/subscribe" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700">Start Subscription</a>
          <a href="/contact" className="inline-block border border-slate-300 px-6 py-3 rounded-lg hover:bg-slate-50">Contact Sales</a>
        </div>
      </section>

      <PricingPreview />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-6">Compare plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr className="text-sm text-slate-600 border-b">
                <th className="py-3 pr-4">Feature</th>
                <th className="py-3 pr-4">Subscription</th>
                <th className="py-3 pr-4">Basic</th>
                <th className="py-3 pr-4">Pro</th>
                <th className="py-3 pr-4">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              <tr className="border-b">
                <td className="py-3 pr-4">Invoices & Bills</td>
                <td className="py-3 pr-4">✓</td>
                <td className="py-3 pr-4">✓</td>
                <td className="py-3 pr-4">✓</td>
                <td className="py-3 pr-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4">Bank reconciliation</td>
                <td className="py-3 pr-4">✓</td>
                <td className="py-3 pr-4">✓</td>
                <td className="py-3 pr-4">✓</td>
                <td className="py-3 pr-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4">Inventory management</td>
                <td className="py-3 pr-4">—</td>
                <td className="py-3 pr-4">—</td>
                <td className="py-3 pr-4">✓</td>
                <td className="py-3 pr-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4">Users</td>
                <td className="py-3 pr-4">1</td>
                <td className="py-3 pr-4">Up to 2</td>
                <td className="py-3 pr-4">Up to 10</td>
                <td className="py-3 pr-4">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-6">Have questions?</h2>
        <p className="text-center text-slate-600 mb-6">See our <a href="/help/pricing" className="text-emerald-600 underline">pricing FAQ</a> or <a href="/contact" className="text-emerald-600 underline">contact sales</a>.</p>
      </section>
    </main>
    </>
  )
}
