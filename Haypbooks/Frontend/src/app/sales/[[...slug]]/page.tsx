'use client'

import dynamic from 'next/dynamic'
import ComingSoon from '@/components/owner/ComingSoon'
import { ownerNav } from '@/components/owner/ownerNavConfig'

const CustomersPage = dynamic(() => import('@/components/sales/CustomersPage'), { ssr: false })
const InvoicesPage = dynamic(() => import('@/components/sales/InvoicesPage'), { ssr: false })
const PaymentsPage = dynamic(() => import('@/components/sales/PaymentsPage'), { ssr: false })
const ArAgingPage = dynamic(() => import('@/components/sales/ArAgingPage'), { ssr: false })

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
    case 'collections/customer-payments': return <PaymentsPage />
    case 'collections/ar-aging': return <ArAgingPage />
    default: return null
  }
}

export default function Page({ params }: Props) {
  const component = resolveComponent(params.slug)
  if (component) return component
  return <ComingSoon title={resolveTitle('sales', params.slug)} />
}
