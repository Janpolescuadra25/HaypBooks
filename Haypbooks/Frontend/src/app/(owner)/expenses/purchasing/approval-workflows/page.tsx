'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Approval Workflows"
      module="EXPENSES"
      breadcrumb="Expenses / Purchasing / Approval Workflows"
      purpose="Configure multi-level purchase approval workflows. Define who must approve purchase requests and orders based on amount thresholds, expense categories, and department hierarchies."
      components={[
        { name: "Workflow Builder", description: "Visual designer to create approval workflow steps and conditions" },
        { name: "Approver Assignment", description: "Assign approvers by role, department, and amount threshold" },
        { name: "Escalation Rules", description: "Automatic escalation when approver does not respond within SLA" },
        { name: "Workflow Status Board", description: "Live view of all items in various workflow stages" },
        { name: "Delegation Setup", description: "Configure out-of-office approval delegation rules" },
      ]}
      tabs={["Workflows","Pending Items","Escalations","History"]}
      features={["Visual workflow builder","Multi-level sequential approval","Amount-based routing","Escalation on SLA breach","Delegation management"]}
      dataDisplayed={["Workflow name and trigger type","Approval levels and approvers","Amount thresholds","SLA hours per level","Active workflows count"]}
      userActions={["Create approval workflow","Define approval levels","Set escalation rules","Test workflow","View pending approvals"]}
    />
  )
}

