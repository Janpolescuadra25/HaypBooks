'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Dashboard'
      module='PROJECTS'
      breadcrumb='Projects / Insights / Project Dashboard'
      purpose='Executive-level overview of all active projects, presenting health scores, financial performance, schedule adherence, and resource utilization in a single consolidated view. Designed for project managers and executives needing rapid portfolio-level visibility.'
      components={[
        { name: 'Portfolio Health Grid', description: 'Card-based view of all projects with RAG (Red-Amber-Green) health indicators' },
        { name: 'Financial KPI Strip', description: 'Row of KPIs covering total contract value, billed, unbilled, and collected' },
        { name: 'Schedule Performance Index (SPI)', description: 'Project-level schedule adherence trending over time' },
        { name: 'Top Issues Feed', description: 'Automatically surfaced project risks, budget overruns, and schedule slippages' },
        { name: 'Resource Utilization Heatmap', description: 'Team utilization by person and project for the current and next two weeks' },
      ]}
      tabs={['Portfolio Overview', 'Financial Summary', 'Schedule Performance', 'Resource Overview']}
      features={['Real-time project health scoring', 'Financial KPI aggregation across portfolio', 'Schedule performance index calculation', 'Automated issue surfacing and alerting', 'Resource utilization heatmap', 'Customizable dashboard layout', 'Drill-down from dashboard to project detail']}
      dataDisplayed={['Number of active projects', 'Total portfolio contract value', 'Total billed and unbilled WIP', 'Projects on track / at risk / overdue count', 'Average project completion percentage', 'Total billable hours this period', 'Key upcoming milestones']}
      userActions={['View portfolio health overview', 'Drill into at-risk project', 'Review upcoming milestones', 'Assess resource utilization', 'Configure dashboard widgets', 'Export portfolio status report', 'Filter by project manager or client']}
      relatedPages={[
        { label: 'Resource Utilization', href: '/projects/insights/resource-utilization' },
        { label: 'Completion Forecast', href: '/projects/insights/completion-forecast' },
        { label: 'Project Profitability', href: '/projects/financials/project-profitability' },
      ]}
    />
  )
}

