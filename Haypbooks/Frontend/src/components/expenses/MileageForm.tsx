'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'

const today = new Date().toISOString().slice(0, 10)
const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']
const DISTANCE_UNITS = ['Miles', 'Kilometers']

interface Account {
  id: string
  code?: string
  name?: string
}

interface MileageFormProps {
  mode: 'new' | 'edit'
  logId?: string
}

export default function MileageForm({ mode, logId }: MileageFormProps) {
  const router = useRouter()
  const toast = useToast()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [accounts, setAccounts] = useState<Account[]>([])
  const [logNumber, setLogNumber] = useState('')
  const [logDate, setLogDate] = useState(today)
  const [status, setStatus] = useState('DRAFT')
  const [tripDate, setTripDate] = useState(today)
  const [purpose, setPurpose] = useState('')
  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')
  const [distance, setDistance] = useState(0)
  const [distanceUnit, setDistanceUnit] = useState('Miles')
  const [rate, setRate] = useState(0)
  const [vehicle, setVehicle] = useState('')
  const [personalVehicle, setPersonalVehicle] = useState(false)
  const [accountId, setAccountId] = useState('')
  const [billable, setBillable] = useState(false)
  const [clientProject, setClientProject] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!companyId) return
    let active = true
    accountingService.listAccounts(companyId, { includeInactive: false })
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        setAccounts(list.map((account: any) => ({ id: account.id, code: account.code, name: account.name })))
      })
      .catch(() => {})
    return () => { active = false }
  }, [companyId])

  useEffect(() => {
    if (mode !== 'edit' || !logId || !companyId) return
    let active = true
    expensesService.getMileageLog(companyId, logId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setLogNumber(data.logNumber ?? data.number ?? '')
        setLogDate(data.logDate?.slice(0, 10) ?? today)
        setStatus(data.status ?? 'DRAFT')
        setTripDate(data.tripDate?.slice(0, 10) ?? today)
        setPurpose(data.purpose ?? '')
        setStartLocation(data.startLocation ?? '')
        setEndLocation(data.endLocation ?? '')
        setDistance(Number(data.distance ?? 0))
        setDistanceUnit(data.distanceUnit ?? 'Miles')
        setRate(Number(data.rate ?? 0))
        setVehicle(data.vehicle ?? '')
        setPersonalVehicle(Boolean(data.personalVehicle))
        setAccountId(data.accountId ?? '')
        setBillable(Boolean(data.billable))
        setClientProject(data.clientProject ?? '')
        setNotes(data.notes ?? '')
      })
      .catch(() => toast.error('Failed to load mileage log'))
    return () => { active = false }
  }, [companyId, logId, mode, toast])

  useEffect(() => {
    if (!billable) setClientProject('')
  }, [billable])

  const amount = useMemo(() => Math.max(0, Number(distance || 0) * Number(rate || 0)), [distance, rate])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!tripDate) { setError('Trip date is required'); return false }
    if (!purpose.trim()) { setError('Purpose is required'); return false }
    if (!startLocation.trim()) { setError('Start location is required'); return false }
    if (!endLocation.trim()) { setError('End location is required'); return false }
    if (distance <= 0) { setError('Distance must be greater than zero'); return false }
    if (rate < 0) { setError('Rate must be zero or greater'); return false }
    if (billable && !clientProject.trim()) { setError('Client/Project is required when billable'); return false }
    setError('')
    return true
  }

  const payload = useMemo(() => ({
    logDate,
    status,
    tripDate,
    purpose,
    startLocation,
    endLocation,
    distance,
    distanceUnit,
    rate,
    amount,
    vehicle,
    personalVehicle,
    accountId: accountId || null,
    billable,
    clientProject: billable ? clientProject : null,
    notes,
  }), [logDate, status, tripDate, purpose, startLocation, endLocation, distance, distanceUnit, rate, amount, vehicle, personalVehicle, accountId, billable, clientProject, notes])

  const handleSave = async () => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      if (mode === 'new') {
        await expensesService.createMileageLog(companyId, payload)
        toast.success('Mileage log created')
      } else if (logId) {
        await expensesService.updateMileageLog(companyId, logId, payload)
        toast.success('Mileage log updated')
      }
      router.push('/expenses/expense-capture/mileage')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to save mileage log')
      toast.error('Unable to save mileage log')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/expense-capture/mileage')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to mileage
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Mileage Log' : 'Edit Mileage Log'}</h1>
                <p className="mt-1 text-sm text-slate-500">Capture mileage reimbursements with trip details.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="font-semibold">Log #</div>
              <div>{logNumber || 'Auto-generated'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-44">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Log Date</label>
                <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Trip Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Date of Trip</label>
                <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Purpose / Description</label>
                <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Purpose of trip" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Start Location</label>
                <input value={startLocation} onChange={(e) => setStartLocation(e.target.value)} placeholder="Start address" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">End Location</label>
                <input value={endLocation} onChange={(e) => setEndLocation(e.target.value)} placeholder="End address" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Distance</label>
                <div className="mt-2 flex gap-2">
                  <input type="number" value={distance} min={0} step="0.1" onChange={(e) => setDistance(Number(e.target.value))} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                  <select value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {DISTANCE_UNITS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Rate per {distanceUnit === 'Miles' ? 'Mile' : 'Km'}</label>
                <div className="mt-2 flex rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                  <span className="inline-flex items-center px-4 text-sm text-slate-500">{currency}</span>
                  <input type="number" value={rate} min={0} step="0.01" onChange={(e) => setRate(Number(e.target.value))} className="w-full rounded-none border-0 bg-transparent px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">Total Reimbursement</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(amount, currency)}</div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Vehicle & Expense Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Vehicle</label>
                <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="Vehicle description" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <input id="mileage-personal" type="checkbox" checked={personalVehicle} onChange={(e) => setPersonalVehicle(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="mileage-personal" className="text-sm font-semibold text-slate-900">Personal Vehicle</label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Account</label>
                <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  <option value="">Select account</option>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.code ? `${account.code} — ${account.name}` : account.name}</option>)}
                </select>
              </div>
              <div className="col-span-full">
                <div className="flex items-center gap-3">
                  <input id="mileage-billable" type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <label htmlFor="mileage-billable" className="text-sm font-semibold text-slate-900">Billable to Client</label>
                </div>
                {billable && (
                  <input value={clientProject} onChange={(e) => setClientProject(e.target.value)} placeholder="Client / Project" className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                )}
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-semibold text-slate-900">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : <p className="text-sm text-slate-500">Save the mileage log when you are ready.</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push('/expenses/expense-capture/mileage')} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={handleSave} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
