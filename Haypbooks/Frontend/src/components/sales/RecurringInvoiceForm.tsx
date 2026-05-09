'use client'

import React from 'react'
import InvoiceCreatePage from './InvoiceCreatePage'

interface RecurringInvoiceFormProps {
  mode: 'new' | 'edit'
  invoiceId?: string
  onClose?: () => void
  onSaved?: () => void
}

export default function RecurringInvoiceForm({ mode, invoiceId, onClose, onSaved }: RecurringInvoiceFormProps) {
  return (
    <InvoiceCreatePage
      isRecurringTemplate={true}
    />
  )
}
