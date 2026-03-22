'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TeamsGroupsPage() {
  return (
    <PageDocumentation
      title="Teams & Groups"
      module="SETTINGS"
      breadcrumb="Settings / Users & Security / Teams & Groups"
      purpose="Teams & Groups organizes users into logical groupings for assignment of tasks, approval workflows, notifications, and access policies. Teams can represent departments, functional units, or project groups, and can have team-level settings such as a manager designation and shared inbox. Grouping users simplifies notification routing and approval delegation at scale."
      components={[
        { name: 'Teams Directory', description: 'Card grid of all teams with member count, manager, and department tag.' },
        { name: 'Team Detail Form', description: 'Form to create or edit a team: name, description, manager, department, and member list.' },
        { name: 'Member Picker', description: 'Multi-select user picker to add members to a team from the full user directory.' },
        { name: 'Team Permissions Panel', description: 'Optional tab to apply shared permission overrides to all members of the team.' },
        { name: 'Org Chart View', description: 'Visual tree chart showing team hierarchy and reporting structure.' },
      ]}
      tabs={['All Teams', 'My Team', 'Org Chart']}
      features={[
        'Create and name teams or departments for organizational grouping',
        'Assign a manager to each team for escalation and approval routing',
        'Add members via searchable user picker',
        'Apply shared permission settings at the team level',
        'Use org chart view to visualize team hierarchy',
        'Integrate teams with approval workflows and notification rules',
      ]}
      dataDisplayed={[
        'Team name, description, and department',
        'Manager and member list',
        'Number of open tasks or approvals assigned to team',
        'Date team was created and last modified',
        'Linked permission policy (if any)',
      ]}
      userActions={[
        'Create a new team or group',
        'Add or remove members from a team',
        'Designate a team manager',
        'Apply shared permissions to a team',
        'View org chart hierarchy',
      ]}
    />
  )
}

