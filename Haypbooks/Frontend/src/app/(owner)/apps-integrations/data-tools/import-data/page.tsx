'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Import Data"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Data Tools / Import Data"
      purpose="Step-by-step wizard to import data from CSV or Excel. Supports customers, vendors, items, transactions, accounts, and opening balances with column mapping and validation."
      components={[
        { name: "Import Wizard", description: "Multi-step guided flow: select type → upload file → map columns → validate → import" },
        { name: "Column Mapper", description: "Drag-and-drop mapping of file columns to Haypbooks fields" },
        { name: "Validation Preview", description: "See rows that will succeed or fail before committing the import" },
        { name: "Error Report", description: "Detailed list of validation errors with row numbers and fix suggestions" },
        { name: "Progress Tracker", description: "Live progress bar showing import completion percentage" },
      ]}
      tabs={["Select Type","Upload File","Map Columns","Validate","Import"]}
      features={["Guided 5-step wizard","CSV and Excel support","Column mapping with auto-detection","Pre-import validation","Error row download","Undo recent imports"]}
      dataDisplayed={["Supported entity types","Upload file preview with headers","Column mapping status","Validation pass/fail counts","Import result summary"]}
      userActions={["Upload CSV or Excel file","Map file columns to fields","Preview validation results","Resolve errors before import","Execute import"]}
    />
  )
}

