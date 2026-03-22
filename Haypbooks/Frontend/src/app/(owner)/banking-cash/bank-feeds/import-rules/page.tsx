'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Import Rules"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Bank Feeds / Import Rules"
      purpose="Define rules that automatically categorize and transform imported bank transactions. Rules match on payee name, description patterns, or amount ranges and apply default accounts and tags."
      components={[
        { name: "Rules List", description: "All active import rules with match condition and assigned account" },
        { name: "Rule Builder", description: "Form to create conditions (if description contains X, assign account Y)" },
        { name: "Rule Priority Ordering", description: "Drag to reorder rules; first matching rule wins" },
        { name: "Test Rule", description: "Run a rule against historical transactions to preview matches" },
        { name: "Match Preview", description: "See which historical transactions each rule would categorize" },
      ]}
      tabs={["Active Rules","Disabled","Test Rules"]}
      features={["Flexible condition matching (text, amount, payee)","Multi-field rule conditions","Priority ordering","Rule testing on historical data","Enable/disable per rule"]}
      dataDisplayed={["Rule name and description","Match conditions","Assigned GL account","Tags applied","Match count from last 90 days"]}
      userActions={["Create import rule","Edit rule conditions","Reorder rule priority","Test rule against history","Enable or disable rule"]}
    />
  )
}

