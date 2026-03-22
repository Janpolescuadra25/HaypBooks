'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Remittance Tracking"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Taxes / Remittance Tracking"
      purpose="Track the status of all payroll tax and government contribution remittances. Monitor due dates, record payments, and confirm receipt by the relevant government agencies."
      components={[
        { name: "Remittance Calendar", description: "All upcoming and overdue remittance deadlines by agency" },
        { name: "Remittance Register", description: "All past remittances with agency, amount, and status" },
        { name: "Record Payment Form", description: "Log a remittance payment with confirmation number and receipt" },
        { name: "Overdue Alerts", description: "Color-coded alerts for remittances past their due date" },
        { name: "Agency Portal Links", description: "Quick links to government agency online portals for filing" },
      ]}
      tabs={["Upcoming","Overdue","Paid","All Remittances"]}
      features={["Due date monitoring","Payment recording","Penalty calculation for late remittances","Agency portal links","Remittance history"]}
      dataDisplayed={["Agency and remittance type","Amount due","Due date","Payment date and confirmation","Status (pending/paid/late)"]}
      userActions={["View remittance calendar","Record payment","Mark as filed","View overdue items","Export remittance report"]}
    />
  )
}

