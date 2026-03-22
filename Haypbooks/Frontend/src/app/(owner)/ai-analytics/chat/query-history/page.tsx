'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function QueryHistoryPage() {
  return (
    <PageDocumentation
      title="Query History"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Chat / Query History"
      purpose="View and replay past AI chat queries, enabling reuse of complex questions and analysis of frequently asked questions across the organization."
      components={[
        { name: "History List", description: "Chronological list of past queries with preview and date" },
        { name: "Query Detail", description: "Full question and AI response with citations" },
        { name: "Re-run Button", description: "Re-execute a query against current data" },
        { name: "Search Bar", description: "Full-text search across query history" },
      ]}
      tabs={[
        "My History",
        "Team History",
        "Saved Queries",
        "Bookmarks",
      ]}
      features={[
        "Search across all past queries",
        "Save query as template",
        "Share query with team",
        "Re-run with updated data",
        "Export query log",
      ]}
      dataDisplayed={[
        "Query text and timestamp",
        "AI response summary",
        "Data sources cited",
        "Query author (team history)",
        "Re-run result comparison",
      ]}
      userActions={[
        "Search query history",
        "Re-run a past query",
        "Save query as template",
        "Share with team member",
        "Delete query from history",
      ]}
    />
  )
}

