'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Community Tax"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Local Taxes / Community Tax"
      badge="PH ONLY"
      purpose="Manage community tax certificate (cedula) procurement for the business and key officers. Track annual renewal requirements and store cedula documents for compliance."
      components={[
        { name: "Cedula Register", description: "Community tax certificates for business and officers with valid dates" },
        { name: "Renewal Tracker", description: "Annual renewal deadlines for each cedula" },
        { name: "Fee Recording", description: "Log community tax fees paid per year" },
        { name: "Document Upload", description: "Store scanned cedula copies for audit and compliance" },
      ]}
      tabs={["Cedulas","Renewal Calendar","Documents"]}
      features={["Cedula tracking per person/entity","Annual renewal alerts","Document storage","Fee expense recording"]}
      dataDisplayed={["Holder name (company/officer)","Cedula serial number","Issue date and year","Fee paid","Status (current/renewal due)"]}
      userActions={["Add cedula record","Upload cedula document","Record fee payment","Set renewal reminder","View history"]}
    />
  )
}

