'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import ModuleTabs from '@/components/shared/ModuleTabs'
import { ToastProvider } from '@/components/ui/Toast'

const TABS = [
  { label: 'Vendors', value: 'vendors' },
  { label: 'Statements', value: 'statements' },
  { label: 'Contacts', value: 'contacts' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isFormPage = /(\/new|\/edit)\/?$/.test(pathname)

  return (
    <ToastProvider>
      <div className="flex flex-col h-full">
        {!isFormPage && <ModuleTabs tabs={TABS} basePath="/expenses/vendors" />}
        <div className={isFormPage ? 'flex-1 h-full' : 'flex-1 overflow-y-auto'}>
          {children}
        </div>
      </div>
    </ToastProvider>
  )
}
