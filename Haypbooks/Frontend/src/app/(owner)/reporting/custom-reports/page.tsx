'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Custom Reports'
      module='REPORTING'
      breadcrumb='Reporting / Custom Reports'
      purpose='Flexible report builder that allows users to design their own reports by selecting data fields, applying filters and groupings, choosing visualizations, and saving reports for future use. Empowers finance teams to answer unique business questions without waiting for IT support.'
      components={[
        { name: 'Field Selector', description: 'Drag-and-drop interface to select data fields from available data sources' },
        { name: 'Filter Builder', description: 'Advanced filter conditions with AND/OR logic, date ranges, and value lists' },
        { name: 'Grouping and Aggregation', description: 'Group data by any field and apply sum, count, average, min, max aggregations' },
        { name: 'Visualization Picker', description: 'Choose from table, bar chart, line chart, pie chart, or KPI card display' },
        { name: 'Report Save & Share', description: 'Save custom report with name and description and share with specific users or roles' },
        { name: 'Cross-Module Data Joins', description: 'Combine data from multiple modules like sales, expenses, and payroll in one report' },
      ]}
      tabs={['Report Builder', 'My Reports', 'Shared Reports', 'Templates']}
      features={['Visual drag-and-drop report builder', 'Cross-module data source joining', 'Advanced filter with AND/OR logic', 'Multiple visualization types', 'Save, share, and schedule custom reports', 'Export in PDF, Excel, and CSV', 'Custom report templates']}
      dataDisplayed={['Selected data fields and labels', 'Applied filter conditions', 'Grouping and aggregation rules', 'Visualization type selected', 'Report owner and sharing settings', 'Schedule configuration', 'Last run date and result count']}
      userActions={['Create new custom report', 'Select data fields from sources', 'Apply filters and groupings', 'Choose visualization type', 'Save and name the report', 'Share with team members', 'Schedule automated execution']}
      relatedPages={[
        { label: 'Standard Reports', href: '/reporting/standard-reports' },
        { label: 'Saved Views', href: '/reporting/saved-views' },
        { label: 'Performance Center', href: '/reporting/performance-center' },
      ]}
    />
  )
}

