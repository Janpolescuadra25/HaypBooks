'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Movement Report"
      module="INVENTORY"
      breadcrumb="Inventory / Reports / Movement Report"
      purpose="The Inventory Movement Report summarizes all stock movements in a period — receipts, issues, adjustments, and transfers — providing a complete picture of inventory activity. It can be run for a specific item, category, warehouse, or all inventory, for any date range. The movement report shows opening balance + receipts - issues ± adjustments = closing balance, with cost values at each step. This is the key reconciliation and audit report for inventory."
      components={[
        { name: 'Movement Summary per Item', description: 'Per item: opening quantity and value, receipts in period, issues in period, adjustments, and closing quantity and value.' },
        { name: 'Movement Detail Rows', description: 'Each individual movement event with date, type, reference, quantity, and cost.' },
        { name: 'Period Selector', description: 'Select the reporting period: preset (current month, last month, YTD) or custom date range.' },
        { name: 'Variance Column', description: "Highlight items where the movement calculation doesn't reconcile (opening + in - out ≠ closing) — data integrity check." },
      ]}
      tabs={['Summary', 'Item Detail', 'By Category', 'Variance Report']}
      features={[
        'Period-based stock movement summary per item',
        'Opening and closing balance reconciliation',
        'Drill into individual movements from summary',
        'Data integrity variance check',
        'Filter by category, warehouse, or date range',
        'Export to Excel for audit',
      ]}
      dataDisplayed={[
        'Opening quantity and value per item',
        'Receipts, issues, adjustments in period',
        'Closing quantity and value',
        'Movement count by type',
        'Items with reconciliation variance',
      ]}
      userActions={[
        'Run movement report for a date range',
        'Filter by item, category, or warehouse',
        'Drill into individual movements per item',
        'Identify reconciliation variances',
        'Export movement report to Excel',
      ]}
      relatedPages={[
        { label: 'Stock Movements', href: '/inventory/stock/stock-movements' },
        { label: 'Inventory Valuation', href: '/inventory/reports/inventory-valuation' },
        { label: 'Stock Levels', href: '/inventory/stock/stock-levels' },
      ]}
    />
  )
}

