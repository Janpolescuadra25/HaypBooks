function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="border-t pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between">
        <div className="w-full">
          <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600">
            {values.map((v,i)=>(<div key={i}>{v}</div>))}
          </div>
        </div>
        <button className="ml-4 text-slate-400 hover:text-slate-700" aria-label={`Edit ${label}`} title={`Edit ${label}`}>✏️</button>
      </div>
    </div>
  )
}
export default function TimeSettingsPage() {
  return (
    <section className="space-y-8">
      <Row label="Timesheets" values={["Enabled"]} />
      <Row label="First day of work week" values={["Monday"]} />
      <Row label="Overtime rule" values={["Over 40 hrs / week"]} />
    </section>
  )
}
