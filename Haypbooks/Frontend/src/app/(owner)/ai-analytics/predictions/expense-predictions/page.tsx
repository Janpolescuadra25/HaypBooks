'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function ExpensePredictionsPage() {
  return (
    <PageDocumentation
      title="Expense Predictions"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Predictions / Expense Predictions"
      purpose="AI-generated forecasts of future operating expenses by category, enabling proactive budget management and variance anticipation."
      components={[
        { name: "Prediction Chart", description: "Line/bar chart of predicted vs. actual expenses by category" },
        { name: "Prediction Table", description: "Detailed monthly predictions per expense category" },
        { name: "Confidence Intervals", description: "Upper and lower bounds for each prediction" },
        { name: "Driver Analysis", description: "Key factors influencing the prediction for each category" },
      ]}
      tabs={[
        "Predictions",
        "Actuals vs. Predicted",
        "Drivers",
        "Settings",
      ]}
      features={[
        "Category-level expense prediction",
        "Confidence intervals",
        "Driver attribution",
        "Scenario modeling",
        "Email alerts on budget deviation",
      ]}
      dataDisplayed={[
        "Predicted expense by category",
        "Confidence intervals",
        "Actual vs. predicted variance",
        "Key cost drivers",
        "Historical trend used for prediction",
      ]}
      userActions={[
        "View expense forecast",
        "Adjust scenario assumptions",
        "Set prediction alert",
        "Export predictions",
        "Compare with budget",
      ]}
    />
  )
}

