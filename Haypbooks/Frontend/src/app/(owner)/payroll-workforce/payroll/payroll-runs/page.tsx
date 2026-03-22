'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payroll Runs"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll / Payroll Runs"
      purpose="Payroll Runs is the payroll processing engine. For each payroll cycle (semi-monthly or monthly, as configured), the system computes each employee's gross pay (basic salary + allowances + overtime + incentives), mandatory deductions (SSS, PhilHealth, HDMF, withholding tax), voluntary deductions (loans, benefits), and net take-home pay. The payroll run produces a payroll register, pay slips for all employees, and the bank disbursement file for crediting salaries. All payroll entries are posted to the GL."
      components={[
        { name: 'Payroll Run Wizard', description: 'Step-by-step payroll process: select period, validate employee data, review computed pay, run final calculation, review register, generate pay slips, and post to GL.' },
        { name: 'Payroll Register', description: 'Complete payroll register: all employees, gross pay components, all deductions, and net pay.' },
        { name: 'Exception Report', description: 'Employees with warnings: first payroll, salary change, negative net pay, missing attendance data.' },
        { name: 'GL Posting Preview', description: 'Preview journal entries to be posted: Salary Expense, SSS/PhilHealth/HDMF payable, Withholding Tax payable, Cash/Bank credit.' },
        { name: 'Bank File Generator', description: 'Generate bank credit file in the format required by the company\'s payroll bank (BDO, BPI, Metrobank EasyPay, Landbank format).' },
      ]}
      tabs={['Current Run', 'Run History', 'Payroll Register', 'Bank File', 'GL Entries']}
      features={[
        'Complete Philippine payroll computation (gross to net)',
        'BIR withholding tax computation (graduated tax table)',
        'SSS, PhilHealth, HDMF contribution auto-calculation',
        '13th month pay computation (December)',
        'Overtime, holiday pay, night differential computation',
        'Bank disbursement file generation',
        'GL payroll journal entry posting',
      ]}
      dataDisplayed={[
        'All employees with computed gross and net pay',
        'Breakdown of all earnings and deductions',
        'Total payroll cost per run',
        'Exceptions and warnings before finalizing',
        'GL entry preview',
        'Bank disbursement amounts',
      ]}
      userActions={[
        'Initiate a new payroll run for a period',
        'Review and correct exceptions',
        'Finalize payroll run',
        'Generate pay slips',
        'Generate bank disbursement file',
        'Post payroll entries to GL',
        'Revert or void an erroneous payroll run',
      ]}
      relatedPages={[
        { label: 'Payroll Calendar', href: '/payroll-workforce/payroll/payroll-calendar' },
        { label: 'Pay Slips', href: '/payroll-workforce/payroll/pay-slips' },
        { label: 'Government Reports', href: '/payroll-workforce/compliance/government-reports' },
        { label: '13th Month', href: '/payroll-workforce/compliance/13th-month' },
      ]}
    />
  )
}

