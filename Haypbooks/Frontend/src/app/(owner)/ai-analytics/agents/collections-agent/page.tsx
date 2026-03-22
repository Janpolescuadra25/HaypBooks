'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CollectionsAgentPage() {
  return (
    <PageDocumentation
      title="Collections Agent"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Agents / Collections Agent"
      purpose="AI agent that monitors overdue receivables, scores customer payment likelihood, and automatically drafts and sends collection communications."
      components={[
        { name: "Collections Pipeline", description: "Kanban-style view of overdue invoices by risk level" },
        { name: "Customer Risk Scores", description: "AI-generated payment probability scores per customer" },
        { name: "Automated Outreach Log", description: "Emails and messages sent by the agent with response tracking" },
        { name: "Escalation Rules", description: "Configure when to escalate to human review" },
      ]}
      tabs={[
        "Pipeline",
        "Risk Scores",
        "Outreach Log",
        "Escalations",
        "Settings",
      ]}
      features={[
        "AI payment likelihood scoring",
        "Automated dunning email generation",
        "Response sentiment analysis",
        "Escalation to human agent",
        "Collection effectiveness analytics",
      ]}
      dataDisplayed={[
        "Overdue invoice amounts by customer",
        "Days past due",
        "AI risk score and reasoning",
        "Last contact date and response",
        "Amount collected vs. outstanding",
      ]}
      userActions={[
        "Trigger manual outreach",
        "Override AI risk score",
        "Escalate to human",
        "Configure outreach templates",
        "View collections analytics",
      ]}
    />
  )
}

