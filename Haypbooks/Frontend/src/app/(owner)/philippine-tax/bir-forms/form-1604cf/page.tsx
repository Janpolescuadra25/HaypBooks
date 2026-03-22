'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 1604-CF"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 1604-CF"
      badge="PH ONLY"
      purpose="Generate BIR Form 1604-CF (Annual Information Return of Income Taxes Withheld on Compensation and Final Withholding Taxes). Required annual year-end filing for employers."
      components={[
        { name: "Form Generator", description: "Auto-populate 1604-CF from full-year payroll and withholding data" },
        { name: "Annex A (Alphalist)", description: "Employee alphalist with annual compensation and taxes withheld" },
        { name: "Annex B", description: "Alphalist of non-resident aliens and special employees" },
        { name: "Validation Engine", description: "Pre-filing check for TIN issues and total reconciliation" },
        { name: "eFPS Export", description: "Generate BIR-formatted file for eFPS submission" },
      ]}
      tabs={["Form","Annex A","Annex B","Validation","History"]}
      features={["Full-year compensation consolidation","Alphalist generation","eFPS file export","TIN validation","Year-end reconciliation"]}
      dataDisplayed={["Total compensation paid","Total taxes withheld","Number of employees","Annual filing deadline","Previous year comparison"]}
      userActions={["Generate 1604-CF form","Review alphalist","Validate data","Export for eFPS","Record filing"]}
    />
  )
}

