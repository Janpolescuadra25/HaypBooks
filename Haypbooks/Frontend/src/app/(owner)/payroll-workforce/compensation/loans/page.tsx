'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Employee Loans"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Compensation / Loans"
      purpose="Manage employee loans and salary advances. Create loan agreements, track outstanding balances, schedule repayment deductions from payroll, and generate employee loan statements."
      components={[
        { name: "Loan Register", description: "All active employee loans with balance, rate, and status" },
        { name: "Create Loan Form", description: "Enter employee, loan amount, interest rate, and repayment schedule" },
        { name: "Repayment Schedule", description: "Per-period deduction amounts until full repayment" },
        { name: "Payroll Deduction Integration", description: "Automatic repayment deduction in each payslip" },
        { name: "Loan Statement", description: "Employee-facing loan balance and payment history statement" },
      ]}
      tabs={["Active Loans","Paid Off","Deduction Schedule"]}
      features={["Employee loan and salary advance","Flexible repayment schedules","Payroll deduction automation","Interest or interest-free options","Loan statements"]}
      dataDisplayed={["Employee name","Loan amount and date","Outstanding balance","Monthly deduction amount","Expected payoff date"]}
      userActions={["Create employee loan","Set repayment schedule","View deduction history","Generate loan statement","Close paid loan"]}
    />
  )
}

