'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Document Recognition"
      module="AUTOMATION"
      breadcrumb="Automation / AI Intelligence / Document Recognition"
      purpose="OCR processing pipeline for uploaded receipts, bills, and financial documents. Automatically extracts vendor name, date, amount, and line items. Review queue for items needing correction."
      components={[
        { name: "Upload Queue", description: "Incoming documents pending OCR processing with status indicators" },
        { name: "Extracted Data Preview", description: "Side-by-side view of original document image and extracted field values" },
        { name: "Correction Interface", description: "Edit extracted fields directly before confirming document" },
        { name: "Processing Accuracy Stats", description: "Metrics on extraction accuracy by document type" },
        { name: "Auto-Match Panel", description: "Match extracted documents to existing purchase orders or bills" },
      ]}
      tabs={["Processing Queue","Completed","Errors","Accuracy Stats"]}
      features={["OCR extraction for receipts and bills","Multi-field extraction (vendor, date, amount, lines)","Confidence scoring per field","Human review queue for low confidence","Auto-match to existing records"]}
      dataDisplayed={["Document image thumbnail","Extracted field values and confidence","Processing status","Match suggestions","Extraction error flags"]}
      userActions={["Upload document for OCR","Review extracted data","Correct extraction errors","Confirm and post document","Match to purchase order or bill"]}
    />
  )
}

