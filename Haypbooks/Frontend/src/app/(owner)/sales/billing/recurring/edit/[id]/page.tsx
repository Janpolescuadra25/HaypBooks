'use client'

import React from 'react'
import RecurringInvoiceForm from '@/components/sales/RecurringInvoiceForm'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  
  return <RecurringInvoiceForm mode="edit" invoiceId={id} />
}
