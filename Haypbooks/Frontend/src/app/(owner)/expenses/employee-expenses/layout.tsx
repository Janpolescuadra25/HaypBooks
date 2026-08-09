'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import ModuleTabs from '@/components/shared/ModuleTabs'

const TABS = [
  { label: 'Expenses', value: 'expenses' },
  { label: 'Receipts', value: 'receipts' },
  { label: 'Mileage', value: 'mileage' },
  { label: 'Per Diem', value: 'per-diem' },
  { label: 'Reimbursements', value: 'reimbursements' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isFormPage = /(\/new|\/edit)\/?$/.test(pathname)

  return (
      <div className="flex flex-col h-full">
        {!isFormPage && <ModuleTabs tabs={TABS} basePath="/expenses/employee-expenses" />}
        <div className={isFormPage ? 'flex-1 h-full' : 'flex-1 overflow-y-auto'}>
          {children}
        </div>
      </div>
  )
}
