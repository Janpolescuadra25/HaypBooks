'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Smart Rules"
      module="AUTOMATION"
      breadcrumb="Automation / Workflow Engine / Smart Rules"
      purpose="Smart Rules are simpler, predefined automation rules that apply conditional logic to specific transaction types without requiring the full Workflow Builder. They handle common scenarios like auto-categorizing transactions based on counterparty, auto-applying tax codes when specific keywords appear, auto-assigning expenses to departments based on supplier, and flagging transactions that exceed thresholds. Smart Rules run silently in the background on every qualifying transaction."
      components={[
        { name: 'Smart Rules List', description: 'Table of all configured smart rules with name, trigger module, condition summary, action, and enabled status toggle.' },
        { name: 'Rule Builder Form', description: 'Create a rule: select module (Banking, Expenses, Sales), define condition (field + operator + value), and select action.' },
        { name: 'Rule Priority Control', description: 'Drag to reorder rules; higher rules apply first when multiple rules match.' },
        { name: 'Rule Hit Statistics', description: 'How many times each rule has fired in the past 30 days.' },
      ]}
      tabs={['All Rules', 'Banking Rules', 'Expense Rules', 'Sales Rules', 'Payroll Rules']}
      features={[
        'Lightweight condition-action rules per module',
        'Auto-categorization and account coding',
        'Auto-tax code assignment',
        'Threshold-based flagging and alerts',
        'Rule priority ordering',
        'Rule hit rate tracking',
        'Enable/disable without deleting',
      ]}
      dataDisplayed={[
        'Rule name, module, condition, and action',
        'Enabled/disabled status',
        'Hit count (last 30 days)',
        'Last triggered date and time',
        'Created by and creation date',
      ]}
      userActions={[
        'Create a new smart rule',
        'Enable or disable a rule',
        'Edit rule conditions or actions',
        'Reorder rule priority',
        'Test a rule against sample data',
        'Delete an obsolete rule',
      ]}
      relatedPages={[
        { label: 'Workflow Builder', href: '/automation/workflow-engine/workflow-builder' },
        { label: 'Bank Feed Matching', href: '/banking-cash/bank-feeds/matching-rules' },
        { label: 'Expense Rules', href: '/expenses/settings/expense-rules' },
      ]}
    />
  )
}

