import PayrollNav from '@/components/PayrollNav'

export default function PayrollTaxPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><PayrollNav activeHref="/payroll/payroll-tax" /></div>
      <div className="glass-card">Payroll tax — Coming soon.</div>
    </div>
  )
}
