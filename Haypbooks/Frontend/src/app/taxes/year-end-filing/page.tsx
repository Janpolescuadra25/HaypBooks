import TaxesNav from '@/components/TaxesNav'

export default function TaxesYearEndPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><TaxesNav activeHref="/taxes/year-end-filing" /></div>
      <div className="glass-card">Year-end filing — Coming soon.</div>
    </div>
  )
}
