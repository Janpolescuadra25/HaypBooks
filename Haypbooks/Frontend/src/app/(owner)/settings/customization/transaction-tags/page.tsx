'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TransactionTagsPage() {
  return (
    <PageDocumentation
      title="Transaction Tags"
      module="SETTINGS"
      breadcrumb="Settings / Customization / Transaction Tags"
      purpose="Transaction Tags are free-form or predefined labels that can be attached to any transaction to enable flexible cross-dimensional reporting beyond the standard chart of accounts. Tags are commonly used for project tracking, department coding, campaign attribution, or grant tracking where the full GL structure would be over-engineered. Tagged transactions can be filtered and grouped in reports independently of account codes."
      components={[
        { name: 'Tag Catalog', description: 'Master list of all defined tags with color, category group, active status, and usage count.' },
        { name: 'Tag Creator Form', description: 'Form to define a new tag: name, color code, optional category group, and description.' },
        { name: 'Tag Groups', description: 'Organizer to cluster related tags into groups (e.g., Departments, Campaigns, Projects) for structured filtering.' },
        { name: 'Tag Usage Report', description: 'Summary showing transaction volume and amounts tagged with each label over a selected period.' },
        { name: 'Bulk Tag Assignment', description: 'Tool to apply or remove tags from multiple transactions at once via filtered selection.' },
      ]}
      tabs={['All Tags', 'Tag Groups', 'Usage Report']}
      features={[
        'Create color-coded tags for cross-dimensional transaction categorization',
        'Organize tags into groups for structured multi-level filtering',
        'Apply tags to any transaction type (invoices, expenses, journals)',
        'Bulk assign or remove tags across multiple transactions',
        'Generate reports filtered or grouped by tag for custom analysis',
        'Inactivate tags without losing historical data',
      ]}
      dataDisplayed={[
        'Tag name, color, and group assignment',
        'Number of transactions tagged with each label',
        'Total transaction value per tag',
        'Active vs. inactive tag status',
        'Last used date per tag',
      ]}
      userActions={[
        'Create new transaction tag with color and description',
        'Organize tags into named groups',
        'Apply tags to transactions from this management page',
        'View tag usage report with totals',
        'Deactivate or delete unused tags',
      ]}
    />
  )
}

