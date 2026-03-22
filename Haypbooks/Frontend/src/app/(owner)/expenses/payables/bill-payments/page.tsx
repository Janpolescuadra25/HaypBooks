'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bill Payments"
      module="EXPENSES"
      breadcrumb="Expenses / Payables / Bill Payments"
      purpose="Record and manage payments made against vendor bills. Apply payments to specific bill line items, track payment status, and reconcile against bank transactions."
      components={[
        { name: "Payment List", description: "All recorded bill payments with vendor, date, amount, and payment method" },
        { name: "Apply Payment Form", description: "Select bills and allocate payment amounts to each outstanding bill" },
        { name: "Overpayment Handling", description: "Apply credit memos or create vendor credits for overpayments" },
        { name: "Bank Match Controls", description: "Link payment record to corresponding bank transaction" },
        { name: "Payment Confirmation", description: "Print or email payment remittance to vendor" },
      ]}
      tabs={["All Payments","Unmatched","Reconciled"]}
      features={["Partial and full payment support","Multi-bill payment allocation","Over-payment credit handling","Bank transaction matching","Remittance generation"]}
      dataDisplayed={["Vendor name and payment date","Payment amount and method","Bills paid and amounts applied","Bank matched status","Remittance sent status"]}
      userActions={["Record bill payment","Apply to outstanding bills","Handle overpayment","Match to bank transaction","Print remittance advice"]}
    />
  )
}

