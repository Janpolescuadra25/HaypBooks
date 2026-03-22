'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Schedule'
      module='PROJECTS'
      breadcrumb='Projects / Planning / Schedule'
      purpose='Interactive Gantt chart and timeline management for project scheduling. Defines project phases, tasks, durations, dependencies, and critical path, enabling project managers to visualize the full project plan and proactively manage schedule risks.'
      components={[
        { name: 'Gantt Chart', description: 'Interactive drag-and-drop Gantt chart with task bars, dependencies, and milestones' },
        { name: 'Critical Path Highlighter', description: 'Automatically identifies and highlights the critical path tasks in red' },
        { name: 'Baseline Comparison Overlay', description: 'Overlays original baseline schedule against current plan to show schedule drift' },
        { name: 'Milestone Markers', description: 'Diamond markers on the Gantt for key project milestones and deliverables' },
        { name: 'Resource Assignments Column', description: 'Inline resource assignment per task with utilization indicators' },
      ]}
      tabs={['Gantt View', 'Timeline View', 'Critical Path', 'Baseline vs. Current']}
      features={['Drag-and-drop Gantt chart editing', 'Critical path method (CPM) calculation', 'Baseline schedule save and comparison', 'Milestone and deadline markers', 'Resource assignment directly on schedule', 'Schedule export to PDF and MS Project format', 'Automated schedule risk alerts']}
      dataDisplayed={['Task names, durations, and dates', 'Task dependencies (FS, SS, FF, SF)', 'Critical path tasks', 'Baseline vs. current schedule variance', 'Milestone dates', 'Resource assignments per task', 'Float and slack for non-critical tasks']}
      userActions={['Build project schedule from WBS', 'Define task dependencies', 'Set schedule baseline', 'Identify and manage critical path', 'Drag tasks to adjust dates', 'Assign resources to schedule tasks', 'Export Gantt chart to PDF']}
      relatedPages={[
        { label: 'Project Tasks', href: '/projects/planning/project-tasks' },
        { label: 'Capacity Planning', href: '/projects/planning/capacity-planning' },
        { label: 'Completion Forecast', href: '/projects/insights/completion-forecast' },
      ]}
    />
  )
}

