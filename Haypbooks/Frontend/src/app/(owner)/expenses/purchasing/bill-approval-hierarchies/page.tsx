'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bill Approval Hierarchies"
      module="EXPENSES"
      breadcrumb="Expenses / Purchasing / Bill Approval Hierarchies"
      purpose="Specific approval hierarchy configuration for vendor bills. Define who must sign off on bills by vendor category, amount range, and GL account to ensure proper financial controls."
      components={[
        { name: "Hierarchy Diagram", description: "Visual tree of the bill approval hierarchy by scenario" },
        { name: "Rule Configuration", description: "Condition-based rules: if bill > $10K then require CFO approval" },
        { name: "Approver Directory", description: "Manage the list of authorized bill approvers and their limits" },
        { name: "Override Log", description: "Track instances where standard hierarchy was bypassed with reason" },
      ]}
      tabs={["Hierarchy","Rules","Approvers","Overrides"]}
      features={["Amount-based escalation","Vendor and category-specific rules","Per-approver spending limits","Override with audit trail","Temporary delegation"]}
      dataDisplayed={["Approval rule condition","Required approvel level","Approver name and limit","Current items per rule","Override count"]}
      userActions={["Configure bill approval rule","Add approver to hierarchy","Set spending limits","View override log","Update hierarchy"]}
    />
  )
}

