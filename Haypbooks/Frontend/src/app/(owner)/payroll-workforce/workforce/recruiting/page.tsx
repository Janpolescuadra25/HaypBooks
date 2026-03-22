'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Recruiting"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Workforce / Recruiting"
      purpose="Manage the end-to-end recruitment process. Post requisitions, track applicants through screening, interviews, and offers, and onboard accepted candidates directly to employee records."
      components={[
        { name: "Requisition Board", description: "All open and closed job requisitions with applicant count and status" },
        { name: "Applicant Pipeline", description: "Kanban-style candidate tracking through each hiring stage" },
        { name: "Application Form", description: "Capture candidate information, resume, and screening answers" },
        { name: "Interview Scheduler", description: "Schedule interviews and share availability with hiring team" },
        { name: "Offer Letter Generator", description: "Create and send offer letters with compensation details" },
      ]}
      tabs={["Requisitions","Applicants","Interviews","Offers","Onboarding"]}
      features={["End-to-end ATS","Kanban pipeline view","Interview scheduling","Offer letter generation","New hire onboarding integration"]}
      dataDisplayed={["Open requisitions count","Applicants per stage","Time-to-fill by position","Offer acceptance rate","Active job postings count"]}
      userActions={["Create job requisition","Review application","Schedule interview","Issue offer letter","Convert to employee record"]}
    />
  )
}

