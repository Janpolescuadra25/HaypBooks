'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TimeByProjectPage() {
  return (
    <PageDocumentation
      title="Time by Project"
      module="TIME"
      breadcrumb="Time / Analysis / Time by Project"
      purpose="Time by Project aggregates all time entries at the project level, giving project managers visibility into actual hours consumed versus budgeted hours to detect scope creep early. This report helps teams assess project profitability — comparing labor costs incurred against revenue billed — and supports performance reviews. Drill-down capability exposes which tasks or team members are consuming the most time."
      components={[
        { name: 'Project Time Summary Table', description: 'Table of all projects with budgeted hours, actual hours, variance, completion %, and billed value.' },
        { name: 'Budget vs. Actual Chart', description: 'Horizontal bar chart comparing budgeted and actual hours per project with color-coded variance.' },
        { name: 'Task-Level Drill-Down', description: 'Click-through from project row to see time breakdown by individual task or deliverable.' },
        { name: 'Team Member Contribution', description: "Stacked chart per project showing each team member's hours contribution." },
        { name: 'Profitability Column', description: 'Calculated column showing billed revenue minus labor cost for each project.' },
      ]}
      tabs={['Budget vs. Actual', 'Task Breakdown', 'Team Contribution', 'Profitability']}
      features={[
        'Compare budgeted vs. actual hours per project with variance alerting',
        'Drill down from project to task-level time breakdown',
        'See profitability as billed revenue minus loaded labor cost',
        'Filter by active, completed, or on-hold projects',
        'Track team member contribution to each project',
        'Export project time analysis for stakeholder reporting',
      ]}
      dataDisplayed={[
        'Project name, status, and budgeted hours',
        'Actual hours logged and budget variance',
        'Completion percentage and projected finish',
        'Billed amount and unbilled value',
        'Labor cost incurred vs. project revenue',
      ]}
      userActions={[
        'Filter by project status or date range',
        'Drill down to task-level time detail',
        'View team contribution breakdown',
        'Export project time report',
        'Navigate to project record from table row',
      ]}
    />
  )
}

