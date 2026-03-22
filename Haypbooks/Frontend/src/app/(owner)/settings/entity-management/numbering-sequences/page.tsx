'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function NumberingSequencesPage() {
  return (
    <PageDocumentation
      title="Numbering Sequences"
      module="SETTINGS"
      breadcrumb="Settings / Entity Management / Numbering Sequences"
      purpose="Numbering Sequences defines the auto-numbering format and counters for all transaction documents — invoices, bills, purchase orders, receipts, and journal entries. Customizable prefixes, suffixes, and padding allow businesses to adopt their own document numbering convention for branding or regulatory compliance. Sequences can be reset at year-start or run continuously across fiscal years."
      components={[
        { name: 'Sequence List Table', description: 'Table of all document types with their current prefix, format pattern, last number, and next number.' },
        { name: 'Format Editor', description: 'Inline editor to set prefix, suffix, digit padding, and separator for each document sequence.' },
        { name: 'Reset on Year Start', description: 'Toggle per sequence to reset the counter to 1 at the beginning of each new fiscal year.' },
        { name: 'Manual Override Field', description: 'Admin-only field to manually set the next number in a sequence when correction is needed.' },
        { name: 'Preview Number Badge', description: 'Live preview showing what the next generated document number will look like with current settings.' },
      ]}
      tabs={['Sales Documents', 'Purchase Documents', 'Journal Entries', 'Other Documents']}
      features={[
        'Configure prefix, suffix, and digit padding for every document type',
        'Set sequences to auto-increment or reset at fiscal-year start',
        'Preview the next generated number before saving changes',
        'Manually override the next sequence number for corrections',
        'Prevent duplicate numbers with system-level uniqueness enforcement',
        'Apply different number sequences per branch or entity',
      ]}
      dataDisplayed={[
        'Document type and current sequence format',
        'Last assigned number and next upcoming number',
        'Year-reset toggle status',
        'Sequence start date',
        'Number of documents generated year-to-date for each type',
      ]}
      userActions={[
        'Edit prefix, suffix, or padding for any document type',
        'Toggle year-start counter reset',
        'Manually set next sequence number',
        'Preview generated number format',
        'Save and apply sequence changes',
      ]}
    />
  )
}

