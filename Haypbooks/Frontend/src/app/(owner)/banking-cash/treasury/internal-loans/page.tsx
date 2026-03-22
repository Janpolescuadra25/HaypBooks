'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Internal Loans"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Treasury / Internal Loans"
      purpose="Manage intercompany and shareholder loans. Track principal balances, interest accrual, repayment schedules, and generate loan amortization schedules for disclosure."
      components={[
        { name: "Loan Register", description: "All active internal loans with borrower, lender, balance, and terms" },
        { name: "Amortization Schedule", description: "Period-by-period principal and interest repayment schedule" },
        { name: "Payment Processing", description: "Record loan repayments and interest payments" },
        { name: "Interest Rate Manager", description: "Set and update interest rates with effective dates" },
      ]}
      tabs={["Active Loans","Paid Off","Amortization","Payments"]}
      features={["Loan amortization schedules","Interest accrual automation","Payment tracking","Intercompany elimination support","Loan disclosure reports"]}
      dataDisplayed={["Loan name and parties","Principal balance","Interest rate and term","Next payment date and amount","Loan maturity date"]}
      userActions={["Add new internal loan","Record payment","View amortization schedule","Update interest rate","Generate loan disclosure report"]}
    />
  )
}

