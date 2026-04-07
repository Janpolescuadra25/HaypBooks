'use client'

import dynamic from 'next/dynamic'
import ComingSoon from '@/components/owner/ComingSoon'
import { ownerNav } from '@/components/owner/ownerNavConfig'

const VendorsPage = dynamic(() => import('@/components/expenses/VendorsPage'), { ssr: false })
const BillsPage = dynamic(() => import('@/components/expenses/BillsPage'), { ssr: false })
const BillPaymentsPage = dynamic(() => import('@/components/expenses/BillPaymentsPage'), { ssr: false })
const ApAgingPage = dynamic(() => import('@/components/expenses/ApAgingPage'), { ssr: false })
const PurchaseOrdersPage = dynamic(() => import('@/components/expenses/PurchaseOrdersPage'), { ssr: false })
const ExpenseCapturePage = dynamic(() => import('@/components/expenses/ExpenseCapturePage'), { ssr: false })
const VendorCreditsPage = dynamic(() => import('@/components/expenses/VendorCreditsPage'), { ssr: false })

type Props = { params: { slug?: string[] } }

function resolveTitle(sectionId: string, slug: string[] | undefined): string {
  const section = ownerNav.find((s) => s.id === sectionId)
  if (!slug || slug.length === 0) return section?.label ?? 'Expenses'
  const href = '/' + [sectionId, ...slug].join('/')
  for (const sec of ownerNav) {
    for (const grp of (sec.groups ?? [])) {
      const found = grp.items.find((it) => it.href === href)
      if (found) return found.label ?? ''
    }
  }
  const last = slug[slug.length - 1] ?? ''
  return last.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function resolveComponent(slug: string[] | undefined) {
  const key = slug?.join('/') ?? ''
  switch (key) {
    case 'vendors/vendors': return <VendorsPage />
    case 'vendors/purchase-orders': return <PurchaseOrdersPage />
    case 'payables/bills': return <BillsPage />
    case 'payables/bill-payments': return <BillPaymentsPage />
    case 'payables/ap-aging': return <ApAgingPage />
    case 'payables/vendor-credits': return <VendorCreditsPage />
    case 'expense-capture/expenses': return <ExpenseCapturePage initialTab="expenses" />
    case 'expense-capture/receipts': return <ExpenseCapturePage initialTab="receipts" />
    case 'expense-capture/mileage': return <ExpenseCapturePage initialTab="mileage" />
    case 'expense-capture/per-diem':
    case 'expense-capture/reimbursements': return <ExpenseCapturePage initialTab="reimbursements" />
    default: return null
  }
}

export default function Page({ params }: Props) {
  const comp = resolveComponent(params.slug)
  if (comp) return comp
  return <ComingSoon title={resolveTitle('expenses', params.slug)} />
}
