'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Purchase Requests', value: 'purchase-requests' },
  { label: 'Orders', value: 'orders' },
  { label: 'RFQs', value: 'rfq' },
  { label: 'Approvals', value: 'approvals' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const isFormPage = /(\/new|\/edit)\/?$/.test(pathname)

  return (
      <div className="flex flex-col h-full">
        {!isFormPage && <ModuleTabs tabs={TABS} basePath="/expenses/procurement" />}
        <div className={isFormPage ? 'flex-1 h-full' : 'flex-1 overflow-y-auto'}>
          {children}
        </div>
      </div>
  )
}
