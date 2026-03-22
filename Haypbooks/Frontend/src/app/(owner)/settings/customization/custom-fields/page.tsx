'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CustomFieldsPage() {
  return (
    <PageDocumentation
      title="Custom Fields"
      module="SETTINGS"
      breadcrumb="Settings / Customization / Custom Fields"
      purpose="Custom Fields extends the standard data model by adding your own fields to entities such as Customers, Vendors, Invoices, and Products. Businesses use custom fields to capture industry-specific data, internal categorization codes, or external system reference IDs that are not part of the default schema. Custom fields appear on forms, reports, and exports throughout the system."
      components={[
        { name: 'Custom Fields List', description: 'Table of all defined custom fields with entity, field type, label, and active status.' },
        { name: 'Add Field Form', description: 'Form to define a new custom field: label, data type (text, number, date, dropdown), and target entity.' },
        { name: 'Field Options Editor', description: 'Multi-value editor for dropdown-type fields to define the list of selectable options.' },
        { name: 'Field Placement Controls', description: 'Configuration to show/hide the field on forms, exports, and reports per entity context.' },
        { name: 'Required/Optional Toggle', description: 'Switch to mark a custom field as required on new record creation or optional.' },
      ]}
      tabs={['Customer Fields', 'Vendor Fields', 'Transaction Fields', 'Product Fields', 'Employee Fields']}
      features={[
        'Add unlimited custom fields to any entity in the system',
        'Support field types: text, number, date, yes/no toggle, single dropdown, multi-select',
        'Mark fields required or optional per entity',
        'Control field visibility on data entry forms vs. reports',
        'Export custom field data alongside standard fields in all CSV/Excel exports',
        'Reorder fields on forms via drag-and-drop',
      ]}
      dataDisplayed={[
        'Field label, type, and target entity',
        'Required/optional status',
        'Number of records containing a value for each field',
        'Visibility settings (form, report, export)',
        'Creation date and last modified user',
      ]}
      userActions={[
        'Create a new custom field for any entity',
        'Set field type and dropdown options',
        'Mark a field as required or optional',
        'Hide or show a field on forms and reports',
        'Delete or deactivate unused custom fields',
      ]}
    />
  )
}

