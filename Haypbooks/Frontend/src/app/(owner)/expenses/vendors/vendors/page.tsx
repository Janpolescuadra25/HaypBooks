'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Vendors"
      module="EXPENSES"
      breadcrumb="Expenses / Vendors / Vendors"
      purpose="Complete vendor master list with contact information, payment terms, bank details, default GL accounts, and transaction history. Manage the full vendor lifecycle from onboarding to archiving."
      components={[
        { name: "Vendor Directory", description: "Searchable list of all vendors with name, category, and status" },
        { name: "Vendor Profile", description: "Complete vendor record: contact info, addresses, payment terms, bank details" },
        { name: "Transaction History", description: "All bills and payments for the selected vendor" },
        { name: "Default Account Settings", description: "Assign default GL expense account per vendor or category" },
        { name: "Vendor Documents", description: "W-9, contracts, insurance certificates, and other vendor files" },
      ]}
      tabs={["All Vendors","Active","Inactive","1099 Eligible"]}
      features={["Vendor master data management","Payment terms and method defaults","GL account defaults","Document storage","Vendor activity timeline"]}
      dataDisplayed={["Vendor name and code","Contact details and addresses","Payment terms and currency","Default GL account","YTD spend amount"]}
      userActions={["Add new vendor","Edit vendor profile","Set payment defaults","Upload vendor document","Deactivate vendor"]}
    />
  )
}

