'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Receipts"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Capture / Receipts"
      purpose="Upload and OCR-process receipt images for expense documentation. Attach processed receipts to expense reports or transactions. Manage the receipts inbox and bulk upload from mobile."
      components={[
        { name: "Receipt Inbox", description: "Uploaded receipts awaiting processing with thumbnail preview" },
        { name: "OCR Data Preview", description: "Extracted vendor, date, amount, and category from OCR" },
        { name: "Correction Interface", description: "Edit extracted data before confirming the receipt" },
        { name: "Link to Transaction", description: "Attach a receipt to an existing expense or bank transaction" },
        { name: "Bulk Upload", description: "Upload multiple receipts at once via drag-and-drop" },
      ]}
      tabs={["Inbox","Processed","Linked","Errors"]}
      features={["OCR auto-extraction","Multi-receipt bulk upload","Mobile receipt forwarding","Link to expense or transaction","Duplicate detection"]}
      dataDisplayed={["Receipt thumbnail image","Vendor and date extracted","Amount and currency","Processing status","Linked transaction or expense"]}
      userActions={["Upload receipt","Review OCR data","Correct extraction errors","Link to expense","Delete processed receipt"]}
    />
  )
}

