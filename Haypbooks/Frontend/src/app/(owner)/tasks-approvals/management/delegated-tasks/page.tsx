'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Delegated Tasks"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Management / Delegated Tasks"
      purpose="Delegated Tasks shows tasks and approvals that have been delegated by the current user to other team members, as well as tasks delegated to the current user by others. It provides full visibility into delegation chains ensuring accountability and allowing the original owner to monitor delegated work progress and recall delegation if needed."
      components={[
        { name: 'Delegated By Me', description: 'List of tasks and approvals I have delegated to others, showing delegate name, status, and due date.' },
        { name: 'Delegated To Me', description: 'Tasks and approvals delegated to me by others (the original owner), with source details.' },
        { name: 'Delegation Timeline', description: 'Timeline showing when delegations were made, accepted, and completed or returned.' },
        { name: 'Recall Button', description: 'Return a delegated item to the original owner if the delegate cannot complete it.' },
      ]}
      tabs={['Delegated By Me', 'Delegated To Me', 'Completed Delegations']}
      features={[
        'Full delegation chain tracking',
        'Recall delegation at any time',
        'Delegation expiry dates with automatic recall',
        'Email notification to delegate on assignment',
        'Delegation audit trail for compliance',
      ]}
      dataDisplayed={[
        'Task/approval title and type',
        'Original owner and current delegate',
        'Delegation date and expiry date',
        'Current status (pending, in-progress, completed)',
        'Delegation reason/notes',
      ]}
      userActions={[
        'View all tasks delegated to others',
        'Recall a delegation back to self',
        'Monitor progress of delegated items',
        'Accept or decline items delegated to you',
        'Mark delegated-to-me items complete',
        'Extend delegation period',
      ]}
      relatedPages={[
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'Team Tasks', href: '/tasks-approvals/management/team-tasks' },
        { label: 'Delegation Rules', href: '/automation/approvals-governance/delegation-rules' },
      ]}
    />
  )
}

