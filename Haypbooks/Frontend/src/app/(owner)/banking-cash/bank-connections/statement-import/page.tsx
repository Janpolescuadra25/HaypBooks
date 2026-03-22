'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Statement Import"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Bank Connections / Statement Import"
      purpose="Manually import bank statements in OFX, QFX, CSV, or PDF formats when a direct feed is unavailable. Map columns for CSV files and validate before committing the import."
      components={[
        { name: "Upload Zone", description: "Drag-and-drop file upload area supporting OFX, QFX, CSV, and PDF" },
        { name: "Column Mapper", description: "For CSV files: map file columns to date, description, amount, and type" },
        { name: "Validation Preview", description: "Review imported rows before committing to the ledger" },
        { name: "Duplicate Detection", description: "Highlights rows that match already-imported transactions" },
        { name: "Import History", description: "Record of all previous manual statement imports" },
      ]}
      tabs={["Upload","Map Columns","Validate","History"]}
      features={["OFX, QFX, CSV, and PDF support","CSV column mapping","Pre-import validation","Duplicate detection","Partial import support"]}
      dataDisplayed={["Transaction rows in uploaded file","Column mapping status","Duplicate transaction count","New transaction count","Date range of imported statement"]}
      userActions={["Upload statement file","Map CSV columns","Review validation results","Resolve duplicates","Commit import"]}
    />
  )
}

