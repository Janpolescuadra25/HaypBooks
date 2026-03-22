'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxCalendarPage() {
  return (
    <PageDocumentation
      title="Tax Calendar"
      module="TAXES"
      breadcrumb="Taxes / Tax Center / Tax Calendar"
      purpose="Tax Calendar provides a full-year visual calendar displaying every tax filing, payment, and remittance deadline applicable to the business based on its registered tax types and jurisdictions. The calendar synchronizes with the filing schedule and updates automatically as new obligations are registered or completed. Teams can export the calendar to external scheduling tools or print it for physical compliance tracking."
      components={[
        { name: 'Annual Calendar Grid', description: '12-month grid calendar with color-coded markers on each deadline date per tax type.' },
        { name: 'Tax Type Legend', description: 'Color-coded legend mapping each tax type (VAT, CWT, Income Tax, etc.) to its calendar marker color.' },
        { name: 'Event Detail Tooltip', description: 'Hover tooltip on each deadline showing obligation name, amount estimate, and preparation status.' },
        { name: 'List View Toggle', description: 'Switch between calendar grid and chronological list view for day-by-day obligation tracking.' },
        { name: 'Export/Sync Controls', description: 'Options to export calendar to PDF, iCal (.ics) file, or sync to Google Calendar or Outlook.' },
      ]}
      tabs={['Annual Calendar', 'List View', 'By Tax Type']}
      features={[
        'Full-year tax calendar with all filing and payment deadlines',
        'Color-code deadlines by tax type for quick visual identification',
        'Hover to preview obligation details on any calendar date',
        'Switch between grid and list views',
        'Export calendar to PDF, iCal, or external calendar apps',
        'Auto-populate calendar from registered tax types and jurisdictions',
      ]}
      dataDisplayed={[
        'Deadline date per tax obligation',
        'Tax type and authority for each deadline',
        'Preparation/filing completion status',
        'Estimated amount due per deadline',
        'Upcoming deadlines in next 30/60/90 days',
      ]}
      userActions={[
        'View full-year tax calendar',
        'Click deadline for obligation details',
        'Export calendar to PDF or iCal',
        'Sync calendar to Google Calendar or Outlook',
        'Toggle between grid and list view',
      ]}
    />
  )
}

