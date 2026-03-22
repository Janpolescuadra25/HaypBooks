'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AIRulesPage() {
  return (
    <PageDocumentation
      title="AI Rules"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Governance / AI Rules"
      purpose="Define constraints, guardrails, and behavioral rules governing how AI agents operate on financial data, ensuring compliance and preventing unintended actions."
      components={[
        { name: "Rule List", description: "All active AI governance rules with scope and enforcement level" },
        { name: "Rule Builder", description: "No-code rule builder: IF condition THEN action/block" },
        { name: "Conflict Checker", description: "Identify overlapping or contradictory rules" },
      ]}
      tabs={[
        "Active Rules",
        "Drafts",
        "Archived",
        "Conflict Check",
      ]}
      features={[
        "Condition-action rule syntax",
        "Pre-built rule templates",
        "Rule priority ordering",
        "Audit log of rule-triggered events",
        "Rule testing sandbox",
      ]}
      dataDisplayed={[
        "Rule name and description",
        "Trigger condition",
        "Action or restriction applied",
        "Rule enabled/disabled status",
        "Last triggered timestamp",
      ]}
      userActions={[
        "Create new AI rule",
        "Edit existing rule",
        "Test rule in sandbox",
        "Enable/disable rule",
        "Export rule set",
      ]}
    />
  )
}

