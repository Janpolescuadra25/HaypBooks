'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function UserManagementPage() {
  return (
    <PageDocumentation
      title="User Management"
      module="SETTINGS"
      breadcrumb="Settings / Users & Security / User Management"
      purpose="User Management is the primary administrative interface for inviting, configuring, and managing all user accounts within the organization. Administrators use this page to invite new users via email, assign roles, set module access, and deactivate or transfer accounts when employees leave. Access provisioning follows the principle of least privilege, and each user's history is tracked for compliance."
      components={[
        { name: 'Users Directory Table', description: 'Full table of all users with name, email, role(s), last login, and active/inactive status.' },
        { name: 'Invite User Form', description: 'Email-based invitation form with role pre-assignment and optional personal welcome message.' },
        { name: 'Role Assignment Panel', description: 'Multi-select role picker on each user record to assign one or more access roles.' },
        { name: 'Deactivation Workflow', description: 'Controlled offboarding flow: reassign open tasks, transfer ownership, then deactivate account.' },
        { name: 'Bulk Actions Toolbar', description: 'Select multiple users to bulk-assign roles, send reminders, or deactivate in one action.' },
      ]}
      tabs={['Active Users', 'Invited (Pending)', 'Deactivated Users']}
      features={[
        'Invite new users by email with pre-assigned roles',
        'Assign single or multiple roles for granular access control',
        'View all active, pending invitation, and deactivated users',
        'Deactivate user accounts with offboarding task reassignment',
        'Bulk role assignment for department-wide access changes',
        'Transfer record ownership before deactivating a user',
      ]}
      dataDisplayed={[
        'User name, email, and profile picture',
        'Assigned roles and last login date',
        'Account status (active, pending, deactivated)',
        'Date joined and invited by',
        'Two-factor authentication status',
      ]}
      userActions={[
        'Invite a new user via email',
        'Assign or change user roles',
        'Deactivate a user account',
        'Resend invitation to pending users',
        'Bulk-update roles for multiple users',
        'Transfer record ownership to another user',
      ]}
    />
  )
}

