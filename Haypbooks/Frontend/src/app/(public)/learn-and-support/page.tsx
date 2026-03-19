import Link from 'next/link'
import LandingHeader from '@/components/landing/LandingHeader'
import { BookOpen, MessageCircle, Video, FileText, HelpCircle, Mail } from 'lucide-react'

export const metadata = {
  title: 'Learn & Support — HaypBooks',
  description: 'Guides, tutorials, and support resources to help you get the most out of HaypBooks.',
}

const RESOURCES = [
  {
    icon: BookOpen,
    title: 'Getting Started Guide',
    description: 'Step-by-step walkthrough to set up your first company, chart of accounts, and opening balances.',
    link: '#',
    linkText: 'Read the Guide',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Short how-to videos covering invoicing, reconciliation, payroll, and BIR compliance features.',
    link: '#',
    linkText: 'Watch Videos',
  },
  {
    icon: FileText,
    title: 'Knowledge Base',
    description: 'Searchable articles on every HaypBooks feature — from journal entries to tax form generation.',
    link: '#',
    linkText: 'Browse Articles',
  },
  {
    icon: HelpCircle,
    title: 'FAQs',
    description: 'Answers to the most common questions about billing, security, data imports, and compliance.',
    link: '/pricing',
    linkText: 'View FAQs',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat Support',
    description: 'Reach our support team during business hours (Mon–Fri, 9 AM – 6 PM PHT) for real-time help.',
    link: '#',
    linkText: 'Start a Chat',
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us a detailed message and we will get back to you within one business day.',
    link: 'mailto:support@haypbooks.com',
    linkText: 'Email Us',
  },
]

const TOPICS = [
  'Setting up your Chart of Accounts',
  'Recording journal entries',
  'Creating & sending invoices',
  'Bank reconciliation basics',
  'Generating BIR forms (2307, 2550M)',
  'Managing vendor bills & payments',
  'Running payroll with SSS/PhilHealth/Pag-IBIG',
  'Multi-company setup',
  'Inviting team members & setting roles',
  'Importing data from spreadsheets',
]

export default function LearnAndSupportPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen pt-24 md:pt-28 bg-white">
        {/* Hero */}
        <section className="text-center px-6 py-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Learn & get help
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Guides, tutorials, and real human support to make sure you get the most out of HaypBooks.
          </p>
        </section>

        {/* Resources Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {RESOURCES.map((r) => {
              const Icon = r.icon
              return (
                <div key={r.title} className="rounded-2xl border border-slate-200 p-6 bg-white hover:shadow-md transition-shadow flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{r.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{r.description}</p>
                  <Link href={r.link} className="mt-4 text-emerald-600 text-sm font-bold hover:text-emerald-700 transition-colors">
                    {r.linkText} →
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* Popular Topics */}
        <section className="bg-slate-50 px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Popular help topics</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {TOPICS.map((topic) => (
                <div key={topic} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-sm text-slate-700">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center px-6 py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Still need help?</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            Our Philippine-based support team is here for you. Reach out and we will help you solve it.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="mailto:support@haypbooks.com"
              className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Contact Support
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
