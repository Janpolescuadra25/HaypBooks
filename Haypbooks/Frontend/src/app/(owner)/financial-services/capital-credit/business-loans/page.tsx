'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Business Loans"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Capital & Credit / Business Loans"
      badge="FS"
      purpose="Access Haypbooks-partnered business loan products. Apply for term loans, view loan status, manage repayment schedules, and track loan balance and interest within your accounting records."
      components={[
        { name: "Loan Application", description: "Multi-step loan application using your Haypbooks financial data for instant pre-qualification" },
        { name: "Loan Dashboard", description: "Active loans with balance, rate, next payment, and payoff schedule" },
        { name: "Repayment Schedule", description: "Month-by-month principal and interest breakdown" },
        { name: "Auto-Payment Setup", description: "Configure automatic repayment from your business checking account" },
        { name: "Loan Documents", description: "Access loan agreements, disclosure documents, and payment confirmations" },
      ]}
      tabs={["My Loans","Apply","Repayment","Documents"]}
      features={["In-app loan application","Pre-qualification using live financials","Repayment tracking","Auto-payment","GL integration for payments"]}
      dataDisplayed={["Loan amount and term","Interest rate (APR)","Balance remaining","Next payment date and amount","Total interest paid"]}
      userActions={["Apply for loan","View repayment schedule","Make extra payment","Set up auto-pay","Download loan documents"]}
    />
  )
}

