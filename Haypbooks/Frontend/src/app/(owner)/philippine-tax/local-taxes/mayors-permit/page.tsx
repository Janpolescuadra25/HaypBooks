'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Mayor's Permit"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Local Taxes / Mayor's Permit"
      badge="PH ONLY"
      purpose="Track and manage Mayor's Permit (Business Permit) compliance for all business locations. Monitor annual renewal deadlines, record fees paid, and store permit documents."
      components={[
        { name: "Permit Register", description: "All Mayor's Permits with location, permit number, and expiry date" },
        { name: "Renewal Calendar", description: "Upcoming permit renewal deadlines by city or municipality" },
        { name: "Fee Computation Guide", description: "Estimated fees based on gross sales declared the prior year" },
        { name: "Document Vault", description: "Scanned permit certificates and supporting documents" },
        { name: "Inspection Tracker", description: "BFP, sanitary, and other inspection requirements during renewal" },
      ]}
      tabs={["Permits","Renewal Calendar","Inspections","Documents"]}
      features={["Multi-location permit tracking","Annual renewal reminders","Fee estimate calculator","Document storage","Inspection checklist"]}
      dataDisplayed={["Location and city/municipality","Permit number","Issue and expiry dates","Annual fee paid","Status (valid/expiring/expired)"]}
      userActions={["Add permit record","Upload permit document","Record fee payment","Track inspection requirements","Set renewal reminder"]}
    />
  )
}

