'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Shortcuts"
      module="HOME"
      breadcrumb="Home / Shortcuts"
      purpose="The Shortcuts page provides a personalized quick-access hub that gives each user instant one-click navigation to their most frequently used pages, recent records, and common actions. It reduces navigation friction by surfacing the exact pages and actions each user needs most, configurable per individual preference. Think of it as a customizable command center tailored to each user's daily workflow."
      components={[
        { name: 'Pinned Shortcuts Grid', description: 'Drag-and-drop tile grid of user-pinned shortcuts to any page in the system. Each tile shows icon, name, and module color.' },
        { name: 'Recent Records', description: 'Automatically populated list of the 10 most recently viewed or edited records across all modules (invoices, bills, customers, etc.).' },
        { name: 'Frequently Used Actions', description: 'Quick-action buttons for the top 5 most-performed actions based on usage history (e.g., "New Invoice", "Record Payment").' },
        { name: 'Module Quick Links', description: 'Navigation shortcuts organized by module with a collapsed/expanded toggle per module.' },
        { name: 'Search Bar', description: 'Global search integration with recent search history and smart suggestions.' },
      ]}
      tabs={['My Shortcuts', 'Recent Activity', 'All Modules']}
      features={[
        'Drag-and-drop shortcut tile reordering',
        'Pin any page or module to the shortcuts grid',
        'Auto-populates recently visited pages',
        'Frequently-used action detection from usage history',
        'Per-user configuration stored to profile',
        'Reset to defaults option',
      ]}
      dataDisplayed={[
        'User-pinned shortcut tiles with module badge',
        'Last 10 recently viewed records with record type and date',
        'Top 5 frequently used actions with usage count',
        'Quick links to all 21 top-level modules',
        'Recent global search queries',
      ]}
      userActions={[
        'Pin a page as a shortcut from any page in the system',
        'Drag and reorder shortcut tiles',
        'Remove pinned shortcuts',
        'Click any shortcut to navigate directly',
        'Search globally from the shortcuts search bar',
        'Reset shortcuts to system defaults',
      ]}
      relatedPages={[
        { label: 'Dashboard', href: '/home/dashboard' },
        { label: 'Business Health', href: '/home/business-health' },
        { label: 'Notifications', href: '/home/notifications' },
      ]}
    />
  )
}

