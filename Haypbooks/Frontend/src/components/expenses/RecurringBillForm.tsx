'use client'

import React, { useState } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import BillForm from './BillForm'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'

interface RecurringBillFormProps {
  mode: 'new' | 'edit'
  billId?: string
  onClose?: () => void
  onSaved?: () => void
}

export default function RecurringBillForm({ mode, billId, onClose, onSaved }: RecurringBillFormProps) {
  const { companyId } = useCompanyId()
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')
  const { entries: activities, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' && billId ? companyId : null,
    pageSize: 30,
    initialFilters: {
      tableName: 'RecurringBill',
      recordId: billId,
    },
  })

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <div className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <h1 className="text-xl font-semibold text-slate-900">{mode === 'new' ? 'New Recurring Bill' : 'Edit Recurring Bill'}</h1>
        </div>
      </div>
      <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        {mode !== 'new' && (
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          </div>
        )}
      </div>

      {activeTab === 'details' && (
        <BillForm
          mode={mode}
          billId={billId}
          isRecurringTemplate={true}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}

      {activeTab === 'activity' && (
        <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <ActivityLog entries={activities} loading={activityLoading} />
        </div>
      )}
    </div>
  )
}
