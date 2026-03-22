'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payroll History"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Processing / Payroll History"
      purpose="Complete archive of all payroll runs. Access historical payroll summaries, individual payslips, tax summaries, and GL postings for any past pay period."
      components={[
        { name: "Run Archive List", description: "All completed payroll runs with period, gross pay, and headcount" },
        { name: "Run Detail View", description: "Full payroll run breakdown: earnings, deductions, taxes, and net pay" },
        { name: "Employee Payslip Access", description: "View or download the payslip for any employee for any period" },
        { name: "Repost Controls", description: "Repost GL entries for a historical run if corrections were made" },
        { name: "Export Controls", description: "Download payroll data as Excel or PDF for audit" },
      ]}
      tabs={["Run Archive","By Employee","Tax Summary","GL Entries"]}
      features={["Full payroll history archive","Per-employee payslip access","GL entry re-posting","Audit export","Filter by period and employee"]}
      dataDisplayed={["Run period and date paid","Total gross and net pay","Employee count included","Tax withheld total","GL post status"]}
      userActions={["View payroll run details","Access employee payslip","Download run report","Repost GL entries","Export to Excel"]}
    />
  )
}

