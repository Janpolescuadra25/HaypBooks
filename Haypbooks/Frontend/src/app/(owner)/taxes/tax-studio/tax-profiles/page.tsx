'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxProfilesPage() {
  return (
    <PageDocumentation
      title="Tax Profiles"
      module="TAXES"
      badge="ENT"
      breadcrumb="Taxes / Tax Studio / Tax Profiles"
      purpose="Tax Profiles are named bundles of tax settings — combining rules, codes, rates, and exemptions — that can be assigned to customers, vendors, or product lines to simplify tax determination at transaction time. Instead of evaluating complex rules for every transaction, assigning a tax profile to a customer ensures that the correct pre-configured tax treatment is automatically applied. This is especially useful for managing different tax obligations across customer segments or international accounts."
      components={[
        { name: 'Profile Directory', description: 'List of all defined tax profiles with name, description, country, and assigned entity count.' },
        { name: 'Profile Builder', description: 'Form to create a profile by selecting applicable tax codes, rates, exemptions, and special rules.' },
        { name: 'Entity Assignment Panel', description: 'Interface to assign a profile to one or many customers, vendors, or product categories.' },
        { name: 'Profile Preview', description: 'Summary of all tax rules and codes that will be applied when this profile is active on a transaction.' },
        { name: 'Override Rules', description: "Configuration for when a transaction-level override should supersede the profile's default settings." },
      ]}
      tabs={['Profile Directory', 'Profile Builder', 'Entity Assignments', 'Override Settings']}
      features={[
        'Create named tax profiles bundling applicable codes, rates, and rules',
        'Assign profiles to customers, vendors, or products',
        'Preview all tax treatments active within a profile',
        'Configure transaction-level override policies',
        'Simplify complex tax determination with reusable profile assignment',
        'Track which entities use each profile for impact analysis before changes',
      ]}
      dataDisplayed={[
        'Profile name and description',
        'Included tax codes and rates',
        'Applied exemptions and special rules',
        'Number of customers/vendors using the profile',
        'Last modified date',
      ]}
      userActions={[
        'Create a new tax profile',
        'Add tax codes, rates, and rules to profile',
        'Assign profile to customers or vendors',
        'Preview profile tax treatment',
        'Edit or clone an existing profile',
      ]}
    />
  )
}

