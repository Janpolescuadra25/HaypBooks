'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Scheduled Reports"
      module="AUTOMATION"
      breadcrumb="Automation / Scheduling / Scheduled Reports"
      purpose="Configure automated report delivery on a recurring schedule. Select any report, set delivery frequency, choose recipients, and pick output format (PDF, Excel, CSV)."
      components={[
        { name: "Schedule List", description: "All configured report schedules with report name, frequency, and next delivery" },
        { name: "Create Schedule Form", description: "Select report, set parameters, pick recipients and output format" },
        { name: "Delivery History", description: "Log of all report deliveries with status and recipient list" },
        { name: "Report Preview", description: "Preview how the report will look before saving the schedule" },
        { name: "Recipient Manager", description: "Add, remove, and manage email recipients for each schedule" },
      ]}
      tabs={["Active Schedules","Paused","History"]}
      features={["Any built-in report can be scheduled","Daily/weekly/monthly/custom frequency","Multi-recipient delivery","PDF, Excel, and CSV output","Parameterized reports with dynamic dates"]}
      dataDisplayed={["Scheduled report name","Report type and parameters","Delivery frequency and time","Recipient email list","Last delivery status"]}
      userActions={["Create report schedule","Edit recipients","Change output format","Pause or delete schedule","View delivery history"]}
    />
  )
}

