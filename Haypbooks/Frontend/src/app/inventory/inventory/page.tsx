import InventoryNav from '@/components/InventoryNav'

export default function InventoryItemsPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><InventoryNav activeHref="/inventory/inventory" /></div>
      <div className="glass-card">Inventory — Coming soon.</div>
    </div>
  )
}
