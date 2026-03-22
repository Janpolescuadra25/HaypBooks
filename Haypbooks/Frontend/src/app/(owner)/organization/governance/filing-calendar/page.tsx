'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Filing Calendar"
      module="ORGANIZATION"
      breadcrumb="Organization / Governance / Filing Calendar"
      purpose="The Filing Calendar tracks all statutory and regulatory filing deadlines across all legal entities and jurisdictions. It includes BIR tax filings, SEC annual reports, business permit renewals, LGU filings, labor compliance deadlines, and other regulatory submission dates. Each deadline is color-coded by urgency and links to the relevant filing page or document."
      components={[
        { name: 'Calendar View', description: 'Month calendar showing all filing deadlines color-coded by: Tax (red), Corporate (blue), Labor (green), Permits (amber).' },
        { name: 'Deadline List', description: 'Table of upcoming deadlines sorted by date with entity, filing type, jurisdiction, and status.' },
        { name: 'Entity Filter', description: 'Filter deadlines by legal entity, jurisdiction, filing category, or time horizon (next 30/60/90 days).' },
        { name: 'Add Custom Deadline', description: 'Add custom filing deadlines not in the system for entity-specific regulatory requirements.' },
        { name: 'Reminder Settings', description: 'Configure how many days in advance to send email/system alerts for each deadline category.' },
      ]}
      tabs={['Calendar View', 'List View', 'Overdue', 'Upcoming', 'Completed']}
      features={[
        'Pre-loaded BIR, SEC, LGU, and labor deadlines for PH',
        'Multi-entity deadline tracking',
        'Color-coded urgency (overdue, <7 days, <30 days, future)',
        'Configurable advance reminders',
        'Custom deadline support for entity-specific requirements',
        'Link deadlines to filing pages or document uploads',
      ]}
      dataDisplayed={[
        'Filing deadline dates by entity and type',
        'Days remaining or overdue per deadline',
        'Filing type (Tax / Corporate / Labor / Permit)',
        'Responsible party assignment',
        'Filing status (pending / filed / late)',
        'Link to relevant module page',
      ]}
      userActions={[
        'View upcoming deadlines on calendar',
        'Mark a deadline as filed/completed',
        'Add a custom deadline',
        'Assign responsible party to a deadline',
        'Configure advance reminder timing',
        'Export deadline list to PDF or CSV',
      ]}
      relatedPages={[
        { label: 'Tax Calendar', href: '/taxes/tax-center/tax-calendar' },
        { label: 'PH Tax Filing Deadlines', href: '/philippine-tax/tax-calendar/filing-deadlines' },
        { label: 'Document Storage', href: '/organization/governance/document-storage' },
        { label: 'Compliance Reports', href: '/compliance/reporting/compliance-reports' },
      ]}
    />
  )
}

