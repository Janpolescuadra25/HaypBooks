'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Job Positions"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Workforce / Job Positions"
      purpose="Define and manage job positions in your organizational structure. Link positions to departments, set head-count targets, and attach pay grades for use in recruitment and compensation planning."
      components={[
        { name: "Position List", description: "All positions with title, department, headcount, and grade" },
        { name: "Create Position Form", description: "Define position: title, department, level, description, and pay grade" },
        { name: "Headcount Management", description: "Target vs. actual headcount per position" },
        { name: "Pay Grade Mapping", description: "Link each position to a salary grade range" },
        { name: "Requisition Trigger", description: "Open a recruitment requisition for vacancies" },
      ]}
      tabs={["All Positions","Vacant","Headcount","Pay Grades"]}
      features={["Position hierarchy definition","Headcount target tracking","Pay grade assignment","Vacancy management","Job description storage"]}
      dataDisplayed={["Position title and code","Department","Target and actual headcount","Salary grade range","Open vacancies count"]}
      userActions={["Create job position","Set pay grade","Control headcount targets","Open recruitment requisition","Deactivate position"]}
    />
  )
}

