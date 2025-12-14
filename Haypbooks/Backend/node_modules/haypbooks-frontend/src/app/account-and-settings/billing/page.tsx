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
export default function BillingSubscriptionPage() {
  return (
    <section className="space-y-8">
      <Row label="Subscription Plan" values={["Pro (Monthly)"]} />
      <Row label="Payment Method" values={["Visa •••• 4242", "Expires 08/27"]} />
      <Row label="Billing Address" values={["333 Easy Street, Middlefield, CA 98756"]} />
    </section>
  )
}
