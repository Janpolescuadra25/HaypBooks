'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Holiday Calendar"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Time & Leave / Holiday Calendar"
      badge="PH ONLY"
      purpose="Manage official company holidays and non-working days. Define regular holidays, special non-working days, and company-specific days off, with payroll premium pay rules per holiday type."
      components={[
        { name: "Holiday Calendar View", description: "Full-year calendar with all holidays highlighted by type" },
        { name: "Holiday List", description: "All defined holidays with date, name, type, and pay rule" },
        { name: "Add Holiday Form", description: "Create new holiday with date, name, type (regular/special), and grace period" },
        { name: "Premium Pay Rules", description: "Configure pay multipliers for work done on each holiday type" },
        { name: "Import Proclamations", description: "Upload government-declared holidays for the year automatically" },
      ]}
      tabs={["Calendar View","Holiday List","Pay Rules","Import"]}
      features={["Regular and special holiday types","Pay premium rules per type","Multi-year calendar management","Government proclamation import","Company-specific days off"]}
      dataDisplayed={["Holiday name and date","Holiday type","Pay premium multiplier","Affected locations or all company","Annual count of holidays"]}
      userActions={["Add holiday","Set pay rule","Import government holidays","View calendar year","Delete or edit holiday"]}
    />
  )
}

