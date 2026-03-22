'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Expense Policy"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Settings / Expense Policy"
      purpose="Expense Policy configures the rules that govern employee expense submissions — per-diem rates, per-meal limits, receipt requirement thresholds, allowable expense categories, approval escalation thresholds, and out-of-policy expense handling. Policies can be set company-wide or differentiated by employee grade/band. When employees submit expenses, the system automatically checks against the policy and flags violations for the approver's attention."
      components={[
        { name: 'Policy Rules Table', description: 'All configured policy rules with category, limit, condition, and consequence (flag/reject/auto-approve).' },
        { name: 'Per-Diem Rates', description: 'Daily allowance rates by travel destination (local, international, identified cities) for meals, accommodation, and incidentals.' },
        { name: 'Approval Thresholds', description: 'Auto-approve for amounts below threshold; manager approval required above; CFO approval for amounts above upper threshold.' },
        { name: 'Category Restrictions', description: 'Mark specific expense categories as disallowed or requiring special justification (e.g., gifts, entertainment).' },
        { name: 'Policy Employee Groups', description: 'Apply different policy levels to different employee groups (Executive, Management, Staff, Field).' },
      ]}
      tabs={['Policy Rules', 'Per-Diem Rates', 'Approval Thresholds', 'Category Rules', 'Employee Groups']}
      features={[
        'Configurable expense policy rules by category and amount',
        'Per-diem rate tables by destination',
        'Amount-based auto-approval thresholds',
        'Employee group differentiated policies',
        'Automatic policy flag on expense submission',
        'Receipt requirement threshold configuration',
        'Policy version history',
      ]}
      dataDisplayed={[
        'All policy rules with category and limit',
        'Per-diem rates by destination',
        'Approval threshold amounts',
        'Policy groups and applicable employees',
        'Policy violation statistics from last period',
      ]}
      userActions={[
        'Add a new policy rule',
        'Set per-diem rates for destinations',
        'Configure approval thresholds',
        'Create employee policy groups',
        'Publish policy update to all employees',
        'Export policy document PDF',
      ]}
      relatedPages={[
        { label: 'My Expenses', href: '/expenses/expense-reports/my-expenses' },
        { label: 'Expense Approval', href: '/expenses/expense-reports/expense-approval' },
        { label: 'Policy Management', href: '/compliance/controls/policy-management' },
      ]}
    />
  )
}

