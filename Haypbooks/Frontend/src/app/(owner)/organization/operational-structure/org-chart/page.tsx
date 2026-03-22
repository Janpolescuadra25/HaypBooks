'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Org Chart"
      module="ORGANIZATION"
      breadcrumb="Organization / Operational Structure / Org Chart"
      purpose="The Org Chart provides a visual representation of the organization's management hierarchy and reporting structure. It displays all employees, their positions, department assignments, and reporting lines in an interactive tree diagram. It helps users understand organizational structure, find who reports to whom, and identify decision-making chains relevant to approval workflows."
      components={[
        { name: 'Interactive Hierarchy Tree', description: 'Expandable/collapsible org chart tree with profile photos, names, titles, and department color coding.' },
        { name: 'Search Bar', description: 'Search for any employee by name or title to highlight them in the chart.' },
        { name: 'Detail Card', description: 'Click any node to see full employee profile: position, department, location, contact info, and direct reports.' },
        { name: 'Export Options', description: 'Export org chart as PDF or image for presentations and documentation.' },
        { name: 'View Filters', description: 'Filter to show a single department or collapse to specific hierarchy levels.' },
      ]}
      tabs={['Full Org', 'By Department', 'By Location']}
      features={[
        'Interactive visual hierarchy display',
        'Employee search and highlight',
        'Department-level collapse/expand',
        'Export to PDF or image',
        'Auto-updated from HR/workforce module',
        'Click through to employee profile',
      ]}
      dataDisplayed={[
        'All employees with name and profile photo',
        'Job title and department',
        'Reporting lines and management hierarchy',
        'Direct report count per manager',
        'Location assignment',
      ]}
      userActions={[
        'Search for an employee in the chart',
        'Expand or collapse department branches',
        'Click employee node to view profile',
        'Filter to specific department view',
        'Export org chart to PDF or image',
        'Print org chart',
      ]}
      relatedPages={[
        { label: 'Departments', href: '/organization/operational-structure/departments' },
        { label: 'Employees', href: '/payroll-workforce/workforce/employees' },
        { label: 'Job Positions', href: '/payroll-workforce/workforce/job-positions' },
      ]}
    />
  )
}

