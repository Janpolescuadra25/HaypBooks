'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import RecurringBillForm from '@/components/expenses/RecurringBillForm'

export default function EditRecurringBillPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const handleClose = () => {
    router.push('/expenses/bills-payments/recurring-bills')
  }

  const handleSaved = () => {
    router.push('/expenses/bills-payments/recurring-bills')
  }

  return (
    <div className="h-screen bg-slate-50 overflow-hidden">
      <RecurringBillForm 
        mode="edit" 
        billId={id}
        onClose={handleClose} 
        onSaved={handleSaved} 
      />
    </div>
  )
}
