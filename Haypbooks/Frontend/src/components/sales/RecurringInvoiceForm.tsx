'use client'

import React from 'react'
import InvoiceCreatePage from './InvoiceCreatePage'

interface RecurringInvoiceFormProps {
  mode: 'new' | 'edit'
  invoiceId?: string
}

export default function RecurringInvoiceForm({ mode, invoiceId }: RecurringInvoiceFormProps) {
  return (
    <InvoiceCreatePage
      isRecurringTemplate={true}
      mode={mode}
      invoiceId={invoiceId}
    />
  )
}
