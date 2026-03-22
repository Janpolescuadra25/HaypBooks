'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function RolesPermissionsPage() {
  return (
    <PageDocumentation
      title="Roles & Permissions"
      module="SETTINGS"
      breadcrumb="Settings / Users & Security / Roles & Permissions"
      purpose="Roles & Permissions defines the access control structure for the organization by creating named roles with specific module-level and action-level permissions. Each user is assigned one or more roles, and their access to view, create, edit, delete, approve, or export records is governed entirely by those role definitions. This page lets admins design least-privilege access structures that protect sensitive data while enabling team productivity."
      components={[
        { name: 'Roles List', description: 'Left-panel list of all roles with user count, description, and system vs. custom designation.' },
        { name: 'Permission Matrix', description: 'Granular table with module rows and action columns (View, Create, Edit, Delete, Approve, Export) with toggles.' },
        { name: 'Role Inheritance', description: 'Optional config to make a role inherit all permissions from a parent role, then add restrictions or additions.' },
        { name: 'Users Assigned Panel', description: 'Tab showing all users currently assigned to the selected role.' },
        { name: 'Clone Role Button', description: 'One-click action to duplicate an existing role as a starting point for a new variation.' },
      ]}
      tabs={['Role List', 'Permission Matrix', 'Users Assigned', 'Audit Log']}
      features={[
        'Create unlimited custom roles with granular module and action permissions',
        'Use role inheritance to build tiered permission hierarchies',
        'Assign multiple roles to a single user for combined access',
        'Preview effective permissions for any user before saving',
        'Clone existing roles to quickly create similar access variants',
        'Track all role changes in built-in permission audit log',
      ]}
      dataDisplayed={[
        'Role name, description, and type (system/custom)',
        'Per-module, per-action permission toggles',
        'Number of users assigned to each role',
        'Inherited permissions from parent role',
        'Last modified date and user',
      ]}
      userActions={[
        'Create a new custom role',
        'Edit permission matrix for any role',
        'Set role inheritance from parent role',
        'Clone an existing role',
        'Assign or remove users from a role',
        'View permission audit log',
      ]}
    />
  )
}

