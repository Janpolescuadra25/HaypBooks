'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Compliance Alerts"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Tax Calendar / Compliance Alerts"
      badge="PH ONLY"
      purpose="Proactive compliance alerts for upcoming and overdue Philippine tax filing deadlines. Configure notification preferences to receive reminders for BIR, SSS, PhilHealth, Pag-IBIG, and LGU obligations."
      components={[
        { name: "Alert Dashboard", description: "Color-coded upcoming and overdue compliance obligations" },
        { name: "Alert Configuration", description: "Set how many days before deadline to trigger email and in-app alerts" },
        { name: "Obligation Library", description: "Full list of periodic tax obligations with their deadlines" },
        { name: "Alert History", description: "Log of all alerts triggered and whether they were acted on" },
        { name: "Escalation Rules", description: "Notify additional users when obligations remain unaddressed close to deadline" },
      ]}
      tabs={["Active Alerts","Overdue","Upcoming (30 days)","History","Configuration"]}
      features={["Multi-agency deadline monitoring","Configurable advance notice","Email and in-app notifications","Escalation on inaction","Obligation library"]}
      dataDisplayed={["Obligation name and agency","Deadline date","Days until deadline","Alert status","Responsible person"]}
      userActions={["View compliance alerts","Configure notification timing","Mark obligation as complete","Escalate alert","View alert history"]}
    />
  )
}

