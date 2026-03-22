'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function PaymentPredictionsPage() {
  return (
    <PageDocumentation
      title="Payment Predictions"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Predictions / Payment Predictions"
      purpose="AI model predicting when customers are likely to pay their outstanding invoices, improving cash flow planning and collections prioritization."
      components={[
        { name: "Payment Timeline", description: "Gantt-style chart showing predicted payment dates per invoice" },
        { name: "Customer Payment Profiles", description: "Historical payment behavior per customer used for predictions" },
        { name: "Collections Priority Queue", description: "AI-ranked list of which invoices to follow up on first" },
      ]}
      tabs={[
        "Payment Timeline",
        "Customer Profiles",
        "Collections Priority",
        "Model Settings",
      ]}
      features={[
        "Invoice-level payment date prediction",
        "Customer payment pattern analysis",
        "Collections prioritization",
        "Cash flow integration",
        "Model accuracy tracking",
      ]}
      dataDisplayed={[
        "Invoice amount and due date",
        "Predicted payment date",
        "Prediction confidence",
        "Customer historical payment latency",
        "Recommended follow-up date",
      ]}
      userActions={[
        "View payment predictions",
        "Adjust prediction confidence threshold",
        "Prioritize collections based on predictions",
        "Export timeline",
        "Review model accuracy",
      ]}
    />
  )
}

