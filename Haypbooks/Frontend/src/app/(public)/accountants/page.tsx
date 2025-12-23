export const metadata = {
  title: 'Accountants & Bookkeepers — HaypBooks',
  description: 'Solutions and partner tools for accountants and bookkeepers. Help clients run their books, collaborate, and grow with HaypBooks.'
}

import LandingHeader from '@/components/landing/LandingHeader'

export default function AccountantsPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen pt-24 md:pt-28 bg-white py-8 px-4">
        <section className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Accountants & Bookkeepers</h1>
          <p className="text-lg text-slate-600 mb-8">Tools built for modern accounting practices — collaborate with clients, automate reconciliations, and scale your practice with confidence.</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <a href="/signup?showSignup=1&role=accountant" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700">Create an Accountant account</a>
            <a href="/contact" className="inline-block border border-slate-300 px-6 py-3 rounded-lg hover:bg-slate-50">Contact Sales</a>
          </div>
        </section>

        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-2">Collaborate with Clients</h3>
            <p className="text-slate-600">Invite clients, review their books, and work together in a secure, permissioned environment.</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-2">Automation & Reconciliation</h3>
            <p className="text-slate-600">Bank feeds, smart matching, and automated suggestions reduce manual bookkeeping overhead.</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-2">Practice Management</h3>
            <p className="text-slate-600">Tools for engagements, client lists, and billing help you scale your practice with repeatable workflows.</p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto py-12">
          <h2 className="text-2xl font-bold text-center mb-6">Partner with HaypBooks</h2>
          <p className="text-center text-slate-600 mb-6">Get dedicated support, partner tools, and resources to help your firm adopt HaypBooks for clients.</p>
          <div className="text-center">
            <a href="/contact" className="inline-block bg-slate-800 text-white px-6 py-3 rounded-lg">Learn about partnership</a>
          </div>
        </section>
      </main>
    </>
  )
}
