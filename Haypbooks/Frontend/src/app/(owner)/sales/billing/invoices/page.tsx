'use client'

import dynamic from 'next/dynamic'

const InvoicesPage = dynamic(() => import('@/components/sales/InvoicesPage'), { ssr: false })

export default function Page() {
  return <InvoicesPage />
}
