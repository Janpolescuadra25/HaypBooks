'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Employee List"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Employees / Employee List"
      purpose="The Employee List is the master directory of all employees in the organization. Each employee record contains personal details, employment classification, department, position, employment date, compensation, benefits enrollment, government ID numbers (SSS, PhilHealth, HDMF/Pag-IBIG, TIN for Philippines), and banking details for payroll credit. The employee master is the foundation of the payroll module — all payroll runs, leave tracking, government remittances, and compliance reporting are driven by this data."
      components={[
        { name: 'Employee Directory Table', description: 'All employees with name, employee ID, department, position, employment type (regular/probationary/contractual), hire date, and status (active/on leave/resigned).' },
        { name: 'Employee Profile Card', description: 'Complete employee record: personal info, emergency contacts, government IDs, bank details, compensation, benefits, and attachments (201 file).' },
        { name: 'Status Badges', description: 'Color-coded: Active (green), On Probation (amber), On Leave (blue), Resigned/Terminated (red).' },
        { name: 'Headcount Summary', description: 'Quick stats: regular, probationary, contractual, per department, per location.' },
        { name: '201 File Attachments', description: 'Upload and manage employee 201 file documents: contract, NBI clearance, diploma, TIN forms, health certs.' },
      ]}
      tabs={['All Employees', 'Active', 'Probationary', 'On Leave', 'Resigned']}
      features={[
        'Comprehensive employee master record management',
        'Government ID storage for compliant reporting (SSS, PhilHealth, HDMF, TIN)',
        'Bank details for payroll credit management',
        '201 file document storage per employee',
        'Employment type and department classification',
        'Headcount analytics by department',
        'Bulk employee import from CSV/Excel',
      ]}
      dataDisplayed={[
        'All employees with department and position',
        'Employment type distribution',
        'Hire date and tenure',
        'Government ID completion status',
        'Payroll bank details status',
        'Headcount by department',
      ]}
      userActions={[
        'Add a new employee',
        'Update employee personal or compensation details',
        'Upload 201 file documents',
        'Update government ID numbers',
        'Change department or position',
        'Deactivate separated employee',
        'Export employee list',
      ]}
      relatedPages={[
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Leave Balances', href: '/payroll-workforce/leaves/leave-balances' },
        { label: 'Government Reports', href: '/payroll-workforce/compliance/government-reports' },
        { label: 'Salary Bands', href: '/payroll-workforce/compensation/salary-bands' },
      ]}
    />
  )
}

