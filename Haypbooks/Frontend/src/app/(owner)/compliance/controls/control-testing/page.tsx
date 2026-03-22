'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Control Testing"
      module="COMPLIANCE"
      breadcrumb="Compliance / Controls / Control Testing"
      purpose="Schedule and record results of internal control tests. Track test outcomes, document deficiencies, assign remediation owners, and monitor remediation progress to closure."
      components={[
        { name: "Testing Schedule", description: "Calendar of planned control tests with assigned testers and due dates" },
        { name: "Test Execution Form", description: "Record test procedure, evidence, and pass/fail outcome" },
        { name: "Deficiency Register", description: "Control deficiencies found during testing with severity rating" },
        { name: "Remediation Tracker", description: "Action items to fix deficiencies with owner and deadline" },
        { name: "Evidence Repository", description: "Uploaded test evidence files linked to each test result" },
      ]}
      tabs={["Scheduled Tests","Completed","Deficiencies","Remediation"]}
      features={["Scheduled test management","Evidence attachment","Deficiency severity classification","Remediation tracking","Test result history"]}
      dataDisplayed={["Control name and risk area","Test scheduled and completion dates","Test result (pass/fail/exception)","Deficiencies found","Remediation status"]}
      userActions={["Schedule control test","Record test result","Upload evidence","Log deficiency","Assign remediation action"]}
    />
  )
}

