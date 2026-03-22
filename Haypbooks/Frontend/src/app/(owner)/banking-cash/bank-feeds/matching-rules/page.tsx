'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Matching Rules"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Bank Feeds / Matching Rules"
      purpose="Matching Rules are automated rules that pre-code imported bank transactions before reconciliation — eliminating manual transaction categorization. Each rule defines conditions (transaction description contains 'X', amount equals 'Y', bank account is 'Z') and actions (code to GL account, match to supplier, apply to customer). When a new bank transaction matches a rule, it is automatically coded, dramatically reducing reconciliation time for recurring transactions like rent, utilities, and payroll."
      components={[
        { name: 'Rules List', description: 'All matching rules with name, conditions summary, action (code to account/match to contact), priority, and active status.' },
        { name: 'Rule Builder', description: 'Create a new rule: define conditions (description contains/equals/starts with, amount range, account), set the coding action, and set priority.' },
        { name: 'Rule Priority Manager', description: 'Drag-and-drop to set the order of rules — higher priority rules apply first when multiple rules match.' },
        { name: 'Match Performance', description: 'Stats showing auto-rule match rate: % of imported transactions auto-coded vs. requiring manual coding.' },
        { name: 'Rule Test', description: 'Test a rule against recent transactions to see if it would match as expected before activating.' },
      ]}
      tabs={['All Rules', 'Create Rule', 'Priority', 'Performance']}
      features={[
        'Flexible rule conditions: description text, amount range, account',
        'Multiple condition combinators (AND/OR)',
        'Rule priority management for conflict resolution',
        'Rule testing against historical transactions',
        'Auto-match rate reporting',
        'Rules apply on import and during reconciliation',
        'System-learned rules from manual reconciliation patterns',
      ]}
      dataDisplayed={[
        'All rules with conditions and action',
        'Rule match count (how many transactions matched this rule)',
        'Auto-match rate for all imported transactions',
        'Rule priority order',
        'Recently matched transactions per rule',
      ]}
      userActions={[
        'Create a new matching rule',
        'Test a rule against recent transactions',
        'Change rule priority',
        'Activate or deactivate a rule',
        'Edit rule conditions',
        'View transactions matched by a rule',
        'Delete an obsolete rule',
      ]}
      relatedPages={[
        { label: 'Feed Connections', href: '/banking-cash/bank-feeds/feed-connections' },
        { label: 'Bank Transactions', href: '/banking-cash/transactions/bank-transactions' },
        { label: 'Reconcile', href: '/banking-cash/reconciliation/reconcile' },
        { label: 'Smart Rules', href: '/automation/workflow-engine/smart-rules' },
      ]}
    />
  )
}

