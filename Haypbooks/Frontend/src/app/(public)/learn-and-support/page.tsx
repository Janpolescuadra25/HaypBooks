import LandingHeader from '@/components/landing/LandingHeader'
import VideoCard from '@/components/landing/VideoCard'
import LearningSearch from '@/components/landing/LearningSearch'
import ResourceGrid from '@/components/landing/ResourceGrid'

export const metadata = {
  title: 'Learn & Support — HaypBooks',
  description: 'Help articles, video tutorials, and support resources to get the most out of HaypBooks.'
}

export default function LearnAndSupportPage() {
  return (
    <>
      <LandingHeader />

      <main className="min-h-screen pt-24 md:pt-28 bg-white py-8 px-4">
        <section className="max-w-6xl mx-auto text-center py-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Learn & Support</h1>
          <p className="text-lg text-slate-600 mb-8">Find step-by-step tutorials, video guides, and help articles to set up and run HaypBooks more efficiently.</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <a href="/resources" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700">Browse Help Articles</a>
            <a href="/contact" className="inline-block border border-slate-300 px-6 py-3 rounded-lg hover:bg-slate-50">Contact Support</a>
          </div>

          <div className="mb-8">
            <LearningSearch />
          </div>
        </section>

        <section className="max-w-6xl mx-auto py-8">
          <h2 className="text-2xl font-bold mb-6">Video tutorials</h2>
          <p className="text-slate-600 mb-6">Short walkthroughs to help you get started quickly.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <VideoCard title="Get started with HaypBooks" desc="Account setup, company preferences, and inviting your team." href="#" />
            <VideoCard title="Bank feeds & reconciliation" desc="Connect your bank and reconcile transactions automatically." href="#" />
            <VideoCard title="Invoices & payments" desc="Create, send, and record payments from customers." href="#" />
          </div>
        </section>

        <section className="max-w-6xl mx-auto py-8">
          <h2 className="text-2xl font-bold mb-6">Webinars & events</h2>
          <p className="text-slate-600 mb-6">Upcoming webinars and on-demand recordings to help you learn best practices.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 border rounded-lg bg-white">
              <h3 className="font-semibold mb-1">Intro webinar: HaypBooks basics</h3>
              <p className="text-sm text-slate-600 mb-4">60-min live demo and Q&A with our product team.</p>
              <a href="/webinars" className="text-emerald-600">View webinars →</a>
            </div>

            <div className="p-6 border rounded-lg bg-white">
              <h3 className="font-semibold mb-1">Accounting workflows</h3>
              <p className="text-sm text-slate-600 mb-4">Deep dive into bank reconciliation and month-end close.</p>
              <a href="/webinars" className="text-emerald-600">View webinars →</a>
            </div>

            <div className="p-6 border rounded-lg bg-white">
              <h3 className="font-semibold mb-1">Partner training</h3>
              <p className="text-sm text-slate-600 mb-4">Advanced sessions for accounting professionals and partners.</p>
              <a href="/webinars" className="text-emerald-600">View webinars →</a>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Support & resources</h2>
          <ResourceGrid />
        </section>

        <section className="max-w-6xl mx-auto py-12 text-center">
          <h3 className="text-xl font-bold mb-4">Still need help?</h3>
          <p className="text-slate-600 mb-6">Our support team is happy to help — reach out and we'll get back to you as soon as possible.</p>
          <a href="/contact" className="inline-block bg-slate-800 text-white px-6 py-3 rounded-lg">Contact Support</a>
        </section>
      </main>
    </>
  )
}
