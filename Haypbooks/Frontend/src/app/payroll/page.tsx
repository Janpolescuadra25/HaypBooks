import PayrollNav from '@/components/PayrollNav'

export default function PayrollPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><PayrollNav activeHref="/payroll" /></div>
      <div className="glass-card">Payroll — Choose a tab above.</div>
    </div>
  )
}
