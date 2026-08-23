import { Home, CheckSquare, FolderKanban, Settings, UserCog } from 'lucide-react'
import { NavSection } from './ownerNavTypes'

export const navigationData: NavSection[] = [
  {
    title: 'HOME',
    label: 'HOME',
    icon: Home,
    items: [
      { title: 'Dashboard', path: '/home/dashboard' },
      { title: 'Business Health', path: '/home/business-health' },
      { title: 'Business Performance', path: '/home/performance' },
      { title: 'Shortcuts', path: '/home/shortcuts' },
      { title: 'Setup Checklist', path: '/home/setup-center' },
      { title: 'Notifications', path: '/home/notifications' },
      { title: 'Audit Trail', path: '/activity' },
    ],
  },
  {
    title: 'TASKS',
    label: 'TASKS',
    icon: CheckSquare,
    groups: [
      {
        title: 'My Work',
        items: [
          { title: 'My Tasks', path: '/tasks-approvals/my-work/my-tasks' },
          { title: 'My Approvals', path: '/tasks-approvals/my-work/my-approvals' },
          { title: 'My Exceptions', path: '/tasks-approvals/my-work/my-exceptions' },
          { title: 'Overdue Items', path: '/tasks-approvals/my-work/overdue-items' },
          { title: 'Calendar', path: '/tasks-approvals/my-work/calendar' },
        ],
      },
      {
        title: 'Management',
        items: [
          { title: 'Team Tasks', path: '/tasks-approvals/management/team-tasks' },
          { title: 'Delegated Tasks', path: '/tasks-approvals/management/delegated-tasks' },
          { title: 'Approval Queue', path: '/tasks-approvals/management/approval-queue' },
          { title: 'Approval History', path: '/tasks-approvals/management/approval-history' },
          { title: 'Task Templates', path: '/tasks-approvals/management/task-templates' },
        ],
      },
    ],
  },
  {
    title: 'COLLABORATION',
    label: 'TEAM',
    icon: UserCog,
    groups: [
      {
        title: 'Communication',
        items: [
          { title: 'Client Requests', path: '/accountant-workspace/client-requests' },
        ],
      },
    ],
  },
  {
    title: 'APPS',
    label: 'APPS',
    icon: FolderKanban,
    groups: [
      {
        title: 'Integrations',
        items: [
          { title: 'App Marketplace', path: '/apps-integrations/discover/app-marketplace' },
          { title: 'Connected Apps', path: '/apps-integrations/connected-apps/installed-apps' },
          { title: 'Integration Logs', path: '/apps-integrations/my-integrations/integration-logs' },
        ],
      },
      {
        title: 'Developer',
        items: [
          { title: 'API Keys', path: '/apps-integrations/api/api-keys' },
          { title: 'Webhooks', path: '/apps-integrations/api/webhooks' },
          { title: 'Developer Sandbox', path: '/apps-integrations/developer-tools/developer-sandbox' },
        ],
      },
    ],
  },
  {
    title: 'SETTINGS',
    label: 'SETTINGS',
    icon: Settings,
    groups: [
      {
        title: 'Company Profile',
        items: [
          { title: 'Company Details', path: '/settings/company-profile/company-details' },
          { title: 'Fiscal Year Setup', path: '/settings/company-profile/fiscal-year-setup' },
          { title: 'Base Currency', path: '/settings/entity-management/base-currency' },
        ],
      },
      {
        title: 'Company Structure',
        items: [
          { title: 'Legal Entities', path: '/organization/entity-structure/legal-entities' },
          { title: 'Intercompany Transactions', path: '/organization/entity-structure/intercompany' },
          { title: 'Consolidation', path: '/organization/entity-structure/consolidation' },
          { title: 'Locations & Divisions', path: '/organization/operational-structure/locations-divisions' },
        ],
      },
      {
        title: 'Users & Security',
        items: [
          { title: 'User Management', path: '/settings/users-security/user-management' },
          { title: 'Roles & Permissions', path: '/settings/users-security/roles-permissions' },
          { title: 'Two-Factor Authentication', path: '/settings/users-security/two-factor-auth' },
        ],
      },
      {
        title: 'Preferences',
        items: [
          { title: 'Accounting Preferences', path: '/settings/accounting-preferences' },
          { title: 'Payment Terms', path: '/settings/payment-terms' },
          { title: 'Numbering Sequences', path: '/settings/entity-management/numbering-sequences' },
          { title: 'Custom Fields', path: '/settings/customization/custom-fields' },
        ],
      },
      {
        title: 'System',
        items: [
          { title: 'System Audit Log', path: '/settings/data-privacy/audit-log' },
          { title: 'Data Backup', path: '/settings/data-privacy/data-backup' },
          { title: 'Import Data', path: '/apps-integrations/imports/import-data' },
          { title: 'Export Data', path: '/apps-integrations/data-tools/export-data' },
        ],
      },
    ],
  },
]
