import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Customer Payments', value: 'payments' },
  { label: 'A/R Aging', value: 'aging' },
  { label: 'Collections Center', value: 'center' },
  { label: 'Dunning', value: 'dunning' },
  { label: 'Write-Offs', value: 'write-offs' },
  { label: 'Refunds', value: 'refunds' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleTabs tabs={TABS} basePath="/sales/collections" />
      <div>{children}</div>
    </>
  )
}
