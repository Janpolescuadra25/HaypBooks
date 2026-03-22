'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Completion Forecast'
      module='PROJECTS'
      breadcrumb='Projects / Insights / Completion Forecast'
      purpose='Predicts project completion dates and final costs based on current progress velocity, remaining work, and resource availability. Uses earned value management (EVM) metrics to provide data-driven forecasts and early warning of schedule or budget delivery risk.'
      components={[
        { name: 'EVM Metrics Panel', description: 'Earned Value (EV), Planned Value (PV), Actual Cost (AC), CPI, and SPI displayed per project' },
        { name: 'Forecast Completion Date Chart', description: 'Timeline showing original, revised, and forecast completion dates' },
        { name: 'Estimate at Completion (EAC)', description: 'Calculates projected final cost using CPI-based and EVM-based methods' },
        { name: 'Remaining Work Tracker', description: 'Open task count, estimated remaining hours, and completion percentage' },
        { name: 'Sensitivity Analysis', description: 'What-if sliders for resource allocation and scope adjustments' },
      ]}
      tabs={['EVM Metrics', 'Schedule Forecast', 'Cost Forecast', 'Sensitivity Analysis']}
      features={['Full earned value management (EVM) metrics', 'Multiple EAC calculation methods (CPI-based, EVM, bottom-up)', 'Schedule and cost variance trending', 'Completion date probability analysis', 'Critical path impact visualization', 'What-if scenario modeling', 'Early warning alert system']}
      dataDisplayed={['Planned value (PV), earned value (EV), actual cost (AC)', 'Cost performance index (CPI) and schedule performance index (SPI)', 'Estimate at completion (EAC)', 'Estimate to complete (ETC)', 'Variance at completion (VAC)', 'Forecast completion date', 'Probability of on-time delivery']}
      userActions={['View EVM metrics for project', 'Analyze forecast completion date', 'Run what-if scenarios', 'Identify schedule critical path risks', 'Export forecast report', 'Compare forecast vs. baseline', 'Alert project manager of at-risk projects']}
      relatedPages={[
        { label: 'Project Dashboard', href: '/projects/insights/project-dashboard' },
        { label: 'Resource Utilization', href: '/projects/insights/resource-utilization' },
        { label: 'Budget vs. Actual', href: '/projects/financials/budget-vs-actual' },
      ]}
    />
  )
}

