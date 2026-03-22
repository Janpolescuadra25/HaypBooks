'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Reconciliation History"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Reconciliation / History"
      purpose="Archive of all completed bank reconciliations by account and period. View the reconciliation statement, re-open a reconciliation for correction, and download supporting documents."
      components={[
        { name: "Reconciliation Archive", description: "All completed reconciliations listed by account and period with completion date" },
        { name: "Reconciliation Summary", description: "Statement balance, book balance, and proof of reconciliation for each period" },
        { name: "Re-open Button", description: "Unlock a completed reconciliation for correction with reason logging" },
        { name: "Document Download", description: "Download PDF reconciliation report or original bank statement" },
      ]}
      tabs={["All Accounts","By Account","Re-opened"]}
      features={["Full reconciliation archive","Re-open with reason","PDF reconciliation report","Original statement attachment","Filter by account and period"]}
      dataDisplayed={["Bank account name","Reconciliation period","Completed by and date","Ending statement balance","Ending book balance"]}
      userActions={["View reconciliation summary","Download reconciliation report","Download bank statement","Re-open reconciliation","Filter by account or date"]}
    />
  )
}

