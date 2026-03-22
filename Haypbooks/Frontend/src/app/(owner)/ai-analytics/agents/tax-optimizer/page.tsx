'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxOptimizerAgentPage() {
  return (
    <PageDocumentation
      title="Tax Optimizer Agent"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Agents / Tax Optimizer"
      purpose="AI agent analyzing transactions and entity structure to identify tax-saving opportunities, deduction maximization strategies, and compliance risk areas."
      components={[
        { name: "Opportunity Feed", description: "List of identified tax optimization opportunities with estimated savings" },
        { name: "Entity Analyzer", description: "Analysis of current entity structure and cross-border tax implications" },
        { name: "Deduction Tracker", description: "Monitoring potential deductions against actual expenses" },
        { name: "Compliance Risk Panel", description: "Flags for potential compliance gaps by jurisdiction" },
      ]}
      tabs={[
        "Opportunities",
        "Entity Analysis",
        "Deductions",
        "Compliance Risk",
        "History",
      ]}
      features={[
        "Entity structure optimization",
        "Deduction maximization",
        "Cross-jurisdiction tax analysis",
        "What-if scenario modeling",
        "Regulatory change notifications",
      ]}
      dataDisplayed={[
        "Identified tax savings opportunities",
        "Estimated annual savings per opportunity",
        "Jurisdiction risk flags",
        "Missing deduction categories",
        "Confidence scores",
      ]}
      userActions={[
        "Review optimization opportunity",
        "Apply a recommended strategy",
        "Run what-if scenario",
        "Export tax optimization report",
        "Configure notifications",
      ]}
    />
  )
}

