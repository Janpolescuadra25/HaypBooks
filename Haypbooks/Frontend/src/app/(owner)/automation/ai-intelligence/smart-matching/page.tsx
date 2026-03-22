'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Smart Matching"
      module="AUTOMATION"
      breadcrumb="Automation / AI Intelligence / Smart Matching"
      purpose="AI-powered matching of imported bank transactions to existing bills, invoices, and payments. Configure confidence thresholds, review suggested matches, and process unmatched items."
      components={[
        { name: "Match Review Table", description: "Bank transactions with AI-suggested matches and confidence scores" },
        { name: "Confidence Threshold Slider", description: "Set minimum confidence to auto-apply matches vs. require review" },
        { name: "Unmatched Items Panel", description: "Transactions with no suitable match requiring manual action" },
        { name: "Match History", description: "Log of all applied matches for audit and correction" },
        { name: "Rule Configuration", description: "Define matching rules based on amount tolerance and date range" },
      ]}
      tabs={["Review Queue","Auto-Matched","Unmatched","History","Settings"]}
      features={["ML-powered transaction matching","Configurable confidence threshold","Auto-apply high-confidence matches","Bulk match review","Match override and correction"]}
      dataDisplayed={["Bank transaction description and amount","Suggested matching record","Confidence percentage","Date proximity","Amount variance"]}
      userActions={["Review suggested matches","Accept or reject match","Manually match transaction","Configure confidence threshold","Process unmatched items"]}
    />
  )
}

