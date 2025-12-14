import InventoryNav from '@/components/InventoryNav'

export default function InventoryShippingPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden"><InventoryNav activeHref="/inventory/shipping" /></div>
      <div className="glass-card">Inventory Shipping — Coming soon.</div>
    </div>
  )
}
