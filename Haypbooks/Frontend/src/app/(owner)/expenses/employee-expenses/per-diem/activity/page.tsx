import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Per Diem Activity Log"
      subtitle="Review per diem claim and approval activity."
      backHref="/expenses/employee-expenses/per-diem"
      entityType="PerDiem"
      emptyMessage="No per diem activity recorded yet."
      searchPlaceholder="Search per diem activity..."
    />
  )
}
