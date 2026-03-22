'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Shift Scheduling"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Time & Leave / Shift Scheduling"
      purpose="Plan and manage employee work schedules and shift assignments. Create shift templates, assign employees to shifts, handle shift swaps, and ensure schedule coverage meets operational needs."
      components={[
        { name: "Schedule Calendar", description: "Weekly calendar view of all shifts and employee assignments" },
        { name: "Shift Template Library", description: "Reusable shift templates (Morning 8–5, Night 9pm–6am, etc.)" },
        { name: "Assignment Manager", description: "Assign employees to shift templates with drag-and-drop interface" },
        { name: "Coverage Report", description: "Identify understaffed or overstaffed shifts" },
        { name: "Swap Request Handling", description: "Employee shift swap requests with manager approval" },
      ]}
      tabs={["Calendar","Templates","Assignments","Coverage","Swaps"]}
      features={["Visual schedule calendar","Reusable shift templates","Drag-and-drop assignment","Coverage gap detection","Shift swap workflow"]}
      dataDisplayed={["Employee names per shift","Shift hours and days","Coverage status per shift","Swap request status","Week and monthly view"]}
      userActions={["Create shift template","Assign employee to shift","Approve shift swap","View coverage gaps","Publish schedule"]}
    />
  )
}

