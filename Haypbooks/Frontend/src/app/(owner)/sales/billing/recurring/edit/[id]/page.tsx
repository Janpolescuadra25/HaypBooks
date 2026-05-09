'use client'

import React from 'react'
import RecurringInvoiceForm from '@/components/sales/RecurringInvoiceForm'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  const id = params.id as string
  
  return <RecurringInvoiceForm mode="edit" invoiceId={id} />
}
