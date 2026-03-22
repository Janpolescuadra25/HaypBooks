'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Deposit Slips"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Deposits / Deposit Slips"
      purpose="Generate and print formatted bank deposit slips for physical bank deposits. Pre-populated with payment details from the selected deposit batch, ready for submission to the bank."
      components={[
        { name: "Slip Template Selector", description: "Choose the bank deposit slip template matching your bank format" },
        { name: "Deposit Slip Preview", description: "Print-ready preview of the deposit slip with all payment details" },
        { name: "Print Controls", description: "Print single or batch deposit slips to any printer" },
        { name: "Slip Archive", description: "PDF copies of all printed deposit slips for record-keeping" },
      ]}
      tabs={["Generate Slip","Slip Archive","Templates"]}
      features={["Multiple slip templates","Auto-population from deposit records","Print-ready PDF output","Archive for compliance","Bulk print"]}
      dataDisplayed={["Deposit date and account number","Cash and check breakdown by denomination","Total deposit amount","Deposit slip number","Branch and routing information"]}
      userActions={["Select deposit for slip","Choose slip template","Preview deposit slip","Print deposit slip","Download PDF copy"]}
    />
  )
}

