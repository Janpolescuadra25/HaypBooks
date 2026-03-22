'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payroll Approvals"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Processing / Payroll Approvals"
      purpose="Review and approve payroll runs before payment is released. Compare current run to prior run, review variance explanations, and provide digital approval with timestamp."
      components={[
        { name: "Approval Queue", description: "Payroll runs awaiting approval with gross pay, headcount, and variance" },
        { name: "Run Summary Comparison", description: "Side-by-side comparison of current run vs. previous run" },
        { name: "Variance Explanation Panel", description: "Required explanations for variances above threshold" },
        { name: "Approve/Return Controls", description: "Approve run or return it for corrections with comments" },
        { name: "Approval History", description: "All prior approvals with timestamps and approver names" },
      ]}
      tabs={["Pending Approval","Approved","Returned","History"]}
      features={["Multi-level payroll approval","Variance threshold reporting","Prior period comparison","Digital approval with audit trail","Return for corrections workflow"]}
      dataDisplayed={["Run period and pay date","Total gross and net pay","Employee count","Variance vs. prior run","Approval status"]}
      userActions={["Review payroll run summary","Compare to prior run","Request variance explanation","Approve payroll","Return for corrections"]}
    />
  )
}

