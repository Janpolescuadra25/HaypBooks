'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Dunning Management'
      module='SALES'
      breadcrumb='Sales / Collections / Dunning Management'
      purpose='Automates the process of sending sequenced payment reminder communications to customers with overdue invoices. Configurable dunning schedules allow escalating message tone and urgency, reducing reliance on manual follow-up and improving collection rates.'
      components={[
        { name: 'Dunning Sequence Builder', description: 'Create multi-step email sequences with timing, message tone, and escalation logic' },
        { name: 'Template Library', description: 'Pre-built and custom email templates for each stage of the dunning sequence' },
        { name: 'Customer Dunning Status Board', description: 'Shows where each customer is in their dunning sequence with next step date' },
        { name: 'Delivery Dashboard', description: 'Tracks sent, opened, clicked, and responded dunning communications' },
        { name: 'Pause and Exemption Controls', description: 'Pause dunning for customers in dispute, payment plan, or VIP status' },
      ]}
      tabs={['Dunning Sequences', 'Customer Status', 'Delivery Tracking', 'Templates']}
      features={['Multi-step configurable dunning sequences', 'Escalating tone and urgency per step', 'Email open and response tracking', 'Pause dunning for disputed or exempt accounts', 'Integration with payment portal link in emails', 'Automatic sequence progression', 'Bad debt escalation trigger']}
      dataDisplayed={['Customer name and overdue amount', 'Days overdue', 'Active dunning sequence and current step', 'Last communication sent date', 'Email delivery and open status', 'Number of dunning steps remaining', 'Accounts escalated to collections agency']}
      userActions={['Create dunning sequence', 'Assign sequence to customer segment', 'Send dunning email', 'Pause dunning for customer', 'Mark account as paid and exit sequence', 'Escalate to collections agency', 'View delivery tracking']}
      relatedPages={[
        { label: 'AR Aging', href: '/sales/collections/ar-aging' },
        { label: 'AR Aging Alerts', href: '/sales/collections/ar-aging-alerts' },
        { label: 'Customer Statements', href: '/sales/billing/customer-statements' },
      ]}
    />
  )
}

