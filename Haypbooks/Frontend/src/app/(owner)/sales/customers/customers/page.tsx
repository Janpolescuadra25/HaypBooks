'use client'

import dynamic from 'next/dynamic'

const CustomersPage = dynamic(() => import('@/components/sales/CustomersPage'), { ssr: false })

export default function Page() {
  return <CustomersPage />
}
