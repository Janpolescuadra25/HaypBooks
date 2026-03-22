'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Resource Utilization'
      module='PROJECTS'
      breadcrumb='Projects / Insights / Resource Utilization'
      purpose='Tracks how effectively team members and resources are being utilized across the project portfolio. Measures billable vs. non-billable time, identifies over-utilized and under-utilized resources, and supports workload balancing and hiring decisions.'
      components={[
        { name: 'Utilization Heatmap', description: "Color-coded grid showing each resource's utilization percentage by week" },
        { name: 'Billable vs. Non-Billable Ratio', description: 'Stacked bar chart separating billable, non-billable, and available time' },
        { name: 'Resource Comparison Table', description: 'Side-by-side utilization metrics for each team member with targets' },
        { name: 'Over-Capacity Alert Panel', description: 'Highlights resources booked above capacity threshold' },
        { name: 'Skill Utilization View', description: 'Aggregated utilization by skill category or department' },
      ]}
      tabs={['Heatmap', 'By Team Member', 'By Project', 'Trends']}
      features={['Real-time utilization calculation from time entries', 'Billable vs. non-billable split analysis', 'Target utilization rate configuration', 'Over-capacity alerts and notifications', 'Department and skill-level aggregation', 'Forward utilization based on planned assignments', 'Export utilization report']}
      dataDisplayed={['Utilization percentage per team member', 'Billable hours vs. total worked hours', 'Capacity (available hours) per period', 'Hours booked vs. available', 'Top 5 most and least utilized resources', 'Utilization trend by month', 'Target utilization deviation']}
      userActions={['View utilization heatmap', 'Identify over-utilized team members', 'Rebalance workload assignments', 'Set target utilization rates', 'Analyze billable ratio by team', 'Export utilization report', 'Plan future capacity needs']}
      relatedPages={[
        { label: 'Project Dashboard', href: '/projects/insights/project-dashboard' },
        { label: 'Resource Planning', href: '/projects/planning/resource-planning' },
        { label: 'Capacity Planning', href: '/projects/planning/capacity-planning' },
      ]}
    />
  )
}

