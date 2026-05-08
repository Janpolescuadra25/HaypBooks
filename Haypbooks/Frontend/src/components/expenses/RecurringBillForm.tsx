'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import BillForm from './BillForm'
import HaypSelect from '@/components/shared/HaypSelect'

const today = new Date().toISOString().slice(0, 10)
const FREQUENCIES = ['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']

export interface RecurringBillFormHandle {
  save: () => Promise<void>
}

interface RecurringBillFormProps {
  mode: 'new' | 'edit'
  billId?: string
  onClose?: () => void
  onSaved?: () => void
}

const RecurringBillForm = forwardRef<RecurringBillFormHandle, RecurringBillFormProps>(
  function RecurringBillForm({ mode, billId, onClose, onSaved }, ref) {
    const toast = useToast()
    const { companyId } = useCompanyId()
    const { currency } = useCompanyCurrency()

    const [templateName, setTemplateName] = useState('')
    const [frequency, setFrequency] = useState('MONTHLY')
    const [startDate, setStartDate] = useState(today)
    const [endDate, setEndDate] = useState('')
    const [maxOccurrences, setMaxOccurrences] = useState<number | null>(null)
    const [daysInAdvance, setDaysInAdvance] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const billFormRef = useRef<{ save: () => Promise<void> } | null>(null)

    const nextDueDate = useMemo(() => {
      try {
        const d = new Date(startDate)
        if (isNaN(d.getTime())) return ''
        switch (frequency) {
          case 'WEEKLY': d.setDate(d.getDate() + 7); break
          case 'BI_WEEKLY': d.setDate(d.getDate() + 14); break
          case 'MONTHLY': d.setMonth(d.getMonth() + 1); break
          case 'QUARTERLY': d.setMonth(d.getMonth() + 3); break
          case 'YEARLY': d.setFullYear(d.getFullYear() + 1); break
        }
        return d.toISOString().slice(0, 10)
      } catch {
        return ''
      }
    }, [frequency, startDate])

    const handleSave = useCallback(async () => {
      await billFormRef.current?.save()
    }, [])

    useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

    useEffect(() => {
      if (mode !== 'edit' || !billId || !companyId) return
      let active = true
      setLoading(true)
      expensesService.getRecurringBill(companyId, billId)
        .then((res) => {
          if (!active) return
          const data = res.data ?? res
          setTemplateName(String(data.templateName ?? data.description ?? ''))
          setFrequency(String(data.frequency ?? 'MONTHLY'))
          setStartDate(String(data.startDate?.slice?.(0, 10) ?? today))
          setEndDate(String(data.endDate?.slice?.(0, 10) ?? ''))
          setMaxOccurrences(data.maxOccurrences == null ? null : Number(data.maxOccurrences))
          setDaysInAdvance(data.daysInAdvance == null ? 0 : Number(data.daysInAdvance))
          setError('')
        })
        .catch((err: any) => {
          setError(err?.response?.data?.message ?? 'Failed to load recurring bill template')
          toast.error('Failed to load recurring bill template')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
      return () => { active = false }
    }, [billId, companyId, mode, toast])

    const loadRecurringBill = useCallback(
      async (companyIdValue: string, billIdValue: string) => expensesService.getRecurringBill(companyIdValue, billIdValue),
      [],
    )

    const saveRecurringBill = useCallback(
      async (companyIdValue: string, payload: Record<string, unknown>, action: 'draft' | 'submit', formMode: 'new' | 'edit', formBillId?: string) => {
        const recurringPayload = {
          ...payload,
          templateName: (templateName.trim() || String(payload.description ?? '')).trim(),
          frequency,
          startDate,
          endDate: endDate || null,
          maxOccurrences: maxOccurrences ?? null,
          daysInAdvance: daysInAdvance ?? null,
        }

        if (formMode === 'new') {
          const result = await expensesService.createRecurringBill(companyIdValue, recurringPayload)
          toast.success('Recurring bill template created')
          return result
        }
        if (formBillId) {
          const result = await expensesService.updateRecurringBill(companyIdValue, formBillId, recurringPayload)
          toast.success('Recurring bill template updated')
          return result
        }
        throw new Error('Recurring bill template id required')
      },
      [daysInAdvance, endDate, frequency, maxOccurrences, templateName, toast],
    )

    const buildPayloadExtras = useCallback(
      (payload: Record<string, unknown>) => ({
        ...payload,
        templateName: (templateName.trim() || String(payload.description ?? '')).trim(),
        frequency,
        startDate,
        endDate: endDate || null,
        maxOccurrences: maxOccurrences ?? null,
        daysInAdvance: daysInAdvance ?? null,
      }),
      [daysInAdvance, endDate, frequency, maxOccurrences, templateName],
    )

    return (
      <div className="space-y-6 text-slate-900">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label htmlFor="recurringTemplateName" className="text-[10px] font-bold uppercase text-slate-400">Template Name</label>
              <input
                id="recurringTemplateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Monthly SaaS subscription"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all"
              />
            </div>
            <div>
              <label htmlFor="recurringFrequency" className="text-[10px] font-bold uppercase text-slate-400">Frequency</label>
              <HaypSelect
                id="recurringFrequency"
                value={frequency}
                onChange={setFrequency}
                options={FREQUENCIES.map((value) => ({ value, label: value.replace('_', '-') }))}
              />
            </div>
            <div>
              <label htmlFor="recurringStartDate" className="text-[10px] font-bold uppercase text-slate-400">Start Date</label>
              <input
                id="recurringStartDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all"
              />
            </div>
            <div>
              <label htmlFor="recurringEndDate" className="text-[10px] font-bold uppercase text-slate-400">End Date</label>
              <input
                id="recurringEndDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all"
              />
            </div>
            <div>
              <label htmlFor="recurringMaxOccurrences" className="text-[10px] font-bold uppercase text-slate-400">Max Occurrences</label>
              <input
                id="recurringMaxOccurrences"
                type="number"
                min="0"
                value={maxOccurrences === null ? '' : String(maxOccurrences)}
                onChange={(e) => setMaxOccurrences(e.target.value ? Number(e.target.value) : null)}
                placeholder="Optional"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all"
              />
            </div>
            <div>
              <label htmlFor="recurringDaysInAdvance" className="text-[10px] font-bold uppercase text-slate-400">Days in Advance</label>
              <input
                id="recurringDaysInAdvance"
                type="number"
                min="0"
                value={daysInAdvance}
                onChange={(e) => setDaysInAdvance(Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all"
              />
            </div>
            <div className="lg:col-span-2">
              <p className="text-sm text-slate-500">Next scheduled bill is estimated for <strong className="text-slate-900">{nextDueDate || '—'}</strong>.</p>
            </div>
          </div>
        </div>

        {loading && error === '' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Loading recurring bill template…</div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        <BillForm
          ref={billFormRef}
          mode={mode}
          billId={billId}
          title={mode === 'new' ? 'New Recurring Bill Template' : 'Edit Recurring Bill Template'}
          onClose={onClose}
          onSaved={onSaved}
          saveBill={saveRecurringBill}
          loadBill={loadRecurringBill}
          buildPayloadExtras={buildPayloadExtras}
        />
      </div>
    )
  }
)

export default RecurringBillForm
