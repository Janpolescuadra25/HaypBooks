'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import RecurringBillForm from '@/components/expenses/RecurringBillForm'

export default function NewRecurringBillPage() {
  const router = useRouter()

  const handleClose = () => {
    router.push('/expenses/bills-payments/recurring-bills')
  }

  const handleSaved = () => {
    router.push('/expenses/bills-payments/recurring-bills')
  }

  return (
    <div className="h-screen bg-slate-50 overflow-hidden">
      <RecurringBillForm 
        mode="new" 
        onClose={handleClose} 
        onSaved={handleSaved} 
      />
    </div>
  )
}
