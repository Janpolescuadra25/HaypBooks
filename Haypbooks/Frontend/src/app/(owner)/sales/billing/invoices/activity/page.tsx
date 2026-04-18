import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Invoices Activity Log"
      subtitle="Review created, updated, sent, and voided invoice actions."
      backHref="/sales/billing/invoices"
      entityType="Invoice"
      emptyMessage="No invoice activity recorded yet."
      searchPlaceholder="Search invoice activity..."
    />
  )
}
