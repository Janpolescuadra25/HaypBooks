'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Export Data"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Data Tools / Export Data"
      purpose="Export any module's data to CSV, Excel, JSON, or PDF. Apply flexible filters and date ranges, select specific fields, and download with one click."
      components={[
        { name: "Module Selector", description: "Choose which module to export data from (Customers, Invoices, Transactions, etc.)" },
        { name: "Filter Panel", description: "Date range, status, and field-level filters to narrow export scope" },
        { name: "Field Picker", description: "Choose which columns to include in the export" },
        { name: "Format Selector", description: "Pick output format: CSV, Excel, JSON, or PDF" },
        { name: "Download Button", description: "Trigger export and deliver file as download" },
      ]}
      tabs={["Configure Export","Recent Exports","Scheduled Exports"]}
      features={["Multi-format export (CSV, Excel, JSON, PDF)","Flexible field selection","Date range and status filters","Scheduled recurring exports","Large dataset chunking"]}
      dataDisplayed={["Available modules and entities","Estimated record count","Field list per entity","Recent export history","Export file size estimate"]}
      userActions={["Select module and entity","Apply filters","Pick fields","Choose format","Download exported file"]}
    />
  )
}

