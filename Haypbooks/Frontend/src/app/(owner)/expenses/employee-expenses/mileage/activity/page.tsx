import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Mileage Activity Log"
      subtitle="Review mileage entry and approval activity."
      backHref="/expenses/employee-expenses/mileage"
      entityType="Mileage"
      emptyMessage="No mileage activity recorded yet."
      searchPlaceholder="Search mileage activity..."
    />
  )
}
