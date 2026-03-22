'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Statement Archive"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Reconciliation / Statement Archive"
      purpose="Secure storage of all bank statement files attached to completed reconciliations. Download originals for audit support, search by account and period, and add supplementary documents."
      components={[
        { name: "Statement File List", description: "All stored statements by account and period with file metadata" },
        { name: "Document Viewer", description: "In-app PDF viewer for reviewing statements without downloading" },
        { name: "Upload Additional Documents", description: "Attach additional audit-support files to any reconciliation period" },
        { name: "Download Controls", description: "Download individual files or bulk download a period's documents" },
      ]}
      tabs={["By Account","By Period","All Documents"]}
      features={["Long-term statement storage","In-app PDF viewer","Searchable archive","Additional document upload","Bulk download"]}
      dataDisplayed={["Bank account and period","File name and type","Upload date and uploader","File size","Associated reconciliation date"]}
      userActions={["Search for statement","View statement in browser","Download statement file","Upload supplementary document","Delete document"]}
    />
  )
}

