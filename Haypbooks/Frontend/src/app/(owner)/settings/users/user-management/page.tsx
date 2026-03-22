'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="User Management"
      module="SETTINGS"
      breadcrumb="Settings / Users / User Management"
      purpose="User Management is the administrative page for managing all Haypbooks user accounts. Here, company administrators can invite new users, assign or change user roles, update profiles, reset passwords, disable inactive users, and audit user activity. Each user has one primary role (or multiple roles for advanced access) and is associated with a legal entity or entities. Security best practice requires keeping the user list current — immediately deactivating accounts of anyone who leaves the company."
      components={[
        { name: 'User Directory', description: 'All user accounts with name, email, role(s), entity access, last login, and status (active/inactive).' },
        { name: 'Invite User Form', description: 'Add a new user: enter email, assign role, select accessible entities, and send invitation email.' },
        { name: 'User Detail', description: 'Manage an individual user: update name, role changes, entity access, and account status.' },
        { name: 'Login Activity Log', description: 'Per-user login history: date, time, IP address, and device/browser.' },
        { name: 'Bulk Actions', description: 'Deactivate multiple users, change roles in bulk, or export user list.' },
      ]}
      tabs={['All Users', 'Active', 'Pending Invitation', 'Inactive', 'Login Activity']}
      features={[
        'User invitation via email',
        'Role assignment and change',
        'Multi-entity access management',
        'Account deactivation',
        'Login activity auditing',
        'User list export for audit',
        'Single Sign-On (SSO) setup if applicable',
      ]}
      dataDisplayed={[
        'All users with role and entity access',
        'Active vs. inactive users',
        'Last login per user',
        'Pending invitation status',
        'Users with no recent login (dormant accounts)',
      ]}
      userActions={[
        'Invite a new user',
        'Change user role',
        'Disable a user account',
        'Reset user password',
        'View user login history',
        'Export user list',
        'Update entity access for a user',
      ]}
      relatedPages={[
        { label: 'Roles & Permissions', href: '/settings/users/roles-permissions' },
        { label: 'Security Settings', href: '/settings/security/security-settings' },
        { label: 'Two-Factor Auth', href: '/settings/security/two-factor' },
        { label: 'Security Log', href: '/settings/security/security-log' },
      ]}
    />
  )
}

