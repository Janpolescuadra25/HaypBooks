'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function ExemptionsRulesPage() {
  return (
    <PageDocumentation
      title="Exemptions & Rules"
      module="TAXES"
      breadcrumb="Taxes / Tax Setup / Exemptions & Rules"
      purpose="Exemptions & Rules defines the logic governing when transactions are exempt from tax or subject to special rates, based on transaction characteristics, customer types, product categories, or geographic rules. This module allows the tax team to encode complex tax exemption logic without developer involvement, ensuring that exemption conditions are automatically evaluated during transaction entry. Proper setup reduces manual tax overrides and supports consistent, defensible tax treatment."
      components={[
        { name: 'Exemption Rules List', description: 'Table of all defined exemption rules with name, trigger condition, tax impact, and active status.' },
        { name: 'Rule Builder', description: 'Visual rule editor to define conditions (IF customer type = Non-Profit, THEN exempt VAT) without code.' },
        { name: 'Product/Service Category Mapping', description: 'Map product or service categories to exemption rules for automatic application.' },
        { name: 'Customer Exemption Certificates', description: 'Upload and link tax exemption certificates from customers to their account record.' },
        { name: 'Rule Test Console', description: 'Test a rule against sample transaction data to confirm expected exemption outcome before activating.' },
      ]}
      tabs={['Rule List', 'Rule Builder', 'Category Mapping', 'Customer Certificates', 'Test Console']}
      features={[
        'Define conditional tax exemption rules with a visual rule builder',
        'Map product/service categories to exemption logic',
        'Store and link customer exemption certificates',
        'Test rules before activating to prevent unintended effects',
        'Prioritize rules when multiple exemptions apply to one transaction',
        'Audit which rule was applied to each exempt transaction',
      ]}
      dataDisplayed={[
        'Exemption rule name and description',
        'Trigger conditions and resulting tax treatment',
        'Product/category and customer type mappings',
        'Certificate number and expiry date',
        'Active/inactive rule status',
      ]}
      userActions={[
        'Create a new exemption rule via rule builder',
        'Map product categories to exemption rules',
        'Upload customer exemption certificate',
        'Test a rule against sample data',
        'Activate or deactivate exemption rules',
      ]}
    />
  )
}

