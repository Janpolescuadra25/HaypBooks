'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="SOX Compliance"
      module="COMPLIANCE"
      breadcrumb="Compliance / Reporting / SOX Compliance"
      badge="ENT"
      purpose="Sarbanes-Oxley compliance management dashboard. Document and track controls, capture test results, management assertions, and auditor reports to meet SOX Section 302 and 404 requirements."
      components={[
        { name: "SOX Dashboard", description: "High-level SOX readiness score with control coverage and testing status" },
        { name: "Control Library", description: "All SOX-mapped controls with type, risk area, and test status" },
        { name: "Management Assertions", description: "CEO/CFO certification documents for Section 302 compliance" },
        { name: "Auditor Interface", description: "Shared view for external auditors to access test evidence and results" },
        { name: "Deficiency Log", description: "Material weaknesses and significant deficiencies with remediation" },
      ]}
      tabs={["Dashboard","Controls","Assertions","Deficiencies","Auditor View"]}
      features={["SOX Section 302 and 404 support","Control-to-risk mapping","Management certification workflow","Auditor portal access","Deficiency classification"]}
      dataDisplayed={["Control count by category and type","Test coverage percentage","Open deficiencies","Management assertion status","Auditor findings count"]}
      userActions={["Review SOX readiness score","Update control documentation","Record management assertion","Share evidence with auditor","Log deficiency"]}
    />
  )
}

