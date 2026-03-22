'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Batch Processing"
      module="AUTOMATION"
      breadcrumb="Automation / Scheduling / Batch Processing"
      purpose="Define and schedule batch jobs for bulk operations such as mass invoice generation, bulk payment runs, and large-scale data exports. Monitor execution and review results."
      components={[
        { name: "Batch Job List", description: "All configured batch jobs with name, schedule, last run, and status" },
        { name: "Create Job Form", description: "Define a new batch job: type, parameters, schedule, and notifications" },
        { name: "Execution Monitor", description: "Live progress tracker for currently running batch jobs" },
        { name: "Results Viewer", description: "Detailed results from completed runs including counts and errors" },
        { name: "Schedule Calendar", description: "Calendar view of upcoming batch job execution times" },
      ]}
      tabs={["Jobs","Running Now","History","Scheduled"]}
      features={["Flexible scheduling (one-time, recurring)","Parallel execution support","Live progress monitoring","Result reports with error rows","Email notification on completion"]}
      dataDisplayed={["Batch job name and description","Scheduled execution time","Last run status and duration","Records processed count","Errors and warnings"]}
      userActions={["Create batch job","Configure schedule","Run job immediately","Monitor progress","View results","Pause or cancel job"]}
    />
  )
}

