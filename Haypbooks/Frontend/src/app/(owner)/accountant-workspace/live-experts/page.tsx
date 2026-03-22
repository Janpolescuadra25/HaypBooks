'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function LiveExpertsPage() {
  return (
    <PageDocumentation
      title="Live Experts"
      module="ACCOUNTANT WORKSPACE"
      breadcrumb="Accountant Workspace / Live Experts"
      purpose="Connect business owners with verified accounting professionals for live chat, video consultation, and on-demand bookkeeping assistance."
      components={[
        { name: "Expert Directory", description: "Searchable list of available CPAs and bookkeepers with ratings and specialties" },
        { name: "Session Scheduler", description: "Calendar-based booking interface for video or phone consultations" },
        { name: "Live Chat Widget", description: "Real-time messaging with an assigned expert" },
        { name: "Session History", description: "Past consultations with transcripts and follow-up notes" },
      ]}
      tabs={[
        "Find Expert",
        "My Sessions",
        "Messages",
        "Session History",
      ]}
      features={[
        "Expert specialty filtering (tax, payroll, advisory)",
        "Real-time availability indicator",
        "Session recording and transcript",
        "File sharing in chat",
        "Ratings and reviews",
      ]}
      dataDisplayed={[
        "Expert profiles with credentials",
        "Available time slots",
        "Session duration and topic",
        "Past session summaries",
        "Follow-up action items",
      ]}
      userActions={[
        "Search for available experts",
        "Book a session",
        "Start live chat",
        "Share documents with expert",
        "Rate an expert after session",
      ]}
    />
  )
}

