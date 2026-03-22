'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Tax Obligations"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Tax Calendar / Tax Obligations"
      badge="PH ONLY"
      purpose="View your company's complete tax profile and all active tax obligations based on your registration type, industry code, and RDO. Manage your registered tax types and filing frequencies."
      components={[
        { name: "Obligation Profile", description: "Summary of all registered tax types and their filing frequencies" },
        { name: "RDO Information", description: "Revenue District Office details and how to update with BIR" },
        { name: "Registered Tax Types", description: "List of all BIR-registered tax types (VAT/Percentage/Income/Withholding)" },
        { name: "Filing Frequency Settings", description: "Monthly vs. quarterly filing schedule per obligation" },
        { name: "De-registration Tracking", description: "Track tax type de-registrations applied for with BIR" },
      ]}
      tabs={["Tax Profile","Registered Types","RDO","De-registrations"]}
      features={["Tax profile overview","RDO information","Registered tax type management","Filing frequency configuration","De-registration tracking"]}
      dataDisplayed={["Tax type and BIR code","Filing frequency","RDO number and name","Registration date","Effectivity date"]}
      userActions={["View tax profile","Update RDO information","Manage filing frequencies","Track de-registration request","Export tax profile"]}
    />
  )
}

