'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Roles & Permissions"
      module="SETTINGS"
      breadcrumb="Settings / Users / Roles & Permissions"
      purpose="Roles & Permissions is the access control configuration tool for Haypbooks. Roles define what a user can see and do — from read-only reporting access to full system administration. Each role is a collection of permissions (view, create, edit, delete, approve) across all modules. The principle of least privilege should be applied: each role should have only the access needed for the job function. Custom roles can be created beyond the default roles (Admin, Accountant, Manager, Employee, Auditor, Read-Only)."
      components={[
        { name: 'Role Library', description: 'All configured roles with description, user count, and permission summary.' },
        { name: 'Permission Matrix Editor', description: 'For each role: module-by-module, function-by-function permission toggle (None/View/Create/Edit/Delete/Approve).' },
        { name: 'Role User Assignment', description: 'View which users are assigned each role and reassign from this screen.' },
        { name: 'Default Role Templates', description: 'System-default roles: Owner, Admin, Accountant, Accounts Payable, Accounts Receivable, Manager, Employee, Read-Only Auditor.' },
        { name: 'Role Change Audit', description: 'Log of permission changes: who changed what permission for which role and when.' },
      ]}
      tabs={['Roles', 'Permission Matrix', 'User Assignment', 'Audit Log']}
      features={[
        'Role-based access control (RBAC)',
        'Module and function-level permission control',
        'Custom role creation',
        'Default role templates for common job functions',
        'Permission change audit log',
        'Role user count and affected user notifications',
      ]}
      dataDisplayed={[
        'All roles with description and permission summary',
        'Per-role: permission matrix by module',
        'Users assigned to each role',
        'Permission change history',
      ]}
      userActions={[
        'Create a new custom role',
        'Edit permissions for an existing role',
        'Clone a role as a basis for a new one',
        'Assign users to a role',
        'View permission changes audit log',
        'Export permissions matrix for review',
      ]}
      relatedPages={[
        { label: 'User Management', href: '/settings/users/user-management' },
        { label: 'Security Settings', href: '/settings/security/security-settings' },
        { label: 'Audit Trails', href: '/automation/monitoring/audit-trails' },
      ]}
    />
  )
}

