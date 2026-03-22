'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Feed Status"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Bank Feeds / Feed Status"
      purpose="Real-time status dashboard for all active bank feeds. Monitor last sync timestamp, record counts, feed provider health, and any active issues requiring attention."
      components={[
        { name: "Status Dashboard", description: "Color-coded health overview for all bank feeds" },
        { name: "Feed Health Cards", description: "Per-feed card showing institution, account, last sync, and status" },
        { name: "Issue Tracker", description: "Active errors or warnings with recommended resolution steps" },
        { name: "Historical Uptime", description: "Uptime chart per feed showing reliability over the past 30 days" },
      ]}
      tabs={["Overview","Issues","History"]}
      features={["Real-time health status","Per-feed uptime tracking","Issue recommendation engine","30-day history chart","Email alerts on feed failure"]}
      dataDisplayed={["Feed name and bank institution","Last successful sync timestamp","Records imported this period","Active issue description","Feed provider status"]}
      userActions={["View feed health details","Trigger manual sync","View resolution steps for issues","Configure alert settings"]}
    />
  )
}

