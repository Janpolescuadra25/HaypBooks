'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Subscription Billing'
      module='SALES'
      breadcrumb='Sales / Revenue Management / Subscription Billing'
      purpose='Manages recurring subscription billing for software, services, and membership products. Automates invoice generation at configurable billing intervals, handles upgrades, downgrades, and cancellations, and integrates with revenue recognition for proper accounting of subscription revenue.'
      components={[
        { name: 'Subscription Catalog', description: 'List of all active subscriptions with customer, plan, billing cycle, and status' },
        { name: 'Recurring Invoice Engine', description: 'Automated invoice generation at configured billing intervals' },
        { name: 'Subscription Lifecycle Manager', description: 'Handles subscription creation, trial, upgrade, downgrade, pause, and cancellation' },
        { name: 'Proration Calculator', description: 'Calculates pro-rated amounts for mid-cycle plan changes or cancellations' },
        { name: 'Renewal Automation', description: 'Auto-renews subscriptions and sends renewal notices at configurable lead times' },
      ]}
      tabs={['Active Subscriptions', 'Billing Schedule', 'Lifecycle Events', 'Revenue Recognition']}
      features={['Automated recurring invoice generation', 'Flexible billing intervals: monthly, quarterly, annually', 'Mid-cycle proration calculations', 'Trial period and grace period management', 'Automatic renewal and cancellation processing', 'Integration with deferred revenue recognition', 'Subscription MRR and ARR metrics']}
      dataDisplayed={['Customer name and subscription plan', 'Subscription start and renewal date', 'Monthly recurring revenue (MRR) per customer', 'Billing cycle and next invoice date', 'Subscription status (active, trial, paused, cancelled)', 'Proration adjustments', 'Churn rate and renewal rate']}
      userActions={['Create new subscription', 'Upgrade or downgrade plan', 'Pause or cancel subscription', 'Generate recurring invoice', 'Handle proration on changes', 'Process renewal', 'Export subscription report']}
      relatedPages={[
        { label: 'Deferred Revenue', href: '/sales/revenue-management/deferred-revenue' },
        { label: 'Contract Revenue', href: '/sales/revenue-management/contract-revenue' },
        { label: 'Revenue Recognition', href: '/sales/revenue-management/revenue-recognition' },
      ]}
    />
  )
}

