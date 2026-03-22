'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function SubscriptionPlansPage() {
  return (
    <PageDocumentation
      title="Subscription Plans"
      module="SETTINGS"
      breadcrumb="Settings / Account & Billing / Subscription Plans"
      purpose="Subscription Plans displays the current Haypbooks plan, available upgrade tiers, and billing cycle options. Account owners can compare feature sets across plans, switch between monthly and annual billing, and initiate plan upgrades or downgrades. Transparent pricing and feature comparison help businesses choose the right tier as they scale."
      components={[
        { name: 'Current Plan Banner', description: 'Highlighted card showing active plan name, renewal date, seats used, and storage consumed.' },
        { name: 'Plan Comparison Grid', description: 'Side-by-side feature comparison table for Starter, Growth, and Enterprise plan tiers.' },
        { name: 'Billing Cycle Toggle', description: 'Monthly/Annual toggle that shows discounted pricing when annual billing is selected.' },
        { name: 'Upgrade/Downgrade CTA', description: 'Action buttons on each plan card to initiate a plan change with prorated billing preview.' },
        { name: 'Add-Ons Section', description: 'Optional module add-ons such as extra user seats, additional storage, or premium support.' },
      ]}
      tabs={['Current Plan', 'Available Plans', 'Add-Ons', 'Billing Cycle']}
      features={[
        'View current plan details including seats, modules, and renewal date',
        'Compare all subscription tiers with feature-by-feature breakdown',
        'Toggle between monthly and annual billing to see prorated pricing',
        'Upgrade or downgrade plans with immediate or end-of-cycle effect',
        'Add optional modules or extra user seats a la carte',
        'Preview prorated charges before confirming any plan change',
      ]}
      dataDisplayed={[
        'Current plan name, price, and renewal date',
        'Active user seats vs. plan limit',
        'Available plan tiers with feature sets and pricing',
        'Prorated adjustment amount for mid-cycle changes',
        'Add-on modules and their individual costs',
      ]}
      userActions={[
        'Upgrade to a higher subscription tier',
        'Downgrade plan at end of current billing cycle',
        'Switch between monthly and annual billing',
        'Add extra user seats or storage',
        'Request Enterprise plan quote',
      ]}
    />
  )
}

