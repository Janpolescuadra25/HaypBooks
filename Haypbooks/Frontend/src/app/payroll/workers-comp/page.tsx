import PayrollNav from '@/components/PayrollNav'

export default function WorkersCompPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><PayrollNav activeHref="/payroll/workers-comp" /></div>
  <div className="glass-card">Workers&apos; comp — Coming soon.</div>
    </div>
  )
}
