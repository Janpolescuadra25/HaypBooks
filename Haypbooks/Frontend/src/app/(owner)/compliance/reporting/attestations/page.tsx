'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Attestations"
      module="COMPLIANCE"
      breadcrumb="Compliance / Reporting / Attestations"
      purpose="Manage and track written sign-offs and attestations from management on financial statements, internal controls, and company policies. Collect digital signatures with full auditability."
      components={[
        { name: "Attestation List", description: "All active attestation requests with signatories and completion status" },
        { name: "Send Attestation Form", description: "Create and distribute an attestation with deadline and required signatories" },
        { name: "Digital Sign-off", description: "Attestation UI for signatories to review document and provide digital signature" },
        { name: "Completion Tracker", description: "Progress bar showing % of required signatories who have completed" },
        { name: "Archive", description: "Historical attestations with signed copies and timestamps" },
      ]}
      tabs={["Active","Overdue","Completed","Archive"]}
      features={["Multi-signatory support","Digital signature capture","Deadline reminders","Completion tracking","PDF certificate generation"]}
      dataDisplayed={["Attestation subject and period","Required signatories list","Completion percentage","Signing deadline","Signed date and IP"]}
      userActions={["Create attestation request","Send to signatories","Sign attestation","Send reminder","View signed certificate"]}
    />
  )
}

