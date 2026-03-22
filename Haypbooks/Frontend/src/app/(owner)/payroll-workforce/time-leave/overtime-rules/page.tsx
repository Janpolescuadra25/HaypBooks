'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Overtime Rules"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Time & Leave / Overtime Rules"
      badge="PH ONLY"
      purpose="Configure overtime pay rules including rate multipliers, daily and weekly thresholds, and special pay for rest day, holiday, and night shift work. Rules automatically apply during payroll computation."
      components={[
        { name: "Overtime Rule List", description: "All defined overtime rules with type, threshold, and pay multiplier" },
        { name: "Create Rule Form", description: "Define rule: trigger hours, days, and overtime rate multiplier" },
        { name: "Threshold Settings", description: "Daily and weekly hour thresholds before overtime kicks in" },
        { name: "Holiday/Rest Day Rules", description: "Separate rules for work on rest days, regular holidays, and special days" },
        { name: "Night Shift Differential", description: "Configure percentage premium for work during night shift hours" },
      ]}
      tabs={["Rules","Holiday Rules","Night Differential","Test Calculator"]}
      features={["Multiple overtime rule types","Daily and weekly thresholds","Holiday and rest-day rules","Night shift differential","Payroll auto-application"]}
      dataDisplayed={["Rule name and type","Hour threshold","Pay multiplier","Applicable employee groups","Effective date"]}
      userActions={["Create overtime rule","Set rate multiplier","Define night shift hours","Assign to employee group","Test rule on sample employee"]}
    />
  )
}

