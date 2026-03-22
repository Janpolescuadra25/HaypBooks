'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function PeriodSignOffsPage() {
  return (
    <PageDocumentation
      title="Sign-offs"
      module="ACCOUNTING — PERIOD CLOSE"
      breadcrumb="Accounting / Period Close / Sign-offs"
      purpose="Collect electronic sign-offs from all required approvers (CFO, Controller, auditors) before the period close is finalized."
      components={[
        { name: "Sign-off Dashboard", description: "All approvers and their sign-off status for the current period" },
        { name: "Approval Request Form", description: "Send sign-off requests to specific users with comments" },
        { name: "Audit Trail", description: "Timestamped log of every sign-off action" },
      ]}
      tabs={[
        "Required Sign-offs",
        "Pending",
        "Completed",
        "Audit Trail",
      ]}
      features={[
        "Role-based sign-off requirements",
        "Email and in-app notifications",
        "Electronic signature capture",
        "Comments and conditions",
        "Reminder escalation",
      ]}
      dataDisplayed={[
        "Required approvers by role",
        "Sign-off status and date",
        "Comments attached",
        "Period close progress percentage",
      ]}
      userActions={[
        "Request sign-off from approver",
        "Add sign-off comment",
        "Approve or reject sign-off request",
        "Send reminder",
        "View audit trail",
      ]}
    />
  )
}

