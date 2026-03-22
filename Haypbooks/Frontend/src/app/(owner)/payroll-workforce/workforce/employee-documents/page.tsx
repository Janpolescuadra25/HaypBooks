'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Employee Documents"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Workforce / Employee Documents"
      purpose="Centralized HR document repository for all employee files including offer letters, signed contracts, performance reviews, compliance certificates, and government IDs."
      components={[
        { name: "Document Library", description: "All stored documents organized by employee and document type" },
        { name: "Upload Form", description: "Upload documents with type, effective date, and expiry date metadata" },
        { name: "Expiry Alert Manager", description: "Alerts for documents approaching their expiry date" },
        { name: "Employee Document Portal", description: "Employee self-service access to their own HR documents" },
        { name: "Document Request", description: "Request missing required documents with automated reminder" },
      ]}
      tabs={["All Documents","By Type","Expiring Soon","Employee Portal"]}
      features={["Document type categorization","Expiry date tracking with alerts","Employee self-service access","Access control by HR role","Bulk upload"]}
      dataDisplayed={["Document type and name","Employee it belongs to","Upload date","Expiry date","Status (valid/expiring/expired)"]}
      userActions={["Upload employee document","Set expiry date","Request missing document","View expiry alerts","Employee self-service download"]}
    />
  )
}

