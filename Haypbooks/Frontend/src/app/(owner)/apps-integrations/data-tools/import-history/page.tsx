'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Import History"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Data Tools / Import History"
      purpose="Review all past import jobs with timestamps, imported entity types, row counts, and error summaries. Undo recent imports or re-download the original file."
      components={[
        { name: "Import Log Table", description: "List of all past imports with date, type, rows imported, and status" },
        { name: "Import Detail Panel", description: "Full detail of a selected import including error rows" },
        { name: "Undo Import Button", description: "Rollback a recent import within the allowed undo window" },
        { name: "Download Original File", description: "Retrieve the original file submitted for any past import" },
      ]}
      tabs={["All Imports","Errors","Rolled Back"]}
      features={["Complete import history","Error row download","Import undo within 24h","Search and filter by date/type","Re-import from history"]}
      dataDisplayed={["Import date and time","Entity type imported","Total rows attempted","Rows succeeded and failed","Imported by user name"]}
      userActions={["View import details","Download original file","Download error rows","Undo import","Re-import from history"]}
    />
  )
}

