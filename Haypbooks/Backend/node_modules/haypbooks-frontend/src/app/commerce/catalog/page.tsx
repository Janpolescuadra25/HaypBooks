import CommerceNav from '@/components/CommerceNav'

export default function CommerceCatalogPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><CommerceNav activeHref="/commerce/catalog" /></div>
      <div className="glass-card">Catalog — Coming soon.</div>
    </div>
  )
}
