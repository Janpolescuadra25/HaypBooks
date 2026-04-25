import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Purchase Requests Activity Log"
      subtitle="Review purchase request submission and approval activity."
      backHref="/expenses/procurement/requests"
      entityType="PurchaseRequest"
      emptyMessage="No purchase request activity recorded yet."
      searchPlaceholder="Search purchase request activity..."
    />
  )
}
