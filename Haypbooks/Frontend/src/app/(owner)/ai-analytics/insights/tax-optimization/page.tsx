'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxOptimizationInsightsPage() {
  return (
    <PageDocumentation
      title="Tax Optimization Insights"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Insights / Tax Optimization"
      purpose="AI-derived insights identifying tax-saving opportunities across deductions, credits, entity structure, and timing strategies."
      components={[
        { name: "Opportunity Cards", description: "Each identified tax saving as an actionable card" },
        { name: "Savings Calculator", description: "Estimate potential tax savings per opportunity" },
        { name: "Priority Ranking", description: "AI-ranked opportunities by estimated impact" },
      ]}
      tabs={[
        "All Opportunities",
        "High Priority",
        "Deductions",
        "Credits",
        "Timing Strategies",
      ]}
      features={[
        "Opportunity prioritization",
        "Estimated savings calculation",
        "Jurisdiction-specific insights",
        "Integration with tax module",
        "One-click apply (where applicable)",
      ]}
      dataDisplayed={[
        "Opportunity description",
        "Estimated annual saving",
        "Confidence level",
        "Required action",
        "Applicable jurisdiction",
      ]}
      userActions={[
        "Review tax opportunity",
        "Estimate savings",
        "Apply recommendation",
        "Share with tax advisor",
        "Mark as reviewed",
      ]}
    />
  )
}

