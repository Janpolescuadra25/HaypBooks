'use client'

import dynamic from 'next/dynamic'
import ComingSoon from '@/components/owner/ComingSoon'

const PurchasesVendorsPage = dynamic(() => import('@/components/purchases/PurchasesVendorsPage'), { ssr: false })
const PurchasesBillsPage = dynamic(() => import('@/components/purchases/PurchasesBillsPage'), { ssr: false })
const PurchasesBillNewPage = dynamic(() => import('@/components/purchases/PurchasesBillNewPage'), { ssr: false })
const PurchasesBillDetailPage = dynamic(() => import('@/components/purchases/PurchasesBillDetailPage'), { ssr: false })

type Props = { params: { slug?: string[] } }

function resolveComponent(slug: string[] | undefined) {
  const path = (slug ?? []).join('/')
  switch (path) {
    case 'vendors':
      return <PurchasesVendorsPage />
    case 'bills':
      return <PurchasesBillsPage />
    case 'bills/new':
      return <PurchasesBillNewPage />
    default:
      if (slug?.length === 2 && slug[0] === 'bills') {
        return <PurchasesBillDetailPage billId={slug[1]} />
      }
      return null
  }
}

function resolveTitle(slug: string[] | undefined) {
  if (!slug || slug.length === 0) return 'Purchases'
  const key = slug.join('/')
  switch (key) {
    case 'vendors':
      return 'Purchases – Vendors'
    case 'bills':
      return 'Purchases – Bills'
    case 'bills/new':
      return 'Purchases – New Bill'
    default:
      if (slug.length === 2 && slug[0] === 'bills') return `Purchases – Bill ${slug[1]}`
      return 'Purchases'
  }
}

export default function Page({ params }: Props) {
  const component = resolveComponent(params.slug)
  if (component) return component
  return (
    <ComingSoon
      title={resolveTitle(params.slug)}
      description="The Purchases / Accounts Payable module is under active development. The requested bills and vendors pages are being scaffolded here."
    />
  )
}
