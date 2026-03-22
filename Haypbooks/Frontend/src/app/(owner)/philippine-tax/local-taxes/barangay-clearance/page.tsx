'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Barangay Clearance"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Local Taxes / Barangay Clearance"
      badge="PH ONLY"
      purpose="Track and manage barangay business clearance renewals for all business locations. Record fees paid, store clearance documents, and receive renewal reminders."
      components={[
        { name: "Clearance Register", description: "All barangay clearances for each business location with dates and status" },
        { name: "Renewal Calendar", description: "Upcoming renewal deadlines by barangay" },
        { name: "Document Storage", description: "Uploaded clearance certificates with issue and expiry dates" },
        { name: "Fee Tracker", description: "Annual barangay clearance fees paid per location" },
        { name: "Compliance Status", description: "Red/green compliance status per barangay location" },
      ]}
      tabs={["Clearances","Renewal Calendar","Documents","Fees"]}
      features={["Multi-location clearance tracking","Renewal deadline reminders","Document storage","Fee expense recording","Compliance dashboard"]}
      dataDisplayed={["Business location and barangay","Clearance number","Issue and expiry dates","Fee paid","Status (valid/expiring/expired)"]}
      userActions={["Add clearance record","Upload clearance document","Record fee payment","View renewal calendar","Set expiry reminder"]}
    />
  )
}

