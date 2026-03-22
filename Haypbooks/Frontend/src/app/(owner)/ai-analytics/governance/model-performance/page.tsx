'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function ModelPerformancePage() {
  return (
    <PageDocumentation
      title="Model Performance"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Governance / Model Performance"
      purpose="Monitor the accuracy, latency, and confidence of AI models used across the platform, enabling performance tuning and model version management."
      components={[
        { name: "Performance Dashboard", description: "Real-time KPI cards: accuracy, precision, recall, latency" },
        { name: "Model Registry", description: "All deployed models with version and deployment date" },
        { name: "Drift Detector", description: "Chart of model accuracy over time to identify performance degradation" },
        { name: "A/B Comparison", description: "Compare two model versions side-by-side" },
      ]}
      tabs={[
        "Overview",
        "Model Registry",
        "Drift Analysis",
        "A/B Testing",
        "Alerts",
      ]}
      features={[
        "Real-time accuracy tracking",
        "Concept drift detection",
        "Version rollback",
        "A/B model comparison",
        "Latency monitoring",
        "Alerting on accuracy drop",
      ]}
      dataDisplayed={[
        "Model name and version",
        "Accuracy and confidence metrics",
        "Prediction latency (ms)",
        "Number of predictions in period",
        "Drift score over time",
      ]}
      userActions={[
        "View model performance metrics",
        "Roll back to prior version",
        "Configure accuracy alert",
        "Compare two model versions",
        "Export performance report",
      ]}
    />
  )
}

