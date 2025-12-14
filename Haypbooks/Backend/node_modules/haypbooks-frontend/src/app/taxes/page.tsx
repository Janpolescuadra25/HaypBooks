import TaxesNav from '@/components/TaxesNav'

export default function TaxesPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><TaxesNav activeHref="/taxes" /></div>
      <div className="glass-card">Taxes — Choose a tab above.</div>
    </div>
  )
}
