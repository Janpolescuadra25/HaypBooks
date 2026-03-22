'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Workflow Builder"
      module="AUTOMATION"
      breadcrumb="Automation / Workflow Engine / Workflow Builder"
      purpose="The Workflow Builder is a no-code visual automation designer that allows users to create multi-step business process workflows triggered by events in the system. Users define triggers (e.g., 'Invoice Created'), conditions (e.g., 'Amount > 10,000'), and actions (e.g., 'Assign for Approval', 'Send Email', 'Create Task'). Complex workflows with branching logic, parallel steps, and time-based triggers can all be built without writing code."
      components={[
        { name: 'Workflow Canvas', description: 'Drag-and-drop visual canvas where users place and connect trigger, condition, and action nodes to build workflows.' },
        { name: 'Node Library', description: 'Panel listing all available trigger types, condition operators, and action types organized by category.' },
        { name: 'Node Configuration Panel', description: 'Click any node to configure its properties: field mappings, conditions, recipient selection, delay settings.' },
        { name: 'Workflow List', description: 'Table of all existing workflows with name, trigger, status (active/inactive), last run, and run count.' },
        { name: 'Test Run Panel', description: 'Test a workflow against sample data before activating it to verify branching logic.' },
        { name: 'Version History', description: 'Each workflow saves version history; revert to any previous version.' },
      ]}
      tabs={['My Workflows', 'Templates', 'Workflow Builder Canvas', 'Run History']}
      features={[
        'Visual no-code drag-and-drop workflow canvas',
        'Event triggers from any module (invoice, bill, payment, employee, etc.)',
        'Conditional branching with AND/OR logic',
        'Action types: create task, send email, send notification, create record, update field, trigger approval',
        'Time delays and schedule-based triggers',
        'Parallel branches for concurrent actions',
        'Workflow versioning and rollback',
        'Pre-built workflow templates for common scenarios',
      ]}
      dataDisplayed={[
        'All workflows with status, trigger type, last run',
        'Workflow run history with success/failure count',
        'Node execution trace for debugging',
        'Workflow trigger event statistics',
      ]}
      userActions={[
        'Create a new workflow from scratch',
        'Use a pre-built workflow template',
        'Drag and connect trigger/condition/action nodes',
        'Configure each node with specific logic',
        'Test workflow with sample event data',
        'Activate or deactivate a workflow',
        'Duplicate a workflow to modify',
        'Review and revert to previous workflow version',
      ]}
      relatedPages={[
        { label: 'Smart Rules', href: '/automation/workflow-engine/smart-rules' },
        { label: 'Email Notifications', href: '/automation/workflow-engine/email-notifications' },
        { label: 'Approval Chains', href: '/automation/approvals-governance/approval-chains' },
        { label: 'Automation Logs', href: '/automation/monitoring/automation-logs' },
      ]}
    />
  )
}

