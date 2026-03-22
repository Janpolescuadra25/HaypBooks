'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function RevenueForecastPage() {
  return (
    <PageDocumentation
      title="Revenue Forecast"
      module="AI ANALYTICS"
      breadcrumb="AI Analytics / Predictions / Revenue Forecast"
      purpose="AI-powered revenue forecasting combining historical sales data, pipeline data, and seasonal trends to project future revenue."
      components={[
        { name: "Forecast Chart", description: "12-month rolling revenue forecast with confidence bands" },
        { name: "Segment Breakdown", description: "Revenue forecast by customer segment, product, or geography" },
        { name: "Scenario Modeler", description: "Three-scenario view: base case, optimistic, pessimistic" },
        { name: "Driver Weights", description: "Which factors most influence the forecast" },
      ]}
      tabs={[
        "Forecast",
        "Segments",
        "Scenarios",
        "Drivers",
        "History",
      ]}
      features={[
        "12-month rolling forecast",
        "Segment-level breakdown",
        "Three-scenario modeling",
        "Seasonality adjustment",
        "Forecasting model selection",
      ]}
      dataDisplayed={[
        "Predicted revenue by month",
        "Confidence intervals",
        "Segment revenue breakdown",
        "Actual vs. forecast variance",
        "Key revenue drivers",
      ]}
      userActions={[
        "View revenue forecast",
        "Switch scenario",
        "Adjust driver weights",
        "Export forecast",
        "Compare with sales budget",
      ]}
    />
  )
}

