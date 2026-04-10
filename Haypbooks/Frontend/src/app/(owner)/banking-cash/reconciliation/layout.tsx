import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Reconcile', value: 'reconcile' },
  { label: 'History', value: 'history' },
  { label: 'Statement Archive', value: 'statement-archive' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/banking-cash/reconciliation" />
      <div>{children}</div>
    </>
  )
}
