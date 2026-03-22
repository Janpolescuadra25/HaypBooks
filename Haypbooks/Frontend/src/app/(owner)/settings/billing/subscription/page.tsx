'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Subscription"
      module="SETTINGS"
      breadcrumb="Settings / Billing / Subscription"
      purpose="The Subscription page shows the company's current Haypbooks subscription plan — plan name, features included, active users, user limit, module access, next billing date, and plan cost. From here, users can upgrade or downgrade their plan, add or remove user seats, and manage the subscription payment method. The plan details directly determine which modules and features are accessible in the system — upgrading unlocks additional modules."
      components={[
        { name: 'Current Plan Card', description: 'Plan name (Starter/Professional/Enterprise), price, features included, user seats used/available, and renewal date.' },
        { name: 'Plan Comparison', description: 'Side-by-side comparison of available plans to help with upgrade decisions.' },
        { name: 'Usage Summary', description: 'Current usage vs. plan limits: users, transactions per month, storage, entities.' },
        { name: 'Upgrade/Downgrade Controls', description: 'Select a new plan, effective date, and confirm changes.' },
        { name: 'User Seat Management', description: 'Add or remove user seats (impacts billing).' },
      ]}
      tabs={['Current Plan', 'Usage', 'Compare Plans', 'Manage Seats']}
      features={[
        'Subscription plan visibility and management',
        'Plan upgrade and downgrade capability',
        'User seat add/remove',
        'Usage vs. plan limit monitoring',
        'Module access tied to plan',
        'Annual vs. monthly billing option',
      ]}
      dataDisplayed={[
        'Current plan and features',
        'User seat usage',
        'Next billing date and amount',
        'Usage metrics vs. plan limits',
        'Plan feature comparison',
      ]}
      userActions={[
        'View current plan details',
        'Upgrade plan',
        'Add user seats',
        'Compare available plans',
        'View usage vs. plan limits',
        'Switch billing frequency (monthly/annual)',
      ]}
      relatedPages={[
        { label: 'Billing History', href: '/settings/billing/billing-history' },
        { label: 'User Management', href: '/settings/users/user-management' },
      ]}
    />
  )
}

