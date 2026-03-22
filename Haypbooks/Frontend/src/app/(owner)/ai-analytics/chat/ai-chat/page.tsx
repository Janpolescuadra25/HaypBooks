'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AIChatPage() {
  return (
    <PageDocumentation
      title="AI Chat"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Chat / AI Chat"
      purpose="Natural language interface for querying financial data, generating reports, and getting accounting guidance using the company's own books as context."
      components={[
        { name: "Chat Interface", description: "Full-screen chat window with message history and typing indicator" },
        { name: "Suggested Prompts", description: "Pre-built prompt tiles for common queries" },
        { name: "Data Citations", description: "Each AI response cites the specific data source or transaction it used" },
        { name: "Export Response", description: "Export chat answer as a formatted report" },
      ]}
      tabs={[
        "Chat",
        "Suggested Prompts",
        "History",
      ]}
      features={[
        "Natural language to SQL query",
        "Chart generation from chat",
        "Data citations for transparency",
        "Session memory",
        "Multi-turn conversations",
        "Export to PDF",
      ]}
      dataDisplayed={[
        "AI responses with data citations",
        "Embedded charts from data",
        "Referenced transactions or accounts",
        "Suggested follow-up questions",
      ]}
      userActions={[
        "Ask a financial question",
        "Use a suggested prompt",
        "Export AI response",
        "Share chat with team",
        "Clear chat history",
      ]}
    />
  )
}

