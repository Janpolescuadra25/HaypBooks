'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Import Data"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Imports / Import Data"
      purpose="Import Data enables bulk data import into Haypbooks from CSV or Excel files — for customers, vendors, chart of accounts, opening balances, inventory items, employees, and historical transactions. This is critical at system setup (migrating from an existing accounting system) and for ongoing bulk operations (e.g., uploading a large vendor list from a procurement system). The import process includes template download, file upload, column mapping, validation preview (with errors highlighted before committing), and an import result summary."
      components={[
        { name: 'Import Type Selector', description: 'Choose what to import: Customers, Vendors, Chart of Accounts, Opening Balances, Items, Employees, Journal Entries, Invoices, Bills.' },
        { name: 'Template Downloader', description: 'Download the required CSV/Excel template for the selected data type with instructions per column.' },
        { name: 'File Upload', description: 'Upload completed CSV/Excel file. System detects the file structure.' },
        { name: 'Column Mapping', description: 'Map columns in the uploaded file to Haypbooks fields for flexible import from non-standard file formats.' },
        { name: 'Validation Preview', description: 'Show all rows with validation errors flagged before import — user corrects errors, re-imports, or skips error rows.' },
        { name: 'Import Result Summary', description: 'After import: rows imported, rows skipped (with reason), and rows with warnings.' },
      ]}
      tabs={['Select Type', 'Upload File', 'Map Columns', 'Validate', 'Import Result']}
      features={[
        'Bulk data import for all entity types',
        'CSV and Excel file support',
        'Template download per import type',
        'Flexible column mapping',
        'Pre-import validation with error reporting',
        'Partial import (skip error rows, import valid rows)',
        'Import history and rollback (for supported types)',
      ]}
      dataDisplayed={[
        'Available data types for import',
        'Validation errors from uploaded file',
        'Import preview before confirming',
        'Import result summary',
        'Prior import history',
      ]}
      userActions={[
        'Select data type to import',
        'Download import template',
        'Upload data file',
        'Map columns to system fields',
        'Review and fix validation errors',
        'Confirm and run import',
      ]}
      relatedPages={[
        { label: 'Import History', href: '/apps-integrations/imports/import-history' },
        { label: 'Chart of Accounts', href: '/accounting/core-accounting/chart-of-accounts' },
        { label: 'Employee List', href: '/payroll-workforce/employees/employee-list' },
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
      ]}
    />
  )
}

