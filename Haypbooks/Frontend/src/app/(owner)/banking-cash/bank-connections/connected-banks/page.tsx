'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Connected Banks"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Bank Connections / Connected Banks"
      purpose="View and manage all connected bank accounts and feeds. Monitor connection status, last sync time, and account balances across all linked financial institutions."
      components={[
        { name: "Connection Summary Cards", description: "One card per connected bank showing institution logo, account name, balance, and status" },
        { name: "Connection Health Indicator", description: "Green/amber/red status showing feed health and last sync timestamp" },
        { name: "Re-authorize Button", description: "Trigger OAuth re-authorization for expired bank connections" },
        { name: "Disconnect Controls", description: "Remove a bank connection and stop feed imports" },
      ]}
      tabs={["Connected","Disconnected","Errors"]}
      features={["Multi-bank management","Connection health monitoring","Last sync visibility","OAuth re-authorization","Connection error alerts"]}
      dataDisplayed={["Bank name and account number","Account type (checking/savings)","Current balance","Connection status","Last successful sync datetime"]}
      userActions={["View bank details","Re-authorize connection","Trigger manual sync","Disconnect bank","View sync logs"]}
    />
  )
}

