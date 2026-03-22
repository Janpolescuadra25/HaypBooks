'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function GeneralLedgerPage() {
  return (
    <PageDocumentation
      title="General Ledger"
      module="ACCOUNTING"
      breadcrumb="Accounting / Core Accounting / General Ledger"
      purpose="View the complete record of all financial transactions posted to every GL account, supporting period filtering, account drill-downs, and export for audits."
      components={[
        { name: "Transaction Table", description: "Paginated ledger entries with date, description, reference, debit, and credit columns" },
        { name: "Account Selector", description: "Dropdown to filter the ledger to a single GL account" },
        { name: "Period Filter", description: "Date range picker with preset options (MTD, QTD, YTD)" },
        { name: "Running Balance", description: "Cumulative balance column updated for each entry" },
      ]}
      tabs={[
        "All Accounts",
        "By Account",
        "Journal Entries",
        "Audit Trail",
      ]}
      features={[
        "Drill-down to source transaction",
        "Advanced search by amount range or memo",
        "Period comparison (current vs. prior)",
        "Export to CSV/Excel/PDF",
        "Bulk journal entry import",
      ]}
      dataDisplayed={[
        "Entry date and journal number",
        "Account code and name",
        "Transaction description and reference",
        "Debit and credit amounts",
        "Running account balance",
        "Posted by user",
      ]}
      userActions={[
        "Filter by account, date, or amount",
        "Drill into a journal entry",
        "Export ledger to CSV",
        "Reverse a journal entry",
        "Search transaction memos",
      ]}
    />
  )
}

