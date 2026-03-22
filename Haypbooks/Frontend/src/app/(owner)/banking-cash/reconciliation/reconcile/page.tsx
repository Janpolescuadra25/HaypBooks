'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Reconcile"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Reconciliation / Reconcile"
      purpose="Step-by-step bank statement reconciliation wizard. Match imported bank statement items to GL transactions, flag unmatched items, and close the period when balanced."
      components={[
        { name: "Statement Entry Panel", description: "Enter opening/closing statement balance and statement date" },
        { name: "Transaction Matching Table", description: "Side-by-side view of bank items and GL transactions with checkboxes" },
        { name: "AI Auto-Match Suggestions", description: "One-click accept of AI-suggested matches for imported transactions" },
        { name: "Difference Calculator", description: "Real-time display of unreconciled difference" },
        { name: "Finish Reconciliation Button", description: "Lock period when difference is zero and generate report" },
      ]}
      tabs={["Match Transactions","Unmatched","Summary"]}
      features={["AI-assisted auto-matching","Real-time difference tracking","End-of-period lock","Unmatched item investigation","PDF reconciliation report on close"]}
      dataDisplayed={["Statement opening and closing balance","Matched and unmatched transaction counts","Current unreconciled difference","AI match suggestions pending","System book balance"]}
      userActions={["Enter statement details","Match bank items to GL","Accept AI suggestions","Investigate unmatched items","Finish and lock reconciliation"]}
    />
  )
}

