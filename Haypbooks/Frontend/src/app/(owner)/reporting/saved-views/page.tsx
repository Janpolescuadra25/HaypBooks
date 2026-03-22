'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Saved Views'
      module='REPORTING'
      breadcrumb='Reporting / Saved Views'
      purpose='Manages saved report configurations, filter presets, and custom views across all reporting modules. Users can save frequently used report parameters as named views for quick access, reducing repetitive configuration and enabling consistent reporting across the team.'
      components={[
        { name: 'Saved View Library', description: 'List of all saved report views with name, source report, creator, and last used date' },
        { name: 'Quick-Launch Button', description: 'One-click execution of any saved view with its pre-configured parameters' },
        { name: 'View Sharing Controls', description: 'Share saved views with individual users, teams, or the entire organization' },
        { name: 'View Edit Mode', description: 'Modify the filter parameters or visualization style of an existing saved view' },
        { name: 'Schedule Integration', description: 'Attach a delivery schedule to any saved view for automated reporting' },
      ]}
      tabs={['My Saved Views', 'Shared Views', 'Scheduled Views', 'Recently Used']}
      features={['Save report configurations as named views', 'One-click access to saved report configurations', 'Sharing with users, teams, or organization', 'Scheduled delivery tied to saved views', 'View usage tracking', 'Duplicate and modify views', 'Pin saved views to dashboard']}
      dataDisplayed={['Saved view name and description', 'Source report module', 'Creator and creation date', 'Last run date and frequency', 'Sharing scope', 'Schedule configuration', 'Filter parameters saved']}
      userActions={['Save current report as a new view', 'Run a saved view', 'Edit saved view parameters', 'Share with team', 'Schedule automated delivery', 'Duplicate and modify a view', 'Delete unused saved views']}
      relatedPages={[
        { label: 'Standard Reports', href: '/reporting/standard-reports' },
        { label: 'Custom Reports', href: '/reporting/custom-reports' },
        { label: 'Performance Center', href: '/reporting/performance-center' },
      ]}
    />
  )
}

