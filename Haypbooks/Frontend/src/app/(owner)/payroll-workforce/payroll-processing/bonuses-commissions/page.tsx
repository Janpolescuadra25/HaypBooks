'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bonuses & Commissions"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll Processing / Bonuses & Commissions"
      purpose="Calculate, manage, and pay employee bonuses and sales commissions. Configure bonus rules, track commission earnings, and include bonus payments in payroll runs or as standalone off-cycle payments."
      components={[
        { name: "Bonus Types Setup", description: "Define bonus types (performance, signing, project, annual) with calculation rules" },
        { name: "Commission Plans", description: "Configure commission rate structures by product tier or quota achievement" },
        { name: "Earnings Tracker", description: "Accrued but unpaid bonuses and commissions per employee" },
        { name: "Payment Queue", description: "Approved bonuses and commissions ready for inclusion in payroll" },
        { name: "Withholding Calculator", description: "Tax calculation for bonus payments using supplemental rate" },
      ]}
      tabs={["Bonus Types","Commission Plans","Earnings","Payment Queue"]}
      features={["Bonus and commission plan configuration","Quota-based commission tiers","Accrual tracking","Supplemental tax rate","Payroll integration"]}
      dataDisplayed={["Employee name and plan type","Earned amount and period","Payment status","Tax withheld","Year-to-date total"]}
      userActions={["Create bonus payment","Set commission plan","Track earned commissions","Approve for payment","Include in payroll run"]}
    />
  )
}

