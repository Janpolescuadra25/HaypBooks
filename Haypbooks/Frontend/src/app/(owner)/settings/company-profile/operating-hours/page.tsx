'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function OperatingHoursPage() {
  return (
    <PageDocumentation
      title="Operating Hours"
      module="SETTINGS"
      breadcrumb="Settings / Company Profile / Operating Hours"
      purpose="Operating Hours configures when your business is active, which affects scheduling features, automated notifications, and SLA tracking for customer-facing operations. Setting accurate business hours ensures that due-date calculations, follow-up reminders, and staff scheduling tools respect actual working days. Holidays and closures can also be defined to prevent system-generated tasks on non-business days."
      components={[
        { name: 'Weekly Hours Grid', description: 'Day-by-day grid to set open/closed status and start/end times for each day of the week.' },
        { name: 'Time Zone Selector', description: 'Dropdown to set the primary business time zone, affecting timestamps on all system events.' },
        { name: 'Holiday Calendar', description: 'Date picker to mark public holidays, company-wide closures, and special event days.' },
        { name: 'Multi-Location Hours', description: 'Toggle to configure different operating hours for different office or store locations.' },
        { name: 'Service Hours vs. Admin Hours', description: 'Separate time blocks distinguishing customer service availability from internal admin hours.' },
      ]}
      tabs={['Weekly Schedule', 'Holidays & Closures', 'Time Zone', 'Locations']}
      features={[
        'Configure day-by-day operating hours for the full week',
        'Set company time zone for consistent timestamp display',
        'Define public holidays and custom company closure dates',
        'Add separate hours for multiple office locations',
        'Distinguish customer service hours from internal working hours',
        'Integrate operating hours with scheduling and reminder modules',
      ]}
      dataDisplayed={[
        'Day-by-day open/closed status and hours',
        'Primary business time zone',
        'Upcoming holidays and closure dates',
        'Location-specific hour overrides',
        'Effective date of last hours update',
      ]}
      userActions={[
        'Set or update daily operating hours',
        'Add or remove holidays from the calendar',
        'Change the company time zone',
        'Configure hours for individual locations',
        'Save and apply hours to scheduling features',
      ]}
    />
  )
}

