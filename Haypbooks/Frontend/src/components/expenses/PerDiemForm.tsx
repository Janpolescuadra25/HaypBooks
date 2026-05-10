'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import HaypSelect from '@/components/shared/HaypSelect'

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
  const router = useRouter()
    const { currency } = useCompanyCurrency()

    const [employees, setEmployees] = useState<Employee[]>([])
    const [employeeId, setEmployeeId] = useState('')
    const [destination, setDestination] = useState('')
    const [purpose, setPurpose] = useState('')
    const [startDate, setStartDate] = useState(today)
    const [endDate, setEndDate] = useState(today)
    const [dailyRate, setDailyRate] = useState(0)
    const [accountId, setAccountId] = useState('')
    const [departmentId, setDepartmentId] = useState('')
    const [accounts, setAccounts] = useState<Array<{ id: string; code?: string; name?: string }>>([])
    const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])
    const [attachments, setAttachments] = useState<File[]>([])
    const [status, setStatus] = useState('DRAFT')
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setAttachments(Array.from(e.target.files))
      }
    }

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
          accountId: accountId || null,
          departmentId: departmentId || null,
          attachments: attachments.map((file) => ({ name: file.name })),
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

    const handleCancel = useCallback(() => {
      if (onClose) onClose()
      else router.push('/expenses/employee-expenses/per-diem')
    }, [onClose, router])

    useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

    return (
      <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
        <div className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
            <h1 className="text-xl font-semibold text-slate-900">{mode === 'new' ? 'New Per Diem' : 'Edit Per Diem'}</h1>
          </div>
        </div>
        <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
            <div className="space-y-6">
        <section>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Trip Info</h2>
            </div>
            <div className="px-4 pb-4 sm:px-5 lg:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="perDiemEmployee" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee</label>
                  <HaypSelect
                    id="perDiemEmployee"
                    value={employeeId}
                    onChange={setEmployeeId}
                    options={employees.map((emp) => ({ value: emp.id, label: emp.displayName }))}
                    placeholder="Select employee"
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="perDiemDepartment" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</label>
                  <select
                    id="perDiemDepartment"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  >
                    <option value="">Select department</option>
                    {/* TODO: fetch departments from API */}
                    {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="perDiemDestination" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Destination</label>
                  <input
                    id="perDiemDestination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="City, Country"
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="perDiemPurpose" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Purpose</label>
                  <input
                    id="perDiemPurpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Reason for travel"
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="perDiemStatus" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                  <HaypSelect
                    id="perDiemStatus"
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Dates & Rate</h2>
            </div>
            <div className="px-4 pb-4 sm:px-5 lg:px-6">
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div className="space-y-1.5">
                  <label htmlFor="perDiemStartDate" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    id="perDiemStartDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="perDiemEndDate" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">End Date</label>
                  <input
                    id="perDiemEndDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="perDiemDailyRate" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{currency}</span>
                    <input
                      id="perDiemDailyRate"
                      type="text"
                      inputMode="decimal"
                      value={dailyRate !== 0 ? dailyRate : ''}
                      onChange={(e) => setDailyRate(Number(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-2 text-sm font-bold text-slate-900 text-right focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="perDiemAccount" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GL Account</label>
                  <select
                    id="perDiemAccount"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  >
                    <option value="">Select account</option>
                    {/* TODO: fetch accounts from API */}
                    {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name ? `${acc.name} (${acc.code ?? ''})` : acc.id}</option>)}
                  </select>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Attachments</h2>
            </div>
            <div className="px-4 pb-4 sm:px-5 lg:px-6">
              <div className="space-y-4">
                <label htmlFor="perDiemAttachments" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attachments</label>
                <div className="mt-1">
                  <input
                    id="perDiemAttachments"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
              <div className="w-1 h-6 bg-slate-300 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Notes</h2>
            </div>
            <div className="px-4 pb-4 sm:px-5 lg:px-6">
              <textarea
                id="perDiemNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Enter additional details..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none resize-none"
              />
            </div>
          </div>
        </section>
        
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
            </div>
          </div>
        </main>
        <div className="sticky bottom-0 z-40 shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.05)]">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={handleCancel} disabled={submitting} className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button type="button" onClick={() => { setStatus('DRAFT'); handleSave(); }} disabled={submitting} className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Save Draft</button>
              <button type="button" onClick={() => { setStatus('SUBMITTED'); handleSave(); }} disabled={submitting} className="h-10 px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20">Submit for Approval</button>
            </div>
          </div>
        </div>
      </form>
    )
  }
)

export default PerDiemForm
