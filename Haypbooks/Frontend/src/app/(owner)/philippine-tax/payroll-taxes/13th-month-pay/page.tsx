'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="13th Month Pay"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Payroll Taxes / 13th Month Pay"
      badge="PH ONLY"
      purpose="Compute and process the mandatory 13th month pay for all rank-and-file employees. Calculate the correct amount based on basic salary earned during the year and generate payslips."
      components={[
        { name: "13th Month Calculator", description: "Automatic computation: (total basic salary for year) ÷ 12" },
        { name: "Eligibility Check", description: "Confirm employees who qualify (rank-and-file employed at least 1 month)" },
        { name: "Pro-Ration for New Hires", description: "Prorate 13th month for employees hired mid-year" },
        { name: "Tax Treatment", description: "Apply the PHP 90,000 exemption threshold" },
        { name: "Payment Processing", description: "Include in December payroll or process as separate pay run" },
      ]}
      tabs={["Computations","Eligibility","Payment","History"]}
      features={["Mandatory statutory computation","Pro-ration for partial years","PHP 90,000 exemption","Payslip generation","Bulk release"]}
      dataDisplayed={["Employee name","12-month basic salary total","13th month amount","Taxable portion (above threshold)","Pro-rated fraction if applicable"]}
      userActions={["View 13th month computations","Review pro-rated employees","Approve for payment","Process payment run","Download payslips"]}
    />
  )
}

