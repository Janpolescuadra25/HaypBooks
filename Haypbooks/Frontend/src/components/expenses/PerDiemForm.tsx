'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'

const today = new Date().toISOString().slice(0, 10)
const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']

interface Employee { id: string; displayName: string }

export interface PerDiemFormHandle {
  save: () => Promise<void>
}

interface PerDiemFormProps {
  mode: 'new' | 'edit'
  perDiemId?: string
  onClose?: () => void
  onSaved?: () => void
}

function calcDays(start: string, end: string): number {
  try {
    const s = new Date(start)
    const e = new Date(end)
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0
    return Math.floor((e.getTime() - s.getTime()) / 86_400_000) + 1
  } catch { return 0 }
}

const PerDiemForm = forwardRef<PerDiemFormHandle, PerDiemFormProps>(
  function PerDiemForm({ mode, perDiemId, onClose, onSaved }, ref) {
    const toast = useToast()
    const { companyId } = useCompanyId()
    const { currency } = useCompanyCurrency()

    const [employees, setEmployees] = useState<Employee[]>([])
    const [employeeId, setEmployeeId] = useState('')
    const [destination, setDestination] = useState('')
    const [purpose, setPurpose] = useState('')
    const [startDate, setStartDate] = useState(today)
    const [endDate, setEndDate] = useState(today)
    const [dailyRate, setDailyRate] = useState(0)
    const [status, setStatus] = useState('DRAFT')
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const days = useMemo(() => calcDays(startDate, endDate), [startDate, endDate])
    const totalAmount = useMemo(() => days * dailyRate, [days, dailyRate])

    useEffect(() => {
      if (!companyId) return
      let active = true
      expensesService.listEmployees(companyId, { limit: 100 })
        .then((res) => {
          if (!active) return
          const data = res.data ?? res
          const items = Array.isArray(data) ? data : data.data ?? []
          const mapped: Employee[] = items.map((item: Record<string, unknown>) => ({
            id: String(item.id),
            displayName: String(item.displayName ?? item.name ?? item.id),
          }))
          setEmployees(mapped)
          if (!employeeId && mapped.length > 0) setEmployeeId(mapped[0].id)
        })
        .catch(() => {})
      return () => { active = false }
    }, [companyId, employeeId])

    useEffect(() => {
      if (mode !== 'edit' || !perDiemId || !companyId) return
      let active = true
      expensesService.getPerDiem(companyId, perDiemId)
        .then((res) => {
          if (!active) return
          const data = res.data ?? res
          setEmployeeId(data.employeeId ?? '')
          setDestination(data.destination ?? '')
          setPurpose(data.purpose ?? '')
          setStartDate(data.startDate?.slice(0, 10) ?? today)
          setEndDate(data.endDate?.slice(0, 10) ?? today)
          setDailyRate(Number(data.dailyRate ?? 0))
          setStatus(data.status ?? 'DRAFT')
          setNotes(data.notes ?? '')
        })
        .catch(() => toast.error('Failed to load per diem claim'))
      return () => { active = false }
    }, [companyId, perDiemId, mode, toast])

    const validate = useCallback(() => {
      if (!companyId) { setError('Company not loaded'); return false }
      if (!employeeId) { setError('Employee is required'); return false }
      if (!destination.trim()) { setError('Destination is required'); return false }
      if (!startDate || !endDate) { setError('Start and end dates are required'); return false }
      if (days <= 0) { setError('End date must be on or after start date'); return false }
      if (dailyRate <= 0) { setError('Daily rate must be greater than zero'); return false }
      setError('')
      return true
    }, [companyId, employeeId, destination, startDate, endDate, days, dailyRate])

    const handleSave = useCallback(async () => {
      if (!companyId) return
      if (!validate()) return
      setSubmitting(true)
      try {
        const payload = {
          employeeId,
          destination,
          purpose,
          startDate,
          endDate,
          days,
          dailyRate,
          totalAmount,
          currency,
          status,
          notes,
        }
        if (mode === 'new') {
          await expensesService.createPerDiem(companyId, payload)
          toast.success('Per diem claim created')
        } else if (perDiemId) {
          await expensesService.updatePerDiem(companyId, perDiemId, payload)
          toast.success('Per diem claim updated')
        }
        if (onSaved) onSaved()
        else if (onClose) onClose()
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to save per diem claim'
        setError(msg)
        toast.error(msg)
      } finally {
        setSubmitting(false)
      }
    }, [companyId, validate, employeeId, destination, purpose, startDate, endDate, days, dailyRate, totalAmount, currency, status, notes, mode, perDiemId, onSaved, onClose, toast])

    useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

    return (
      <div className="space-y-6 bg-slate-50 text-slate-900">
        <div className="overflow-y-auto">
          <div className="px-4 py-6 space-y-6">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            )}

            {/* Employee & Status */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Employee <span className="text-rose-500">*</span></label>
                  <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    <option value="">Select employee</option>
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.displayName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Destination <span className="text-rose-500">*</span></label>
                  <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City, Country" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Purpose</label>
                  <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Reason for travel" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
            </section>

            {/* Travel dates & rate */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Travel Period & Rate</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Start Date <span className="text-rose-500">*</span></label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">End Date <span className="text-rose-500">*</span></label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Daily Rate <span className="text-rose-500">*</span></label>
                  <div className="mt-2 flex rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                    <span className="inline-flex items-center px-4 text-sm text-slate-500">{currency}</span>
                    <input type="number" value={dailyRate} min={0} step="0.01" onChange={(e) => setDailyRate(Number(e.target.value))} className="w-full rounded-none border-0 bg-transparent px-4 py-3 text-sm text-slate-900 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Auto-calculated summary */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
                  <p className="text-xs text-slate-500">Days</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{days}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
                  <p className="text-xs text-slate-500">Daily Rate</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(dailyRate, currency)}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                  <p className="text-xs text-emerald-600">Total Amount</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-800">{formatCurrency(totalAmount, currency)}</p>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <label className="block text-sm font-semibold text-slate-900">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
            </section>
          </div>
        </div>
      </div>
    )
  }
)

export default PerDiemForm
