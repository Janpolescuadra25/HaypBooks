'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="AI Bookkeeping"
      module="AUTOMATION"
      breadcrumb="Automation / AI Intelligence / AI Bookkeeping"
      purpose="AI-powered automatic categorization of bank and card transactions. Review machine learning suggestions, adjust rules, monitor categorization accuracy, and train the model on your preferences."
      components={[
        { name: "Suggestion Queue", description: "Transactions awaiting categorization review with AI-suggested category and confidence" },
        { name: "Categorization Rules", description: "Custom rules that override or supplement AI suggestions" },
        { name: "Accuracy Dashboard", description: "Charts showing categorization accuracy rate and trends over time" },
        { name: "Learning Panel", description: "Review how user corrections are improving model accuracy" },
        { name: "Batch Approve Controls", description: "Accept all high-confidence suggestions in one click" },
      ]}
      tabs={["Review Queue","Rules","Accuracy","History"]}
      features={["ML auto-categorization","Confidence score per suggestion","Rule-based overrides","Batch approval","Continuous model improvement"]}
      dataDisplayed={["Transaction description and amount","AI-suggested account category","Confidence percentage","Historical categorization pattern","User correction history"]}
      userActions={["Review AI suggestions","Accept or reject categorization","Create categorization rule","Batch approve high-confidence items","View accuracy report"]}
    />
  )
}

