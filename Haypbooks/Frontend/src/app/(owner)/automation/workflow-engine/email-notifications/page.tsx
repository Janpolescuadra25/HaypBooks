'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Email Notifications"
      module="AUTOMATION"
      breadcrumb="Automation / Workflow Engine / Email Notifications"
      purpose="Email Notifications manages all automated email templates and delivery rules used across the platform. It covers both internal notifications (to staff) and external-facing emails (to customers and vendors). Users can customize subject lines, body content, branding, and delivery triggers for each notification type — from invoice delivery emails to payment reminders to approval request emails."
      components={[
        { name: 'Notification Template Library', description: 'All email notification types organized by category: Customer Emails, Vendor Emails, Internal Alerts, System Events.' },
        { name: 'Template Editor', description: 'Rich text email template editor with variable placeholders ({{customer_name}}, {{invoice_amount}}) and preview functionality.' },
        { name: 'Delivery Rules', description: 'Configure trigger conditions for each notification: when to send, to whom, and optional delay (e.g., send invoice 3 days after due date).' },
        { name: 'Send History', description: 'Log of all emails sent with recipient, template, delivery status (sent/failed/bounced), and timestamp.' },
        { name: 'Branding Settings', description: 'Configure email header logo, footer, color scheme, and reply-to address.' },
      ]}
      tabs={['Templates', 'Delivery Rules', 'Send History', 'Branding']}
      features={[
        'Customizable HTML email templates with variable placeholders',
        'Per-template delivery rule configuration',
        'Conditional sending logic (e.g., only if amount > threshold)',
        'Email branding with company logo and colors',
        'Test email sending before activating',
        'Delivery status tracking (sent/bounced/failed)',
        'Batch send event history log',
      ]}
      dataDisplayed={[
        'All email notification template names and types',
        'Delivery trigger event and conditions',
        'Last modified date and modified by',
        'Send history: recipient, date, status',
        'Open rate and bounce rate per template',
      ]}
      userActions={[
        'Edit an email template subject and body',
        'Add or remove variable placeholders',
        'Configure delivery trigger conditions',
        'Send a test email to preview',
        'Enable or disable a notification type',
        'View delivery history for a template',
        'Update email branding settings',
      ]}
      relatedPages={[
        { label: 'Workflow Builder', href: '/automation/workflow-engine/workflow-builder' },
        { label: 'Customer Invoice Emails', href: '/sales/settings/invoice-email-templates' },
        { label: 'Payment Reminders', href: '/sales/settings/payment-reminder-rules' },
        { label: 'System Alerts', href: '/settings/notifications/system-alerts' },
      ]}
    />
  )
}

