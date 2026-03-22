'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Tasks'
      module='PROJECTS'
      breadcrumb='Projects / Planning / Project Tasks'
      purpose='Central task management interface for creating, assigning, prioritizing, and tracking all project tasks. Provides hierarchical work breakdown structure (WBS) views, dependency management, and progress tracking to keep project execution on schedule.'
      components={[
        { name: 'Task List View', description: 'Sortable and filterable list of all tasks with status, assignee, due date, and priority' },
        { name: 'WBS Tree View', description: 'Hierarchical tree display of tasks organized by phase and deliverable' },
        { name: 'Task Detail Panel', description: 'Side panel for entering task descriptions, estimates, dependencies, and attachments' },
        { name: 'Dependency Map', description: 'Visual representation of task predecessors and successors' },
        { name: 'Progress Bar Summary', description: 'Aggregate completion percentage per project phase' },
      ]}
      tabs={['List View', 'WBS View', 'By Assignee', 'Overdue Tasks']}
      features={['Hierarchical WBS structure with unlimited nesting', 'Task dependency and predecessor management', 'Effort estimation and actual hours tracking', 'Priority and status workflow', 'Bulk task assignment and reassignment', 'File attachment per task', 'Task comments and activity log']}
      dataDisplayed={['Task name, description, and phase', 'Assigned team member', 'Estimated vs. actual hours', 'Start and due dates', 'Task status (not started, in progress, complete, blocked)', 'Priority level', 'Task dependencies']}
      userActions={['Create new task or subtask', 'Assign task to team member', 'Set task dependencies', 'Update task progress', 'Add task comments and attachments', 'Bulk update task status', 'Export task list for reporting']}
      relatedPages={[
        { label: 'Schedule', href: '/projects/planning/schedule' },
        { label: 'Resource Planning', href: '/projects/planning/resource-planning' },
        { label: 'Project Time', href: '/projects/tracking/project-time' },
      ]}
    />
  )
}

