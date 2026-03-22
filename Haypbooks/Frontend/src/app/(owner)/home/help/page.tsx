'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Help Center"
      module="HOME"
      breadcrumb="Home / Help Center"
      purpose="The Help Center is the in-app self-service support hub providing access to documentation articles, video tutorials, feature guides, guided product tours, frequently asked questions, and live support contact options. It is context-aware wherever possible — surfacing help content relevant to the module the user was last viewing. It empowers users to self-solve issues quickly without leaving the application."
      components={[
        { name: 'Search Bar', description: 'Full-text search across all help articles, FAQs, and video transcripts with instant result preview.' },
        { name: 'Getting Started Guide', description: 'Curated onboarding path for new users: 5-step guide to getting your first invoice, bill, and bank reconciliation done.' },
        { name: 'Module Help Browser', description: 'Browse help content organized by module (Accounting, Banking, Sales, Expenses, Payroll, etc.) with article count per module.' },
        { name: 'Video Library', description: 'Short tutorial videos (2–10 minutes each) covering key workflows, organized by topic.' },
        { name: 'Guided Tour Launcher', description: 'Launch interactive product tours for specific features — highlights UI elements and explains each step in-app.' },
        { name: 'Contact Support Panel', description: 'Submit a support ticket, start live chat with support agent, or view open ticket status.' },
        { name: 'Release Notes', description: 'Latest feature releases and updates, organized by date.' },
      ]}
      tabs={['Search', 'Getting Started', 'By Module', 'Videos', 'Contact Support', "What's New"]}
      features={[
        'Context-aware help suggestions based on current module',
        'Full-text search across documentation',
        'Embedded video tutorials without leaving app',
        'Interactive guided tours with UI highlighting',
        'Live chat support integration',
        'Support ticket submission and status tracking',
        'Release notes and changelog',
      ]}
      dataDisplayed={[
        'Help articles with title, summary, and module tag',
        'Video tutorials with duration and topic',
        'FAQ list with most common questions',
        'Release notes history',
        'Open support ticket status and last update',
      ]}
      userActions={[
        'Search for help by keyword or topic',
        'Browse help by module',
        'Watch a tutorial video',
        'Launch a guided product tour',
        'Submit a support ticket with screenshots',
        'Start live chat with support',
        'Rate an article as helpful or not helpful',
        'View status of open support tickets',
      ]}
      relatedPages={[
        { label: 'Setup Center', href: '/home/setup-center' },
        { label: 'Dashboard', href: '/home/dashboard' },
        { label: 'System Alerts', href: '/settings/notifications/system-alerts' },
      ]}
    />
  )
}

