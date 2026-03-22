'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Fraud Detection Rules"
      module="COMPLIANCE"
      breadcrumb="Compliance / Monitoring / Fraud Detection Rules"
      purpose="Configure rules that flag suspicious transaction patterns for investigation. Detect duplicate vendors, unusual payment amounts, round-number transactions, and other fraud indicators."
      components={[
        { name: "Rules Library", description: "Pre-built and custom fraud detection rules with description and status" },
        { name: "Rule Builder", description: "Create custom rules: if condition X is met, flag with severity Y" },
        { name: "Flag Queue", description: "Transactions flagged by active rules awaiting investigation" },
        { name: "Investigation Panel", description: "Review each flagged item, add notes, dismiss or escalate" },
        { name: "Performance Dashboard", description: "True positive rate and false positive rate per rule" },
      ]}
      tabs={["Active Rules","Disabled","Flag Queue","Investigations","Performance"]}
      features={["Pre-built fraud rule templates","Custom rule builder","Severity classification","Investigation workflow","Rule performance stats"]}
      dataDisplayed={["Rule name and condition description","Transactions flagged count","Severity level","Last triggered date","False positive rate"]}
      userActions={["Create fraud rule","Enable or disable rule","Investigate flagged transaction","Dismiss false positive","View rule performance"]}
    />
  )
}

