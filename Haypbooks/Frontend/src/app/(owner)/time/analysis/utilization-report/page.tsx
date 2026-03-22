'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function UtilizationReportPage() {
  return (
    <PageDocumentation
      title="Utilization Report"
      module="TIME"
      breadcrumb="Time / Analysis / Utilization Report"
      purpose="Utilization Report measures how efficiently employee time is being utilized by comparing total billable hours to total available working hours. High utilization indicates productive billing capacity; low utilization flags under-assignment or lost billable opportunity. This report is essential for resource planning, staffing decisions, and performance management in professional services organizations."
      components={[
        { name: 'Utilization Rate Summary Cards', description: 'KPI cards showing company-wide, team-level, and individual utilization rates for the period.' },
        { name: 'Employee Utilization Table', description: "Sortable table with each employee's available hours, billable hours, utilization %, and target %." },
        { name: 'Utilization Trend Chart', description: 'Line chart showing utilization rate trend over time with target utilization benchmark line.' },
        { name: 'Team/Role Filter', description: 'Filter utilization data by team, role, department, or seniority level.' },
        { name: 'Target Setting', description: 'Per-role or per-employee target utilization % that shows as benchmark on the chart.' },
      ]}
      tabs={['Company Overview', 'By Employee', 'By Team', 'Trend Analysis']}
      features={[
        'Calculate billable utilization rate per employee and team',
        'Compare actual utilization to configurable benchmark targets',
        'View trend of utilization over weeks, months, or quarters',
        'Identify over-utilized employees at risk of burnout',
        'Spot under-utilized resources available for reallocation',
        'Export utilization report for HR and operations review',
      ]}
      dataDisplayed={[
        'Employee name, team, and role',
        'Available hours and billable hours logged',
        'Utilization rate (%) and target rate',
        'Over/under utlization delta',
        'Period comparison vs. prior month',
      ]}
      userActions={[
        'Filter utilization by team, role, or date range',
        'Set utilization target % per role',
        'View individual employee drill-down',
        'Export utilization report',
        'Compare current period vs. prior period',
      ]}
    />
  )
}

