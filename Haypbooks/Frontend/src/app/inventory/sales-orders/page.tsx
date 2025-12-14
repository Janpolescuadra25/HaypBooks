import InventoryNav from '@/components/InventoryNav'

export default function InventorySalesOrdersPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><InventoryNav activeHref="/inventory/sales-orders" /></div>
      <div className="glass-card">Inventory Sales orders — Coming soon.</div>
    </div>
  )
}
