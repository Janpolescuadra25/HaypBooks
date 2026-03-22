'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Issue Tracking"
      module="COMPLIANCE"
      breadcrumb="Compliance / Monitoring / Issue Tracking"
      purpose="Log and manage compliance issues, exceptions, and deficiencies. Track each issue from discovery through investigation to resolution with priority, assigned owner, and due date."
      components={[
        { name: "Issue Register", description: "All open and closed compliance issues with priority and status" },
        { name: "Create Issue Form", description: "Log a new issue with title, description, category, severity, and evidence" },
        { name: "Issue Detail Panel", description: "Full issue history, comments, evidence, and resolution notes" },
        { name: "Assignment Controls", description: "Assign issues to team members with email notification" },
        { name: "Resolution Workflow", description: "Progress issues through Open → In Progress → Resolved → Closed states" },
      ]}
      tabs={["Open","In Progress","Resolved","Closed","All Issues"]}
      features={["Full issue lifecycle management","Priority and severity classification","Evidence attachment","Assignment with notifications","Audit trail of status changes"]}
      dataDisplayed={["Issue title and category","Discovery date and source","Severity and priority rating","Assigned owner","Current status and due date"]}
      userActions={["Create new issue","Assign to team member","Update status","Add comment or evidence","Close resolved issue"]}
    />
  )
}

