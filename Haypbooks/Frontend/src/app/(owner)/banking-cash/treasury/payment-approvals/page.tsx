'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payment Approvals"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Treasury / Payment Approvals"
      purpose="Approval workflow for large or sensitive payments before release for processing. Define approval thresholds, assign approvers by payment type, and maintain an audit trail of all decisions."
      components={[
        { name: "Approval Queue", description: "Payments awaiting approval with requestor, payee, and amount" },
        { name: "Approval Detail Panel", description: "Full payment details, supporting documents, and policy thresholds" },
        { name: "Approve/Reject Controls", description: "One-click approve or reject with mandatory comment field" },
        { name: "Threshold Configuration", description: "Set approval requirements by amount, vendor, and payment type" },
        { name: "Audit Trail", description: "Complete history of approvals, rejections, and escalations" },
      ]}
      tabs={["Pending Approval","Approved","Rejected","History","Settings"]}
      features={["Rule-based approval thresholds","Multi-level approval chains","Audit trail with comments","Email notification to approvers","Escalation on SLA breach"]}
      dataDisplayed={["Payee name and payment amount","Payment type and bank account","Requestor and submission date","Approval status and history","Supporting documentation"]}
      userActions={["Approve payment","Reject payment with comment","Delegate approval","View payment details","Configure thresholds"]}
    />
  )
}

