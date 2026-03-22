'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function ClosingDateProtectionPage() {
  return (
    <PageDocumentation
      title="Closing Date Protection"
      module="SETTINGS"
      breadcrumb="Settings / Accounting Preferences / Closing Date Protection"
      purpose="Closing Date Protection prevents backdated edits to accounting records after a period has been formally closed, protecting the integrity of finalized financial statements. Administrators set a closing date and optional password so that any transaction entered before that date requires elevated authorization. This control is essential for audit readiness and compliance with accounting standards."
      components={[
        { name: 'Closing Date Picker', description: 'Date selector to set the books-closed boundary; all transactions on or before this date are locked.' },
        { name: 'Protection Password Field', description: 'Optional password field so that authorized users can unlock the period with a supervisor-level override.' },
        { name: 'Override Audit Log', description: 'Table showing every instance where the closing date was bypassed, including user, timestamp, and reason.' },
        { name: 'Warning Configuration', description: 'Toggles to set whether users see a warning, are blocked entirely, or must enter a password to post past the close.' },
        { name: 'Period Status Indicators', description: 'Visual calendar showing which months are open, locked, or partially restricted.' },
      ]}
      tabs={['Protection Settings', 'Override History', 'Period Calendar']}
      features={[
        'Set a company-wide closing date to lock all prior-period transactions',
        'Require a password for any override attempt, creating an approval checkpoint',
        'Full audit trail of every closing date bypass with user and reason captured',
        'Configure warning level: informational warning, password gate, or hard block',
        'View period-by-period lock status on a rolling calendar',
        'Adjust closing date forward as each new period is finalized',
      ]}
      dataDisplayed={[
        'Current closing date and last modified timestamp',
        'Override attempts: user, date/time, and reason provided',
        'Period status calendar (open, locked, reviewing)',
        'Password protection status (enabled/disabled)',
        'Number of transactions locked vs. open',
      ]}
      userActions={[
        'Set or update the accounting closing date',
        'Enable or disable password protection for overrides',
        'Change or reset the closing date override password',
        'Review override audit log',
        'Unlock a specific period with administrator password',
      ]}
    />
  )
}

