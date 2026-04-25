import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Recurring Bills Activity Log"
      subtitle="Review recurring bill scheduling and generation activity."
      backHref="/expenses/bills-payments/recurring-bills"
      entityType="RecurringBill"
      emptyMessage="No recurring bill activity recorded yet."
      searchPlaceholder="Search recurring bill activity..."
    />
  )
}
