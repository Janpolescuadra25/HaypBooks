'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CountryTemplatesPage() {
  return (
    <PageDocumentation
      title="Country Templates"
      module="TAXES"
      badge="ENT"
      breadcrumb="Taxes / Tax Studio / Country Templates"
      purpose="Country Templates provides out-of-the-box pre-configured tax setups for specific countries, bundling the correct tax types, rates, codes, agencies, and filing schedules for each jurisdiction. Businesses entering a new market can apply a country template to instantly provision the complete tax setup for that country rather than building from scratch. Templates are maintained by Haypbooks and updated when country tax rules change."
      components={[
        { name: 'Template Library Grid', description: 'Cards of all available country templates with flag, country name, tax system summary, and last updated date.' },
        { name: 'Template Preview', description: 'Detailed preview showing all tax types, rates, codes, and forms included in the template.' },
        { name: 'Import Wizard', description: 'Step-by-step wizard to apply a country template to the current entity, with merge or replace option.' },
        { name: 'Customization Post-Import', description: 'Guided workflow to customize the imported template to match any country-specific variations.' },
        { name: 'Update Notification', description: 'Alert banner when Haypbooks publishes an update to a country template already in use.' },
      ]}
      tabs={['Template Library', 'Applied Templates', 'Updates Available']}
      features={[
        'Browse country-specific pre-built tax configuration templates',
        'Preview all components included in each template before import',
        'Apply template with merge vs. replace import options',
        'Customize template after import for local variations',
        'Receive notifications when a template is updated by Haypbooks',
        'Track which template version is active per entity',
      ]}
      dataDisplayed={[
        'Country name and tax system type',
        'Template components included (types, rates, codes, forms)',
        'Template version and last updated date',
        'Import status per entity',
        'Pending updates for applied templates',
      ]}
      userActions={[
        'Browse and preview country templates',
        'Apply a country template to the entity',
        'Choose merge or replace import mode',
        'Customize imported template',
        'Apply available template updates',
      ]}
    />
  )
}

