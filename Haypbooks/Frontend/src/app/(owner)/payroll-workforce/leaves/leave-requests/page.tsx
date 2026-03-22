'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Leave Requests"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Leaves / Leave Requests"
      purpose="Leave Requests is the employee self-service leave filing page and the manager leave approval interface. Employees submit leave applications (Vacation Leave, Sick Leave, Emergency Leave, Maternity/Paternity Leave) with the date range, leave type, reason, and optional supporting documents. Managers receive notification and approve or deny the request. Approved leaves automatically deduct from the employee's leave balance and are reflected in attendance records for payroll computation."
      components={[
        { name: 'Leave Application Form', description: 'File a leave: select leave type, enter date range, reason, and upload medical certificate (for sick leave).' },
        { name: 'My Leave Status', description: 'Employee\'s submitted leave requests with approval status: pending, approved, rejected.' },
        { name: 'Manager Approval Queue', description: 'All pending leave requests for the manager\'s direct reports.' },
        { name: 'Leave Calendar', description: 'Team calendar showing approved leaves — helps identify conflicts when planning resources.' },
        { name: 'Leave Balance Checker', description: 'Available balance per leave type before submitting the request.' },
      ]}
      tabs={['My Requests', 'Apply for Leave', 'My Team (Manager)', 'Leave Calendar', 'Approval History']}
      features={[
        'Employee leave filing via self-service',
        'Multiple leave types (VL, SL, ML, PL, etc.)',
        'Manager approval workflow with email notification',
        'Leave balance deduction on approval',
        'Team leave calendar for resource planning',
        'Medical certificate upload for sick leave',
        'Leave integration with payroll (unpaid leave deduction)',
      ]}
      dataDisplayed={[
        'Employee leave request history',
        'Leave balance per type',
        'Pending team leave requests (manager view)',
        'Approved leaves calendar',
        'Employees currently on leave',
      ]}
      userActions={[
        'File a leave request',
        'Attach supporting document',
        'Check leave balance before filing',
        'Cancel a pending or approved leave',
        'Approve or deny a team member\'s leave',
        'View team leave calendar',
      ]}
      relatedPages={[
        { label: 'Leave Balances', href: '/payroll-workforce/leaves/leave-balances' },
        { label: 'Leave Policy', href: '/payroll-workforce/leaves/leave-policy' },
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Employee List', href: '/payroll-workforce/employees/employee-list' },
      ]}
    />
  )
}

