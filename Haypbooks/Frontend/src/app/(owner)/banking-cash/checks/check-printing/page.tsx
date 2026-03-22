'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Check Printing"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Checks / Check Printing"
      purpose="Queue and print checks for approved payments. Configure check layout templates, MICR encoding, printer alignment, and batch print multiple checks at once."
      components={[
        { name: "Print Queue", description: "Approved payments ready for check printing with payee and amount" },
        { name: "Check Template Editor", description: "Configure layout: company info position, signature line, MICR zone" },
        { name: "Alignment Test Print", description: "Print alignment guide to calibrate printer to check stock" },
        { name: "Batch Print Controls", description: "Select and print multiple checks in one print job" },
        { name: "Print History", description: "Record of all check print jobs with reprint capability" },
      ]}
      tabs={["Print Queue","Templates","History","Settings"]}
      features={["Custom check layout templates","MICR encoding configuration","Batch printing support","Alignment calibration","Reprint lost checks"]}
      dataDisplayed={["Payee name and amount","Check number assigned","Bank account and routing number","Template layout applied","Print date"]}
      userActions={["Add payment to print queue","Configure check template","Run alignment test","Print batch of checks","Reprint check"]}
    />
  )
}

