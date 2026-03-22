'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function ClientRequestsPage() {
  return (
    <PageDocumentation
      title="Client Requests"
      module="ACCOUNTANT WORKSPACE"
      breadcrumb="Accountant Workspace / Client Requests"
      purpose="Manage information and document requests sent to clients during an audit, review engagement, or ongoing bookkeeping. Track responses, deadlines, and status in one place."
      components={[
        { name: "Request Queue", description: "All active requests sorted by due date and priority" },
        { name: "Request Composer", description: "Create new requests with document checklists and due dates" },
        { name: "Response Tracker", description: "Client portal link and submission status per request" },
        { name: "Communication Log", description: "Threaded comments between accountant and client" },
      ]}
      tabs={[
        "All Requests",
        "Draft",
        "Sent",
        "Awaiting Response",
        "Completed",
      ]}
      features={[
        "Drag-and-drop document upload by client",
        "Automated reminder emails",
        "Per-request due date tracking",
        "Bulk request creation",
        "Response status dashboard",
      ]}
      dataDisplayed={[
        "Request title and description",
        "Due date and days remaining",
        "Document checklist completion",
        "Client response and uploaded files",
        "Last activity timestamp",
      ]}
      userActions={[
        "Create a new client request",
        "Send reminder to client",
        "Mark request as complete",
        "Download client-provided documents",
        "Export request log",
      ]}
    />
  )
}

