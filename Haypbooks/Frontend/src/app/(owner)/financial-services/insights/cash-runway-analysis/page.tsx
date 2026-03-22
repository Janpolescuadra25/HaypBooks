'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cash Runway Analysis"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Insights / Cash Runway Analysis"
      purpose="AI-powered analysis of how long your current cash position will sustain operations at the current burn rate. Scenario model different cost reduction and revenue strategies."
      components={[
        { name: "Runway Clock", description: "Prominent display of current runway in months at current burn rate" },
        { name: "Burn Rate Chart", description: "Monthly cash burn trend with rolling 3-month average" },
        { name: "Scenario Simulator", description: "Model the runway impact of cost cuts or revenue increases" },
        { name: "Component Analysis", description: "Breakdown of burn by major expense category" },
        { name: "Alert Settings", description: "Configure notifications when runway falls below threshold months" },
      ]}
      tabs={["Overview","Burn Rate","Scenarios","Alerts"]}
      features={["Real-time runway calculation","Burn rate trending","Scenario modeling","Alert on low runway","PDF report for investors"]}
      dataDisplayed={["Current cash balance","Monthly burn rate","Runway in months","Primary burn components","Month by month projection"]}
      userActions={["View runway clock","Model cost reduction scenario","Set runway alert","Share with investors","Export report"]}
    />
  )
}

