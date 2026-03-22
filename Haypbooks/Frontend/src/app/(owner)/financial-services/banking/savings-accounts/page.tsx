'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Savings Accounts"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Banking / Savings Accounts"
      badge="FS"
      purpose="High-yield business savings accounts integrated with Haypbooks. Earn competitive interest on idle cash reserves while keeping funds synced with your accounting records automatically."
      components={[
        { name: "Savings Account Cards", description: "Each savings account with balance, APY, and interest earned" },
        { name: "Transfer Form", description: "Move funds between checking and savings accounts" },
        { name: "Interest History", description: "Month-by-month interest earned with GL entry details" },
        { name: "Goal Tracker", description: "Optional savings goals (e.g. tax reserve) with progress bars" },
      ]}
      tabs={["Accounts","Interest History","Transfers","Goals"]}
      features={["High-yield APY","Automatic interest GL entries","Savings goals","FDIC insured","Instant transfers to checking"]}
      dataDisplayed={["Account balance and available funds","Annual percentage yield (APY)","Interest earned MTD and YTD","Transfer history","Goal progress"]}
      userActions={["View balance and interest","Transfer to checking","Set savings goal","View interest history","Download statement"]}
    />
  )
}

