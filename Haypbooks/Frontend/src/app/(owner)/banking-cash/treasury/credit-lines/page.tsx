'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Credit Lines"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Treasury / Credit Lines"
      purpose="Track revolving credit facilities including lines of credit, overdraft protection, and credit cards. Monitor available credit, drawn amounts, interest accrual, and repayment schedules."
      components={[
        { name: "Credit Line Dashboard", description: "Summary of all credit facilities with limit, drawn, and available amounts" },
        { name: "Draw and Repayment Log", description: "History of draws and repayments with dates and interest" },
        { name: "Interest Accrual Tracker", description: "Calculated interest accruing on outstanding balances" },
        { name: "Covenant Monitor", description: "Track financial covenant compliance requirements" },
      ]}
      tabs={["Overview","Draws & Repayments","Interest","Covenants"]}
      features={["Multi-facility tracking","Available vs. drawn visualization","Interest tracking","Covenant monitoring","Utilization alerts"]}
      dataDisplayed={["Credit facility name and lender","Credit limit and drawn amount","Available credit","Interest rate and accrued interest","Next draw/repayment date"]}
      userActions={["Record draw on credit line","Record repayment","View interest schedule","Monitor covenant compliance","Set utilization alert"]}
    />
  )
}

