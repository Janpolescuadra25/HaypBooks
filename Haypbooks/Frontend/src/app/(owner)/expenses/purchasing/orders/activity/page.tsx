import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Purchase Orders Activity Log"
      subtitle="Track purchase order creation and update activity."
      backHref="/expenses/purchasing/orders"
      entityType="PurchaseOrder"
      emptyMessage="No purchase order activity recorded yet."
      searchPlaceholder="Search purchase order activity..."
    />
  )
}
