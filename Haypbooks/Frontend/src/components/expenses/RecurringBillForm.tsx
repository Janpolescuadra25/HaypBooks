'use client'

import React from 'react'
import BillForm from './BillForm'

interface RecurringBillFormProps {
  mode: 'new' | 'edit'
  billId?: string
  onClose?: () => void
  onSaved?: () => void
}

export default function RecurringBillForm({ mode, billId, onClose, onSaved }: RecurringBillFormProps) {
  return (
    <BillForm
      mode={mode}
      billId={billId}
      isRecurringTemplate={true}
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}
