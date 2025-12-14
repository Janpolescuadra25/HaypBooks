import InventoryNav from '@/components/InventoryNav'

export default function InventoryOverviewPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><InventoryNav activeHref="/inventory/overview" /></div>
      <div className="glass-card">Inventory Overview — Coming soon.</div>
    </div>
  )
}
