'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Classes & Tags"
      module="ORGANIZATION"
      breadcrumb="Organization / Operational Structure / Classes & Tags"
      purpose="Classes & Tags provides additional categorization dimensions for transactions beyond accounts, departments, and locations. Classes (e.g., product lines, service types, revenue segments) and Tags (free-form labels) allow flexible ad-hoc segmentation of financial data for custom reporting. Any transaction can have multiple tags assigned, enabling multi-dimensional analysis."
      components={[
        { name: 'Classes List', description: 'Defined classes with name, type, active status, and description — used as structured segments.' },
        { name: 'Tags Management', description: 'Free-form tags with auto-complete. View usage count per tag across all transactions.' },
        { name: 'Create Class Form', description: 'Define a new class with category, description, and applicable transaction types.' },
        { name: 'Tag Usage Report', description: 'Which transactions use each tag, with amounts and count.' },
      ]}
      tabs={['Classes', 'Tags', 'Usage Report']}
      features={[
        'Flexible additional segmentation dimensions',
        'Classes for structured segments (limited set)',
        'Tags for flexible free-form labeling',
        'Multi-tag support per transaction',
        'Class/tag used in report filters across all modules',
        'Merge or rename tags without data loss',
      ]}
      dataDisplayed={[
        'All defined classes with description',
        'All tags with usage count',
        'Transaction count and total amount per class/tag',
        'Modules where each class/tag is used',
      ]}
      userActions={[
        'Create a new class',
        'Add custom tags',
        'Merge duplicate tags',
        'Rename a class or tag',
        'Deactivate a class no longer used',
        'View transactions by class or tag',
      ]}
      relatedPages={[
        { label: 'Departments', href: '/organization/operational-structure/departments' },
        { label: 'Transaction Tags', href: '/settings/customization/transaction-tags' },
        { label: 'Custom Reports', href: '/reporting/custom-reports/report-builder' },
      ]}
    />
  )
}

