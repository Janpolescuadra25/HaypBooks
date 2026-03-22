'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Capacity Planning'
      module='PROJECTS'
      breadcrumb='Projects / Planning / Capacity Planning'
      purpose='Provides a forward-looking view of team capacity versus projected demand across all active and upcoming projects. Helps managers identify staffing gaps, plan hiring timelines, and make informed decisions about project intake and scheduling.'
      components={[
        { name: 'Capacity vs. Demand Chart', description: 'Stacked area chart showing available capacity against forecasted demand by week or month' },
        { name: 'Gap Analysis Table', description: 'Period-by-period table showing surplus or deficit hours per role or team' },
        { name: 'Project Intake Simulation', description: 'What-if tool to model the capacity impact of adding a new project to the pipeline' },
        { name: 'Hiring Need Alerter', description: 'Triggers alerts when projected demand exceeds capacity for more than N consecutive periods' },
        { name: 'Role-Based Capacity Breakdown', description: 'Capacity analysis split by job role, department, or skill' },
      ]}
      tabs={['Capacity Overview', 'Gap Analysis', 'By Role', 'Scenario Modeling']}
      features={['Forward capacity vs. demand visualization', 'Role-based capacity aggregation', 'Project intake impact simulation', 'Hiring need alerts and thresholds', 'Integration with resource planning assignments', 'Configurable planning horizon (4, 12, 26 weeks)', 'Export capacity plan for leadership review']}
      dataDisplayed={['Total available hours per period by role', 'Total demanded hours from project assignments', 'Surplus or deficit hours per period', 'Projects contributing demand by period', 'Planned hires and their effective date impact', 'Capacity utilization percentage forecast', 'Critical resource bottlenecks']}
      userActions={['View capacity vs. demand overview', 'Identify upcoming staffing gaps', 'Simulate new project intake', 'Plan hiring timeline', 'Adjust project start dates to relieve pressure', 'Generate capacity plan report', 'Set capacity threshold alerts']}
      relatedPages={[
        { label: 'Resource Planning', href: '/projects/planning/resource-planning' },
        { label: 'Resource Utilization', href: '/projects/insights/resource-utilization' },
        { label: 'Project Dashboard', href: '/projects/insights/project-dashboard' },
      ]}
    />
  )
}

