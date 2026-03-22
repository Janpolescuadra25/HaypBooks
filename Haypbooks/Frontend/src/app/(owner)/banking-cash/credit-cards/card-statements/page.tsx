'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Card Statements"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Credit Cards / Card Statements"
      purpose="Monthly credit card statements for all company cards. Review statement transactions, record payments, note payment due dates, and reconcile statement balance to GL."
      components={[
        { name: "Statement List", description: "Past statements by card and period with balance and payment status" },
        { name: "Statement Detail View", description: "All transactions in a selected statement period" },
        { name: "Payment Recording", description: "Record credit card payment and apply to statement balance" },
        { name: "Reconciliation Checkoff", description: "Check off statement line items matched to GL transactions" },
      ]}
      tabs={["Current Statement","Past Statements","Payments"]}
      features={["Monthly statement archive","Payment recording","Statement reconciliation","PDF download","Due date reminders"]}
      dataDisplayed={["Statement period dates","Opening and closing balance","Total charges and credits","Payment due date","Minimum payment required"]}
      userActions={["View statement transactions","Record payment","Reconcile statement","Download PDF","Set payment reminder"]}
    />
  )
}

