'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Error Queue"
      module="AUTOMATION"
      breadcrumb="Automation / Monitoring / Error Queue"
      purpose="Failed automation executions requiring attention. See full error details for each failed workflow, rule, or scheduled task. Retry, dismiss, or escalate items for manual resolution."
      components={[
        { name: "Error List", description: "All failed automation items with name, error type, and timestamp" },
        { name: "Error Detail Panel", description: "Full stack trace, input data snapshot, and error message for selected item" },
        { name: "Retry Controls", description: "Re-execute a failed item with the original input data" },
        { name: "Dismiss and Escalate", description: "Mark items as resolved or route to a team member for manual fix" },
        { name: "Error Trend Chart", description: "Time-series chart of daily error volume by automation type" },
      ]}
      tabs={["Open Errors","Retried","Dismissed","Trend"]}
      features={["Full error details with stack traces","One-click retry","Escalation workflow","Error trending","Alert on new errors"]}
      dataDisplayed={["Automation name and type","Error timestamp and duration","Error code and message","Input data snapshot","Retry history"]}
      userActions={["View error details","Retry failed automation","Dismiss resolved error","Escalate to team member","Configure error alerts"]}
    />
  )
}

