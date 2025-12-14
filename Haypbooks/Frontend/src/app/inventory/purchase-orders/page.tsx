import InventoryNav from '@/components/InventoryNav'

export default function InventoryPurchaseOrdersPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><InventoryNav activeHref="/inventory/purchase-orders" /></div>
      <div className="glass-card">Inventory Purchase Orders — Coming soon.</div>
    </div>
  )
}
