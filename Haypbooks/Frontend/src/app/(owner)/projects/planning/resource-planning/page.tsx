'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Resource Planning'
      module='PROJECTS'
      breadcrumb='Projects / Planning / Resource Planning'
      purpose='Assigns team members and resources to project tasks and phases based on availability, skills, and workload. Integrates with capacity planning to prevent over-allocation, enabling managers to build realistic staffing plans and respond quickly to resource gaps.'
      components={[
        { name: 'Resource Assignment Board', description: 'Drag-and-drop interface for assigning resources to tasks and phases' },
        { name: 'Availability Calendar', description: "Calendar view showing each resource's availability, time off, and existing commitments" },
        { name: 'Skills Matrix', description: 'Filterable matrix matching required task skills to available team member skill profiles' },
        { name: 'Conflict Detector', description: 'Real-time alert when a resource is assigned beyond their daily capacity' },
        { name: 'Staffing Plan Export', description: 'Generates printable staffing plan showing assignments by resource and week' },
      ]}
      tabs={['Assignment Board', 'Availability Calendar', 'Skills Match', 'Staffing Plan']}
      features={['Drag-and-drop resource assignment', 'Real-time availability check and conflict detection', 'Skills-based resource matching', 'Weekly and monthly staffing plan views', 'Resource request workflow for external resources', 'Vacation and unavailability blocking', 'Integration with time tracking']}
      dataDisplayed={['Team member names and roles', 'Available hours per period', 'Current project assignments', 'Skills and certifications', 'Allocation percentage per project', 'Confirmed vs. tentative assignments', 'Gaps in staffing vs. project demand']}
      userActions={['Assign resource to project task', 'Check resource availability', 'Resolve resource conflicts', 'Request additional resource', 'Update resource skills profile', 'Generate staffing plan report', 'Plan for upcoming project phases']}
      relatedPages={[
        { label: 'Capacity Planning', href: '/projects/planning/capacity-planning' },
        { label: 'Resource Utilization', href: '/projects/insights/resource-utilization' },
        { label: 'Project Tasks', href: '/projects/planning/project-tasks' },
      ]}
    />
  )
}

