'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Filing Deadlines"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Tax Calendar / Filing Deadlines"
      badge="PH ONLY"
      purpose="Comprehensive calendar of all BIR, SSS, PhilHealth, Pag-IBIG, and LGU filing and payment deadlines. View by month, quarter, or year to plan your compliance activities."
      components={[
        { name: "Deadline Calendar", description: "Month-view calendar with all tax and compliance deadlines marked" },
        { name: "Deadline List View", description: "Table view of all deadlines sortable by date or agency" },
        { name: "Custom Obligation Manager", description: "Add company-specific obligations not in the standard calendar" },
        { name: "Status Tracking", description: "Mark each deadline as pending, completed, or N/A" },
        { name: "Export Calendar", description: "Download deadline calendar as Excel or sync to Google Calendar / Outlook" },
      ]}
      tabs={["Calendar","List View","Custom Obligations","Completed"]}
      features={["Full PH compliance calendar","BIR, SSS, PhilHealth, Pag-IBIG, LGU coverage","Status tracking per obligation","Custom obligation support","Calendar export/sync"]}
      dataDisplayed={["Obligation name and type","Filing agency","Deadline date","Filing period covered","Completion status"]}
      userActions={["View calendar","Add custom obligation","Mark as completed","Export calendar","View by period"]}
    />
  )
}

