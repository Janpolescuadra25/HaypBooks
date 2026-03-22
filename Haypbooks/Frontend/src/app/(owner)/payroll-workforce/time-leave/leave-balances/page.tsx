'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Leave Balances"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Time & Leave / Leave Balances"
      purpose="View and manage employee leave balances across all leave types. Track earned, used, and remaining balances, configure accrual rules, and handle year-end carry-forward or forfeiture."
      components={[
        { name: "Balance Summary Table", description: "All employees with leave balance by type (vacation, sick, etc.)" },
        { name: "Employee Leave Card", description: "Full leave history for one employee by leave type" },
        { name: "Accrual Rules", description: "Configure how each leave type is earned (monthly, annual, on-hire)" },
        { name: "Carry-Forward Settings", description: "Define maximum carry-over per leave type at year-end" },
        { name: "Manual Adjustment", description: "Add or deduct leave balance with reason and approver" },
      ]}
      tabs={["All Employees","By Leave Type","Accrual Settings","Year-End"]}
      features={["Multi-leave-type tracking","Accrual rule engine","Carry-forward configuration","Manual override with audit trail","Self-service balance visibility"]}
      dataDisplayed={["Employee name","Leave type","Earned balance","Used balance","Remaining balance"]}
      userActions={["View employee leave balances","Configure accrual rules","Adjust balance manually","Set carry-forward rules","Export leave balances"]}
    />
  )
}

