import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Sales Orders Activity Log"
      subtitle="Track sales order creation, updates, and invoice conversions."
      backHref="/sales/opportunities/orders"
      entityType="SalesOrder"
      emptyMessage="No sales order activity recorded yet."
      searchPlaceholder="Search sales order activity..."
    />
  )
}
