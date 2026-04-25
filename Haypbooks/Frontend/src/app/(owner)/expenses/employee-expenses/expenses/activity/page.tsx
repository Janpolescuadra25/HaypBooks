import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Expenses Activity Log"
      subtitle="Review expense submission and approval activity."
      backHref="/expenses/employee-expenses/expenses"
      entityType="Expense"
      emptyMessage="No expense activity recorded yet."
      searchPlaceholder="Search expense activity..."
    />
  )
}
