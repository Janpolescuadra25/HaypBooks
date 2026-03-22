'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CustomListsPage() {
  return (
    <PageDocumentation
      title="Custom Lists"
      module="SETTINGS"
      breadcrumb="Settings / Customization / Custom Lists"
      purpose="Custom Lists are reusable dropdown value sets that can be referenced by custom fields throughout the application. Rather than hard-coding options inside each field, Custom Lists allow you to maintain a single source of truth for approved values — making updates effortless when choices change. Lists can be shared across multiple fields and entities."
      components={[
        { name: 'Lists Catalog', description: 'Left-panel list of all defined custom lists with item count and usage count across fields.' },
        { name: 'List Item Editor', description: 'Inline editor for adding, renaming, reordering, or deactivating values within a list.' },
        { name: 'Field Associations Panel', description: 'Shows which custom fields are currently using each list as their source.' },
        { name: 'Inactive Values Toggle', description: 'Switch to show or hide deactivated list values; inactive values remain on existing records.' },
        { name: 'Bulk Import Values', description: 'CSV import modal to bulk-load list items instead of adding them one-by-one.' },
      ]}
      tabs={['All Lists', 'Active Lists', 'Archived Lists']}
      features={[
        'Create and manage reusable value lists for dropdown custom fields',
        'Add, rename, reorder, or deactivate individual list values',
        'Bulk-import list values via CSV for large option sets',
        'See which custom fields reference each list',
        'Deactivate a list value without breaking existing records',
        'Archive entire lists that are no longer needed',
      ]}
      dataDisplayed={[
        'List name and item count',
        'Number of custom fields using each list',
        'Individual list values with active/inactive status',
        'Last updated date per list',
        'Create date and owner user',
      ]}
      userActions={[
        'Create a new custom list',
        'Add or edit list values',
        'Import list values from CSV',
        'Deactivate a value from a list',
        'Archive or delete an unused list',
      ]}
    />
  )
}

