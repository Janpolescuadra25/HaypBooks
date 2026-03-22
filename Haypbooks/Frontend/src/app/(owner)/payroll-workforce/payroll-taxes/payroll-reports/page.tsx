'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payroll Reports"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Taxes / Payroll Reports"
      purpose="Comprehensive payroll reporting suite. Generate payroll summary reports, employee earnings statements, tax withholding reports, and government-mandated payroll registers."
      components={[
        { name: "Report Library", description: "Pre-built payroll reports catalog with description and parameters" },
        { name: "Payroll Register", description: "Detailed listing of all employees' gross, deductions, and net pay for a period" },
        { name: "Tax Withholding Report", description: "Employee-level tax withheld with monthly and YTD totals" },
        { name: "Contribution Summary", description: "Government contribution totals by agency and period" },
        { name: "Export Controls", description: "Download reports as Excel or PDF" },
      ]}
      tabs={["Reports Library","Payroll Register","Tax Reports","Government Reports"]}
      features={["Pre-built report library","Payroll register","Tax withholding analysis","Contribution summaries","Year-end summary"]}
      dataDisplayed={["Report type and period","Employee count included","Gross pay total","Total taxes withheld","Net pay total"]}
      userActions={["Select and generate report","Filter by period or employee group","Export to Excel or PDF","Schedule recurring report delivery"]}
    />
  )
}

