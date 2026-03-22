'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Employees"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Workforce / Employees"
      purpose="Complete employee directory and profile management. View and manage personal information, job details, compensation, direct reports, and employment history for all staff."
      components={[
        { name: "Employee Directory", description: "Searchable list of all employees with photo, name, title, and department" },
        { name: "Employee Profile", description: "Detailed record: personal info, job info, compensation, and emergency contacts" },
        { name: "Employment History", description: "Timeline of all position changes, promotions, and compensation adjustments" },
        { name: "Org Chart Integration", description: "Visual org chart position for the selected employee" },
        { name: "Quick Actions", description: "Shortcuts for common HR tasks: add leave, create payroll adjustment, attach document" },
      ]}
      tabs={["Directory","Active","Inactive","New Hires"]}
      features={["Complete employee profiles","Employment history timeline","Org chart integration","Quick HR task access","Custom fields"]}
      dataDisplayed={["Employee name and ID","Job title and department","Hire date","Compensation","Manager and direct reports"]}
      userActions={["Add new employee","Edit employee details","Record promotion or change","View employment history","Terminate employee"]}
    />
  )
}

