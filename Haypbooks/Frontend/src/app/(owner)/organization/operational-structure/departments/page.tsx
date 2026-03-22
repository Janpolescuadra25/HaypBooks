'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Departments"
      module="ORGANIZATION"
      breadcrumb="Organization / Operational Structure / Departments"
      purpose="Departments defines the cost center structure for the organization. Each department is a financial tracking dimension that can be applied to transactions (expenses, payroll, bills) to enable per-department financial reporting. Budget allocation, cost center P&L, and headcount reporting are all organized around departments."
      components={[
        { name: 'Department List', description: 'All departments with department code, name, parent department (for hierarchy), and department head.' },
        { name: 'Department Detail', description: 'Full department profile: assigned GL cost center account, budget links, head count, and transaction history.' },
        { name: 'Add Department Form', description: 'Create a new department with code, name, parent, department head, and default cost center account.' },
        { name: 'Budget Summary', description: 'Current period budget vs. actual for each department with variance highlight.' },
      ]}
      tabs={['All Departments', 'Active', 'Hierarchy View', 'Budget Summary']}
      features={[
        'Department as cost center dimension',
        'Hierarchical department structure for roll-up reporting',
        'Budget allocation per department',
        'Headcount tracking per department',
        'Department-level P&L reporting',
        'Restrict transaction coding to active departments',
      ]}
      dataDisplayed={[
        'Department codes and names',
        'Department hierarchy (parent/child)',
        'Department head assignment',
        'Headcount: budgeted vs. actual',
        'Current period budget vs. actual spend',
        'Total expense by department trend',
      ]}
      userActions={[
        'Create a new department',
        'Edit department name, code, or head',
        'Set parent department for hierarchy',
        'Link budget to department',
        'Deactivate inactive departments',
        'Export department list',
      ]}
      relatedPages={[
        { label: 'Locations & Divisions', href: '/organization/operational-structure/locations-divisions' },
        { label: 'Org Chart', href: '/organization/operational-structure/org-chart' },
        { label: 'Budgets', href: '/accounting/planning/budgets' },
        { label: 'Classes & Tags', href: '/organization/operational-structure/classes-tags' },
      ]}
    />
  )
}

