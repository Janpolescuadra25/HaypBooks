import TaxesNav from '@/components/TaxesNav'

export default function TaxesIncomeTaxPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><TaxesNav activeHref="/taxes/income-tax" /></div>
      <div className="glass-card">Income Tax — Coming soon.</div>
    </div>
  )
}
