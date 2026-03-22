'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Employment Contracts"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Workforce / Employment Contracts"
      purpose="Manage employment contract records for all employees. Track probationary contracts, regularization, renewals, and termination documentation with digital signature support."
      components={[
        { name: "Contract Register", description: "All employment contracts with employee, type, start, end, and status" },
        { name: "Create Contract Form", description: "Create contract: type, term, probation period, and compensation details" },
        { name: "Digital Signature", description: "Send contract for employee and HR digital signature" },
        { name: "Renewal Alerts", description: "Upcoming contract expirations requiring renewal or regularization" },
        { name: "Contract Archive", description: "Signed PDF contracts stored against each employee profile" },
      ]}
      tabs={["Active Contracts","Ending Soon","Probationary","Signed Archive"]}
      features={["Contract type management (probationary/regular/project)","Digital signature workflow","Renewal tracking","Contract archive","Regularization processing"]}
      dataDisplayed={["Employee name and contract type","Start and end dates","Probation end date","Signature status","Contract terms summary"]}
      userActions={["Create contract","Send for signature","Process regularization","Renew or extend contract","View signed contract"]}
    />
  )
}

