'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Transaction Rules"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Transactions / Transaction Rules"
      purpose="Create rules that automatically categorize, tag, and match imported bank transactions based on description keywords, amount ranges, and payee patterns. Reduce manual review time significantly."
      components={[
        { name: "Rules List", description: "All active rules with condition summary and match statistics" },
        { name: "Rule Builder", description: "Condition editor: if description contains / amount between / payee equals → assign account + tags" },
        { name: "Priority Manager", description: "Drag-to-reorder rules; first matching rule is applied" },
        { name: "Rule Tester", description: "Run rule against last 90 days of transactions to preview matches" },
        { name: "Match Statistics", description: "How many transactions each rule has auto-categorized" },
      ]}
      tabs={["Active Rules","Disabled","Test","Statistics"]}
      features={["Text and amount conditions","Multi-condition rules","Priority ordering","Rule testing","Import rule performance stats"]}
      dataDisplayed={["Rule name and condition summary","Target GL account","Tags applied","Transactions auto-categorized count","Last match date"]}
      userActions={["Create categorization rule","Edit rule conditions","Test rule on history","Reorder rule priority","Enable or disable rule"]}
    />
  )
}

