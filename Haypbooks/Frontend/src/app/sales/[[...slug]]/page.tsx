'use client'

import dynamic from 'next/dynamic'
import ComingSoon from '@/components/owner/ComingSoon'
import { ownerNav } from '@/components/owner/ownerNavConfig'

const CustomersPage = dynamic(() => import('@/components/sales/CustomersPage'), { ssr: false })
const CustomerGroupsPage = dynamic(() => import('@/components/sales/CustomerGroupsPage'), { ssr: false })
const CustomerPortalPage = dynamic(() => import('@/components/sales/CustomerPortalPage'), { ssr: false })
const InvoicesPage = dynamic(() => import('@/components/sales/InvoicesPage'), { ssr: false })
const RecurringInvoicesPage = dynamic(() => import('@/components/sales/RecurringInvoicesPage'), { ssr: false })
const PaymentLinksPage = dynamic(() => import('@/components/sales/PaymentLinksPage'), { ssr: false })
const CustomerPaymentsPage = dynamic(() => import('@/components/sales/CustomerPaymentsPage'), { ssr: false })
const ArAgingPage = dynamic(() => import('@/components/sales/ArAgingPage'), { ssr: false })
const CollectionsCenterPage = dynamic(() => import('@/components/sales/CollectionsCenterPage'), { ssr: false })
const DunningManagementPage = dynamic(() => import('@/components/sales/DunningManagementPage'), { ssr: false })
const WriteOffsPage = dynamic(() => import('@/components/sales/WriteOffsPage'), { ssr: false })
const RefundsPage = dynamic(() => import('@/components/sales/RefundsPage'), { ssr: false })
const CreditNotesPage = dynamic(() => import('@/components/sales/CreditNotesPage'), { ssr: false })
const ProductsServicesPage = dynamic(() => import('@/components/sales/ProductsServicesPage'), { ssr: false })
const QuotesEstimatesPage = dynamic(() => import('@/components/sales/QuotesEstimatesPage'), { ssr: false })
const SalesOrdersPage = dynamic(() => import('@/components/sales/SalesOrdersPage'), { ssr: false })
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
    case 'customers': return <CustomersPage />
    case 'customers/groups': return <CustomerGroupsPage />
    case 'customers/portal': return <CustomerPortalPage />
    case 'sales/pipeline': return <ComingSoon title="Sales Pipeline" />
    case 'sales/products-services': return <ProductsServicesPage />
    case 'sales/quotes': return <QuotesEstimatesPage />
    case 'sales/orders': return <SalesOrdersPage />
    case 'billing/invoices': return <InvoicesPage />
    case 'billing/recurring': return <RecurringInvoicesPage />
    case 'billing/payment-links': return <PaymentLinksPage />
    case 'collections/payments': return <CustomerPaymentsPage />
    case 'collections/aging': return <ArAgingPage />
    case 'collections/center': return <CollectionsCenterPage />
    case 'collections/dunning': return <DunningManagementPage />
    case 'collections/write-offs': return <WriteOffsPage />
    case 'collections/refunds': return <RefundsPage />
    case 'revenue/credit-notes': return <CreditNotesPage />
    case 'revenue/recognition': return <RevenueRecognitionPage />
    case 'revenue/deferred': return <DeferredRevenuePage />
    default: return null
  }
}

export default function Page({ params }: Props) {
  const component = resolveComponent(params.slug)
  if (component) return component
  return <ComingSoon title={resolveTitle('sales', params.slug)} />
}
