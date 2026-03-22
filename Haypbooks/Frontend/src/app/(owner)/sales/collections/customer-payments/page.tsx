'use client'

import dynamic from 'next/dynamic'

const PaymentsPage = dynamic(() => import('@/components/sales/PaymentsPage'), { ssr: false })

export default function Page() {
  return <PaymentsPage />
}
