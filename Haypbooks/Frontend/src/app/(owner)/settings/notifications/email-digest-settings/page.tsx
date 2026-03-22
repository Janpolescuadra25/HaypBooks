'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function EmailDigestSettingsPage() {
  return (
    <PageDocumentation
      title="Email Digest Settings"
      module="SETTINGS"
      breadcrumb="Settings / Notifications / Email Digest Settings"
      purpose="Email Digest Settings controls how and when the system aggregates notifications and sends summary emails to users rather than sending individual alerts for every event. Digests reduce notification fatigue by batching related activity into scheduled summaries — daily, weekly, or custom intervals. Each user or the administrator can configure which categories of updates appear in each digest."
      components={[
        { name: 'Digest Schedule Picker', description: 'Controls for digest frequency: daily (with time of day), weekly (with day of week), or custom interval.' },
        { name: 'Category Toggles', description: 'Per-category switches to include/exclude approvals, payments received, overdue items, system alerts in each digest.' },
        { name: 'Recipient Management', description: 'Manage which users receive each digest type, with ability to add or remove recipients.' },
        { name: 'Preview Digest Button', description: 'Sends a sample digest email to the logged-in admin to review layout and content before enabling.' },
        { name: 'Opt-Out Controls', description: 'Per-user ability to opt out of specific digest types from within their profile settings.' },
      ]}
      tabs={['Schedule & Frequency', 'Content Categories', 'Recipients', 'Preview']}
      features={[
        'Set digest delivery schedule: daily, weekly, or custom interval',
        'Choose which activity categories appear in each digest',
        'Add or remove recipients for each digest type',
        'Preview a sample digest email before activating',
        'Allow users to self-manage their own digest preferences',
        'Disable digests entirely per user without disabling real-time alerts',
      ]}
      dataDisplayed={[
        'Digest types (daily summary, weekly report, etc.)',
        'Scheduled delivery time and frequency',
        'Active recipient list per digest',
        'Category inclusions per digest',
        'Last digest sent date and recipient count',
      ]}
      userActions={[
        'Configure digest frequency and delivery time',
        'Toggle activity categories on or off',
        'Add or remove digest recipients',
        'Send a preview digest email',
        'Disable digest for specific users',
      ]}
    />
  )
}

