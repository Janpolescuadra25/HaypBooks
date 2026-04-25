import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Vendors Activity Log"
      subtitle="Review vendor creation and profile update activity."
      backHref="/expenses/vendors"
      entityType="Vendor"
      emptyMessage="No vendor activity recorded yet."
      searchPlaceholder="Search vendor activity..."
    />
  )
}
