'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
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
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAccountModal, setShowAccountModal] = useState(false)

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
    notes,
  }), [logDate, status, tripDate, purpose, startLocation, endLocation, distance, distanceUnit, rate, amount, vehicle, personalVehicle, accountId, billable, clientProject, notes, logNumber])

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

  return (
    <div className="space-y-6 text-slate-900">
      <div className="overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
          {error ? (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-4">Trip Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="mileageLogNumber" className="text-[10px] font-bold uppercase text-slate-400">Log Number</label>
                  <input
                    id="mileageLogNumber"
                    value={logNumber}
                    onChange={(e) => setLogNumber(e.target.value)}
                    placeholder="Auto-generated"
                    aria-label="Log Number"
                    className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="mileageLogDate" className="text-[10px] font-bold uppercase text-slate-400">Log Date</label>
                  <input
                    id="mileageLogDate"
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    aria-label="Log Date"
                    className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="mileageStatus" className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                  <HaypSelect
                    id="mileageStatus"
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS.map((o) => ({ value: o, label: o }))}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-4">Trip Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="mileageTripDate" className="text-[10px] font-bold uppercase text-slate-400">Date of Trip</label>
                  <input
                    id="mileageTripDate"
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    aria-label="Trip Date"
                    className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="mileagePurpose" className="text-[10px] font-bold uppercase text-slate-400">Purpose / Description</label>
                  <input
                    id="mileagePurpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Purpose of trip"
                    aria-label="Purpose"
                    className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="mileageStartLocation" className="text-[10px] font-bold uppercase text-slate-400">Start Location</label>
                  <input
                    id="mileageStartLocation"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="Start address"
                    aria-label="Start Location"
                    className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="mileageEndLocation" className="text-[10px] font-bold uppercase text-slate-400">End Location</label>
                  <input
                    id="mileageEndLocation"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    placeholder="End address"
                    aria-label="End Location"
                    className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="mileageDistance" className="text-[10px] font-bold uppercase text-slate-400">Distance</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="mileageDistance"
                      type="text"
                      inputMode="decimal"
                      value={distance !== 0 ? distance : ''}
                      onChange={(e) => setDistance(Number(e.target.value) || 0)}
                      placeholder="0.0"
                      aria-label="Distance"
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                    <HaypSelect
                      value={distanceUnit}
                      onChange={setDistanceUnit}
                      options={DISTANCE_UNITS.map((o) => ({ value: o, label: o }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-4">Vehicle & Rate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="mileageVehicle" className="text-[10px] font-bold uppercase text-slate-400">Vehicle</label>
                  <input
                    id="mileageVehicle"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="Vehicle description"
                    aria-label="Vehicle"
                    className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="mileageRate" className="text-[10px] font-bold uppercase text-slate-400">Rate per {distanceUnit === 'Miles' ? 'Mile' : 'Km'}</label>
                  <div className="mt-2 flex rounded-lg overflow-hidden">
                    <span className="inline-flex items-center px-3 text-sm text-slate-500 bg-white border-r border-slate-200">{currency}</span>
                    <input
                      id="mileageRate"
                      type="text"
                      inputMode="decimal"
                      value={rate !== 0 ? rate : ''}
                      onChange={(e) => setRate(Number(e.target.value) || 0)}
                      placeholder="0.00"
                      aria-label="Rate"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-right text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <CustomerPickerField
                    label="Account"
                    value={accountId}
                    customers={accountOptions}
                    placeholder="Search accounts…"
                    createLabel="+ New Account"
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
                <div className="md:col-span-2">
                  <div className="rounded-lg bg-white border border-slate-200 p-4">
                    <div className="text-sm text-slate-600">Total Reimbursement</div>
                    <div className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(amount, currency)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-4">Notes</h3>
              <textarea
                id="mileageNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Enter notes..."
                aria-label="Notes"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-y"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const MileageForm = forwardRef<MileageFormHandle, MileageFormProps>(MileageFormInner);

(MileageForm as any).displayName = 'MileageForm'

export default MileageForm
