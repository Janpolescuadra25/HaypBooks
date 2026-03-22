'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Line of Credit"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Capital & Credit / Line of Credit"
      badge="FS"
      purpose="Revolving business line of credit for flexible cash flow management. Draw funds when needed, repay, and redraw. Track utilization, interest, and credit limit within Haypbooks."
      components={[
        { name: "Credit Line Dashboard", description: "Available credit, drawn amount, and credit limit visually displayed" },
        { name: "Draw Request Form", description: "Specify amount to draw with destination account and purpose" },
        { name: "Repayment Form", description: "Record full or partial repayment with interest breakdown" },
        { name: "Statement View", description: "Monthly statement showing draws, repayments, and interest charges" },
        { name: "Utilization Chart", description: "Historical chart of drawn balance vs. credit limit" },
      ]}
      tabs={["Overview","Draws & Repayments","Statements","Settings"]}
      features={["Revolving credit management","Draw and repayment tracking","Interest calculation","GL integration","Utilization monitoring"]}
      dataDisplayed={["Credit limit and available credit","Current drawn balance","Interest rate and accrued interest","Draw and repayment history","Current utilization percentage"]}
      userActions={["Request draw","Make repayment","View statement","Monitor utilization","Download agreement"]}
    />
  )
}

