'use client'

import dynamic from 'next/dynamic'
import ComingSoon from '@/components/owner/ComingSoon'
import { ownerNav } from '@/components/owner/ownerNavConfig'

const CustomersPage = dynamic(() => import('@/components/sales/CustomersPage'), { ssr: false })
const InvoicesPage = dynamic(() => import('@/components/sales/InvoicesPage'), { ssr: false })
const PaymentsPage = dynamic(() => import('@/components/sales/PaymentsPage'), { ssr: false })
const ArAgingPage = dynamic(() => import('@/components/sales/ArAgingPage'), { ssr: false })
const RefundsPage = dynamic(() => import('@/components/sales/RefundsPage'), { ssr: false })
const SubscriptionsPage = dynamic(() => import('@/components/sales/SubscriptionsPage'), { ssr: false })
const RevenueRecognitionPage = dynamic(() => import('@/components/sales/RevenueRecognitionPage'), { ssr: false })
const DeferredRevenuePage = dynamic(() => import('@/components/sales/DeferredRevenuePage'), { ssr: false })

type Props = { params: { slug?: string[] } }

function resolveTitle(sectionId: string, slug: string[] | undefined): string {
  const section = ownerNav.find((s) => s.id === sectionId)
  if (!slug || slug.length === 0) return section?.label ?? 'Sales'
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
  const path = (slug ?? []).join('/')
  switch (path) {
    case 'customers':
    case 'customers/customers': return <CustomersPage />
    case 'billing/invoices': return <InvoicesPage />
    case 'billing/subscriptions': return <SubscriptionsPage />
    case 'collections/customer-payments': return <PaymentsPage />
    case 'collections/ar-aging': return <ArAgingPage />
    case 'collections/refunds': return <RefundsPage />
    case 'revenue/revenue-recognition': return <RevenueRecognitionPage />
    case 'revenue/deferred-revenue': return <DeferredRevenuePage />
    default: return null
  }
}

export default function Page({ params }: Props) {
  const component = resolveComponent(params.slug)
  if (component) return component
  return <ComingSoon title={resolveTitle('sales', params.slug)} />
}
