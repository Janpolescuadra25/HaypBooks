'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Benefit Plans"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Compensation / Benefit Plans"
      purpose="Manage employee benefit plans including health insurance, dental, vision, and retirement contributions. Configure employer and employee contributions and integrate with payroll deductions."
      components={[
        { name: "Plan Library", description: "All benefit plans with type, carrier, and enrollment counts" },
        { name: "Plan Detail Setup", description: "Define plan: type, carrier, premium amounts, employer/employee split" },
        { name: "Employee Enrollment", description: "Enroll employees in plans during onboarding or open enrollment" },
        { name: "Deduction Integration", description: "Automatic payroll deduction creation when employee enrolls" },
        { name: "Benefits Cost Report", description: "Total employer cost per plan per period" },
      ]}
      tabs={["Plans","Enrollment","Deductions","Cost Reports"]}
      features={["Multi-plan management","Employer/employee cost split","Open enrollment workflow","Payroll deduction auto-creation","Benefits cost reporting"]}
      dataDisplayed={["Plan name and type","Monthly premium","Employer and employee share","Enrolled employee count","Total employer cost per period"]}
      userActions={["Create benefit plan","Set contribution amounts","Enroll employee","Update plan details","View enrollment stats"]}
    />
  )
}

