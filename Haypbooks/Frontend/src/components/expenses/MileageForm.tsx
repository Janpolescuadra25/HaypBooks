'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import HaypAccountPicker from './HaypAccountPicker'
import HaypSelect from '@/components/shared/HaypSelect'
import { NewAccountModal } from '@/components/shared/NewAccountModal'

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
  onClose?: () => void
  onSaved?: () => void
}

export interface MileageFormHandle {
  save: () => Promise<void>
}

function MileageFormInner({ mode, logId, onClose, onSaved }: MileageFormProps, ref: React.ForwardedRef<MileageFormHandle>) {
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
  const [employeeId, setEmployeeId] = useState('')
  const [employees, setEmployees] = useState<Array<{ id: string; displayName: string }>>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')
  const { entries: activities, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: {
      tableName: 'Mileage',
      recordId: logId,
    },
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

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
        setStartLocation(data.fromLocation ?? data.startLocation ?? '')
        setEndLocation(data.toLocation ?? data.endLocation ?? '')
        setDistance(Number(data.miles ?? data.distance ?? 0))
        setDistanceUnit(data.distanceUnit ?? 'Miles')
        setRate(Number(data.ratePerMile ?? data.rate ?? 0))
        setVehicle(data.vehicle ?? '')
        setPersonalVehicle(Boolean(data.personalVehicle))
        setAccountId(data.accountId ?? '')
        setBillable(Boolean(data.isBillable ?? data.billable))
        setClientProject(data.projectId ?? data.clientProject ?? '')
        setNotes(data.notes ?? '')
      })
      .catch(() => toast.error('Failed to load mileage log'))
    return () => { active = false }
  }, [companyId, logId, mode, toast])

  useEffect(() => {
    if (!billable) setClientProject('')
  }, [billable])

  const amount = useMemo(() => Math.max(0, Number(distance || 0) * Number(rate || 0)), [distance, rate])
  const accountOptions = useMemo(() => accounts.map((a) => ({ id: a.id, name: a.code ? `${a.code} — ${a.name}` : a.name ?? a.id })), [accounts])

  const validate = useCallback(() => {
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
  }, [companyId, tripDate, purpose, startLocation, endLocation, distance, rate, billable, clientProject])

  const payload = useMemo(() => ({
    logNumber: logNumber || null,
    logDate,
    status,
    tripDate,
    purpose,
    fromLocation: startLocation,
    toLocation: endLocation,
    miles: distance,
    distanceUnit,
    ratePerMile: rate,
    amount,
    vehicle,
    personalVehicle,
    accountId: accountId || null,
    isBillable: billable,
    projectId: billable ? clientProject : null,
    employeeId: employeeId || null,
    attachments: attachments.map((file) => ({ name: file.name })),
    notes,
  }), [logDate, status, tripDate, purpose, startLocation, endLocation, distance, distanceUnit, rate, amount, vehicle, personalVehicle, accountId, billable, clientProject, employeeId, attachments, notes, logNumber])

  const handleSave = useCallback(async () => {
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
      if (onSaved) {
        onSaved()
      } else {
        router.push('/expenses/employee-expenses/mileage')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to save mileage log')
      toast.error('Unable to save mileage log')
    } finally {
      setSubmitting(false)
    }
  }, [companyId, validate, mode, logId, payload, toast, onSaved, router])

  useImperativeHandle(ref, () => ({
    save: handleSave,
  }), [handleSave])

  const handleApprove = useCallback(async () => {
    if (!companyId || !logId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      await expensesService.updateMileageLog(companyId, logId, { ...payload, status: 'APPROVED' })
      setStatus('APPROVED')
      toast.success('Mileage log approved')
      if (onSaved) onSaved()
      else router.push('/expenses/employee-expenses/mileage')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to approve mileage log')
      toast.error('Unable to approve mileage log')
    } finally {
      setSubmitting(false)
    }
  }, [companyId, logId, validate, payload, toast, onSaved, router])

  const handleCancel = useCallback(() => {
    if (onClose) onClose()
    else router.push('/expenses/employee-expenses/mileage')
  }, [onClose, router])

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <div className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <h1 className="text-xl font-semibold text-slate-900">{mode === 'new' ? 'New Mileage' : 'Edit Mileage'}</h1>
        </div>
      </div>
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
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

        {activeTab === 'details' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="flex flex-col">
            <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="w-full px-0 py-6">
                <div className="space-y-6 text-slate-900">
      <section>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
            <div className="w-1 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Trip Overview</h2>
          </div>
          <div className="px-4 pb-4 sm:px-5 lg:px-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="mileageLogNumber" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Log Number</label>
              <input
                id="mileageLogNumber"
                value={logNumber}
                onChange={(e) => setLogNumber(e.target.value)}
                placeholder="Auto-generated"
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mileageLogDate" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Log Date</label>
              <input
                id="mileageLogDate"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mileageStatus" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
              <HaypSelect
                id="mileageStatus"
                value={status}
                onChange={setStatus}
                options={STATUS_OPTIONS.map((o) => ({ value: o, label: o }))}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mileageEmployee" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee</label>
              <select
                id="mileageEmployee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
              >
                <option value="">Select employee</option>
                {/* TODO: fetch employees from API */}
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.displayName}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
            <div className="w-1 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Trip Details</h2>
          </div>
          <div className="px-4 pb-4 sm:px-5 lg:px-6">
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div className="space-y-1.5">
                <label htmlFor="mileageTripDate" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Trip</label>
                <input
                  id="mileageTripDate"
                  type="date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="mileagePurpose" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Purpose / Description</label>
                <input
                  id="mileagePurpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Purpose of trip"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="mileageStartLocation" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Location</label>
                <input
                  id="mileageStartLocation"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="Start address"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="mileageEndLocation" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">End Location</label>
                <input
                  id="mileageEndLocation"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="End address"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>
            <div className="mt-4 space-y-1.5 max-w-sm">
              <label htmlFor="mileageDistance" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Distance</label>
              <div className="flex gap-2">
                <input
                  id="mileageDistance"
                  type="text"
                  inputMode="decimal"
                  value={distance !== 0 ? distance : ''}
                  onChange={(e) => setDistance(Number(e.target.value) || 0)}
                  placeholder="0.0"
                  className="flex-1 h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
                <HaypSelect
                  value={distanceUnit}
                  onChange={setDistanceUnit}
                  options={DISTANCE_UNITS.map((o) => ({ value: o, label: o }))}
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none min-w-[120px]"
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
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Vehicle & Reimbursement</h2>
          </div>
          <div className="px-4 pb-4 sm:px-5 lg:px-6">
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div className="space-y-1.5">
                <label htmlFor="mileageVehicle" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle</label>
                <input
                  id="mileageVehicle"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="Vehicle description"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="mileageRate" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate per {distanceUnit === 'Miles' ? 'Mile' : 'Km'}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{currency}</span>
                  <input
                    id="mileageRate"
                    type="text"
                    inputMode="decimal"
                    value={rate !== 0 ? rate : ''}
                    onChange={(e) => setRate(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 py-2 text-sm font-bold text-slate-900 text-right focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5 max-w-sm mb-4">
              <HaypAccountPicker
                label="Account"
                value={accountId}
                accounts={accounts}
                placeholder="Search accounts…"
                createLabel="New Account"
                onChange={setAccountId}
                onCreateNew={() => setShowAccountModal(true)}
              />
              {companyId && (
                <NewAccountModal
                  open={showAccountModal}
                  companyId={companyId}
                  onClose={() => setShowAccountModal(false)}
                  onCreated={(a) => {
                    setAccounts((prev) => [{ id: a.id, code: a.code, name: a.name }, ...prev])
                    setAccountId(a.id)
                  }}
                />
              )}
            </div>
            <div className="grid gap-4 mb-4">
              <div className="flex items-center gap-3">
                <input
                  id="personalVehicle"
                  type="checkbox"
                  checked={personalVehicle || false}
                  onChange={(e) => setPersonalVehicle(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="personalVehicle" className="text-sm font-medium text-slate-700">Personal Vehicle</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="billable"
                  type="checkbox"
                  checked={billable || false}
                  onChange={(e) => setBillable(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="billable" className="text-sm font-medium text-slate-700">Billable to Client</label>
              </div>
              {billable && (
                <div className="space-y-1.5">
                  <label htmlFor="clientProject" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client / Project</label>
                  <input
                    id="clientProject"
                    type="text"
                    value={clientProject || ''}
                    onChange={(e) => setClientProject(e.target.value)}
                    placeholder="Project name or code"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              )}
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
              <label htmlFor="mileageAttachments" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attachments</label>
              <div className="mt-1">
                <input
                  id="mileageAttachments"
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
              id="mileageNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Enter additional details..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none resize-none"
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
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={handleCancel} className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
            {mode === 'edit' && (status === 'DRAFT' || status === 'SUBMITTED') && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="h-10 px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={16} />
                {submitting ? 'Approving...' : 'Approve'}
              </button>
            )}
            <button type="submit" disabled={submitting} className="h-10 px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20">{submitting ? 'Saving...' : mode === 'new' ? 'Save Mileage' : 'Update Mileage'}</button>
          </div>
        </div>
      </div>
    </form>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6 py-6">
            <ActivityLog entries={activities} loading={activityLoading} />
          </div>
        )}
      </div>
    </div>
  )
}

const MileageForm = forwardRef<MileageFormHandle, MileageFormProps>(MileageFormInner);

(MileageForm as any).displayName = 'MileageForm'

export default MileageForm
