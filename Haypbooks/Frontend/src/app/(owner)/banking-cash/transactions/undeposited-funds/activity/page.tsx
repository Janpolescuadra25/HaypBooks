import ModuleActivityPage from '@/components/activity/ModuleActivityPage'

export default function Page() {
  return (
    <ModuleActivityPage
      title="Undeposited Funds Activity Log"
      subtitle="Track customer payment receipts that remain in undeposited funds."
      backHref="/banking-cash/transactions/undeposited-funds"
      entityType="CustomerPayment"
      emptyMessage="No undeposited funds activity recorded yet."
      searchPlaceholder="Search undeposited funds activity..."
    />
  )
}
