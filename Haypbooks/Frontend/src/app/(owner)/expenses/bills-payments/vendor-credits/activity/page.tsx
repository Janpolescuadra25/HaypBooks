import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Vendor Credits Activity Log"
      subtitle="Track vendor credit creation, updates, and applications."
      backHref="/expenses/bills-payments/vendor-credits"
      entityType="VendorCredit"
      emptyMessage="No vendor credit activity recorded yet."
      searchPlaceholder="Search vendor credit activity..."
    />
  )
}
