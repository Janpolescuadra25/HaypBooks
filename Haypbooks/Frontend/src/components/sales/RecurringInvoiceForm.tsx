'use client'

import React from 'react'
import { X, Loader2 } from 'lucide-react'
import CustomerPickerField, { type CustomerPickerOption } from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'
import { ModalPortal } from '@/components/shared/ModalPortal'

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  ANNUALLY: 'Annually',
}

export interface RecurringFormData {
  customerId: string
  frequency: string
  startDate: string
  endDate: string
  amount: string
  maxOccurrences: string
  daysInAdvance: string
}

interface Props {
  open: boolean
  companyId: string | null
  editingId: string | null
  customers: CustomerPickerOption[]
  customersLoading: boolean
  formData: RecurringFormData
  setFormData: React.Dispatch<React.SetStateAction<RecurringFormData>>
  formSaving: boolean
  handleSave: () => Promise<void>
  loadCustomers: () => Promise<void>
  setCustomers: React.Dispatch<React.SetStateAction<CustomerPickerOption[]>>
  showQuickAddCustomer: boolean
  setShowQuickAddCustomer: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
  onSaved: () => void
}

export default function RecurringInvoiceForm({
  open,
  companyId,
  editingId,
  customers,
  customersLoading,
  formData,
  setFormData,
  formSaving,
  handleSave,
  loadCustomers,
  setCustomers,
  showQuickAddCustomer,
  setShowQuickAddCustomer,
  onClose,
  onSaved,
}: Props) {
  if (!open) return null

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
        <div className="relative z-[10000] bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Recurring Template' : 'New Recurring Template'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="p-6 space-y-4">
            <CustomerPickerField
              label="Customer *"
              value={formData.customerId}
              customers={customers}
              loading={customersLoading}
              placeholder="Select customer..."
              createLabel="+ Create New Customer"
              onOpen={loadCustomers}
              onChange={(id) => setFormData((f) => ({ ...f, customerId: id }))}
              onCreateNew={() => setShowQuickAddCustomer(true)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select value={formData.frequency} onChange={(e) => setFormData((f) => ({ ...f, frequency: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                {Object.entries(FREQ_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={formData.endDate} onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Occurrences</label>
                <input type="number" min="0" value={formData.maxOccurrences} onChange={(e) => setFormData((f) => ({ ...f, maxOccurrences: e.target.value }))}
                  placeholder="Optional"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days in Advance to Create</label>
                <input type="number" min="0" value={formData.daysInAdvance} onChange={(e) => setFormData((f) => ({ ...f, daysInAdvance: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount *</label>
              <input type="number" step="0.01" min="0" value={formData.amount} onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
            <button onClick={handleSave} disabled={formSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">
              {formSaving ? <Loader2 size={15} className="animate-spin" /> : null} {editingId ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
      {showQuickAddCustomer && companyId && (
        <QuickAddCustomerModal
          companyId={companyId}
          onClose={() => setShowQuickAddCustomer(false)}
          onCreated={(customer) => {
            const next = { id: customer.contactId, name: customer.name, email: customer.email }
            setCustomers((prev) => [next, ...prev.filter((p) => p.id !== next.id)])
            setFormData((prev) => ({ ...prev, customerId: next.id }))
            setShowQuickAddCustomer(false)
          }}
        />
      )}
    </ModalPortal>
  )
}
