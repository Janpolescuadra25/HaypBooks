'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="VAT Registration"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / VAT / VAT Registration"
      badge="PH ONLY"
      purpose="Manage VAT registration status, threshold monitoring, and cross-filing period transitions. Track gross sales against the PHP 3 million VAT threshold and manage opt-in or mandatory registration."
      components={[
        { name: "Registration Status Card", description: "Current VAT registration status (VAT or Non-VAT) and TIN" },
        { name: "Threshold Monitor", description: "Running total of gross sales vs. PHP 3M VAT threshold" },
        { name: "Registration Documents", description: "Stored BIR Certificate of Registration (COR) copies" },
        { name: "Transition Manager", description: "Guide and track the process of transitioning from non-VAT to VAT" },
        { name: "RDO Contact Info", description: "Revenue District Office details for VAT registration inquiries" },
      ]}
      tabs={["Status","Threshold Monitor","Documents","Registration History"]}
      features={["PHP 3M threshold monitoring","Registration status management","COR document storage","Transition guidance","RDO information"]}
      dataDisplayed={["VAT registration status","Current year gross sales vs. threshold","TIN and RDO number","Effective date of VAT registration","COR validity date"]}
      userActions={["View registration status","Monitor sales threshold","Upload COR","Initiate registration transition","Update RDO info"]}
    />
  )
}

