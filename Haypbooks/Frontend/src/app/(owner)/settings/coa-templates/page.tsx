'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function CoaTemplatesPage() {
  return (
    <PageDocumentation
      title="Chart of Accounts Templates"
      module="SETTINGS"
      breadcrumb="Settings / Chart of Accounts Templates"
      purpose="Chart of Accounts Templates provides a library of pre-built account structures tailored for different industries (retail, services, manufacturing, non-profit) and regions. New companies can import a template to instantly populate their chart of accounts instead of building from scratch. Templates are fully customizable after import so they can be adjusted to match specific business needs."
      components={[
        { name: 'Template Library Grid', description: 'Card grid of available CoA templates with industry tag, region, account count, and preview option.' },
        { name: 'Template Preview Modal', description: 'Full-screen modal showing all accounts in the template organized by category before import.' },
        { name: 'Industry/Region Filter', description: 'Filter templates by industry vertical and country/region to find the most relevant match.' },
        { name: 'Import Wizard', description: 'Step-by-step wizard to merge or replace the current chart of accounts with the selected template.' },
        { name: 'Custom Template Upload', description: 'Form to upload your own CoA template in CSV format for reuse across multiple entities.' },
      ]}
      tabs={['Template Library', 'My Templates', 'Import History']}
      features={[
        'Browse pre-built CoA templates by industry and region',
        'Preview all accounts in a template before committing to import',
        'Import a template to automatically populate chart of accounts',
        'Choose between merging new accounts or fully replacing current CoA',
        'Upload and share custom templates across company entities',
        'View import history to track which template was applied and when',
      ]}
      dataDisplayed={[
        'Template name, industry, and region',
        'Number of accounts in each template',
        'Account categories included (Assets, Liabilities, Equity, Revenue, Expense)',
        'Last updated date of template',
        'Import history: date, user, and outcome',
      ]}
      userActions={[
        'Browse and preview available CoA templates',
        'Import a template to populate chart of accounts',
        'Upload a custom CoA template',
        'Filter templates by industry or region',
        'Review past template imports',
      ]}
    />
  )
}

