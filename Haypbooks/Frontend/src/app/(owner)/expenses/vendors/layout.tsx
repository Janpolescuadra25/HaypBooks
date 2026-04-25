import { ReactNode } from 'react'
import ModuleTabs from '@/components/shared/ModuleTabs'
import { ToastProvider } from '@/components/ui/Toast'

const TABS = [
  { label: 'Vendors', value: 'vendors' },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex flex-col h-full">
        <ModuleTabs tabs={TABS} basePath="/expenses/vendors" />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </ToastProvider>
  )
}
