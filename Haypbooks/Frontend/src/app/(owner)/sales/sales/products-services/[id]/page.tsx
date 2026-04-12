import React from 'react'
import ProductDetailPage from '@/components/sales/ProductDetailPage'

interface Props {
  params: {
    id: string
  }
}

export default function Page({ params }: Props) {
  return <ProductDetailPage id={params.id} />
}
