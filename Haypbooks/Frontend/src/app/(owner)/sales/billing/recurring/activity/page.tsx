import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Recurring Invoices Activity Log"
      subtitle="Review recurring template edits and generated invoice events."
      backHref="/sales/billing/recurring"
      entityType="RecurringInvoice"
      emptyMessage="No recurring invoice activity recorded yet."
      searchPlaceholder="Search recurring activity..."
    />
  )
}
