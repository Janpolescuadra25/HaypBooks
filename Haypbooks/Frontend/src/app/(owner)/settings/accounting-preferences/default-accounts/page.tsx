'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function DefaultAccountsPage() {
  return (
    <PageDocumentation
      title="Default Accounts"
      module="SETTINGS"
      breadcrumb="Settings / Accounting Preferences / Default Accounts"
      purpose="Default Accounts maps standard transaction types to the correct general ledger accounts, so every new transaction auto-populates with the right account coding without requiring manual selection. Setting up defaults reduces data entry errors and ensures consistency across all journal entries. Accounts can be configured globally or per transaction type, supporting complex chart of accounts structures."
      components={[
        { name: 'Default Account Mapping Table', description: 'Grid of transaction types (Sales, Purchases, Payroll, etc.) with GL account dropdowns for each.' },
        { name: 'Account Search Picker', description: 'Searchable account picker inside each row to quickly find and assign the correct GL account.' },
        { name: 'Module Filter', description: 'Filter the mapping table by module (AR, AP, Banking, Payroll) to focus on relevant defaults.' },
        { name: 'Reset to Defaults Button', description: 'Option to restore factory-default account mappings if custom settings have caused issues.' },
        { name: 'Import/Export Mappings', description: 'Export account mapping config to JSON/CSV or import from a template for quick multi-entity setup.' },
      ]}
      tabs={['Revenue Accounts', 'Expense Accounts', 'Asset Accounts', 'Liability Accounts', 'Tax Accounts']}
      features={[
        'Map each transaction type to its default debit and credit GL accounts',
        'Filter mappings by module to keep settings organized',
        'Search and assign accounts using the chart of accounts picker',
        'Export current mappings for cross-entity replication',
        'Import mappings from another entity or template file',
        'Reset individual or all mappings to system defaults',
      ]}
      dataDisplayed={[
        'Transaction type name and category',
        'Assigned default debit account (code + name)',
        'Assigned default credit account (code + name)',
        'Module/source of transaction',
        'Last modified date and user',
      ]}
      userActions={[
        'Assign or change the default GL account for any transaction type',
        'Filter mappings by accounting module',
        'Export account mappings to CSV or JSON',
        'Import mappings from a template',
        'Reset mappings to system defaults',
      ]}
    />
  )
}

