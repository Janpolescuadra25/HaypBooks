import PayrollNav from '@/components/PayrollNav'

export default function ContractorsPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><PayrollNav activeHref="/payroll/contractors" /></div>
      <div className="glass-card">Contractors — Coming soon.</div>
    </div>
  )
}
