'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Allocation Rules"
      module="ACCOUNTING"
      breadcrumb="Accounting / Allocations / Allocation Rules"
      purpose="Allocation Rules define how shared costs and overhead amounts are automatically distributed across departments, cost centers, projects, or business units. Rules specify the source account(s), the allocation method (fixed percentage, headcount-based, revenue-based, area-based), and the target distribution pools. Common uses: allocate rent across departments by office area, allocate IT costs by headcount, allocate shared service costs by revenue contribution."
      components={[
        { name: 'Rule List', description: 'All configured allocation rules with name, source accounts, method, target pools, and active/inactive status.' },
        { name: 'Rule Builder', description: 'Form to create a new rule: select source accounts, allocation method, allocation basis (percentages or formula), and target cost centers.' },
        { name: 'Allocation Basis Manager', description: 'Maintain the allocation driver data (headcount per department, office area per department) used by formula-based methods.' },
        { name: 'Rule Preview', description: "Preview the allocation result for last month's actuals to validate rule configuration before going live." },
      ]}
      tabs={['All Rules', 'Create Rule', 'Allocation Basis', 'Rule Preview']}
      features={[
        'Multiple allocation methods: fixed %, headcount, revenue, area',
        'Multi-source and multi-target allocation rules',
        'Allocation driver (basis) data management',
        'Rule preview against actual data before live use',
        'Tiered allocation support (allocate to interim pool, then reallocate)',
        'Rule version history for audit trail',
      ]}
      dataDisplayed={[
        'All allocation rules with source/target accounts',
        'Allocation method and driver basis',
        'Allocation percentages or formula',
        'Last run date and amounts allocated',
        'Rule status (active/inactive)',
      ]}
      userActions={[
        'Create a new allocation rule',
        'Edit allocation percentages or method',
        'Update allocation driver data (e.g., new headcount)',
        'Preview allocation result before running',
        'Activate or deactivate a rule',
        'View rule version history',
      ]}
      relatedPages={[
        { label: 'Run Allocations', href: '/accounting/allocations/run-allocations' },
        { label: 'Allocation History', href: '/accounting/allocations/allocation-history' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
        { label: 'Departments', href: '/organization/operational-structure/departments' },
      ]}
    />
  )
}

