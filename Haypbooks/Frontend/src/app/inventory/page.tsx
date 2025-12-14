import InventoryNav from '@/components/InventoryNav'

export default function InventoryPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><InventoryNav activeHref="/inventory" /></div>
      <div className="glass-card">Inventory — Choose a tab above.</div>
    </div>
  )
}
