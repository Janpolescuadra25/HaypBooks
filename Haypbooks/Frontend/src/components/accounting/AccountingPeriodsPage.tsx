'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2, AlertCircle, X, Lock, Unlock, Plus, Calendar, CheckCircle } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'

interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'OPEN' | 'CLOSED'
  closedAt?: string
  closedBy?: string
}

const statusStyles: Record<string, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-gray-50 text-gray-600 border-gray-200',
}

export default function AccountingPeriodsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const fetchPeriods = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/accounting/periods`)
      setPeriods(Array.isArray(data) ? data : data.periods ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load periods')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchPeriods() }, [fetchPeriods])

  const handleClose = async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/accounting/periods/${id}/close`)
      fetchPeriods()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to close period')
    }
  }

  const handleReopen = async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/accounting/periods/${id}/reopen`)
      fetchPeriods()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to reopen period')
    }
  }

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return d }
  }

  if (cidLoading || (loading && periods.length === 0)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading periods…</span>
      </div>
    )
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Accounting Periods</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">Manage fiscal periods and period closing</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> New Period
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Period cards */}
      <div className="grid gap-3">
        {periods.length === 0 ? (
          <div className="bg-white rounded-xl border border-emerald-100 p-12 text-center">
            <Calendar size={32} className="mx-auto mb-3 text-emerald-300" />
            <p className="text-emerald-400 text-sm">No accounting periods defined yet.</p>
          </div>
        ) : (
          periods.map(period => (
            <div key={period.id} className="bg-white rounded-xl border border-emerald-100 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${period.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {period.status === 'OPEN' ? <Unlock size={18} /> : <Lock size={18} />}
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">{period.name}</h3>
                  <p className="text-xs text-emerald-600/60">{fmtDate(period.startDate)} — {fmtDate(period.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded border ${statusStyles[period.status]}`}>
                  {period.status}
                </span>
                {period.status === 'OPEN' ? (
                  <button onClick={() => handleClose(period.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                    <Lock size={12} /> Close Period
                  </button>
                ) : (
                  <button onClick={() => handleReopen(period.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                    <Unlock size={12} /> Reopen
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Period Modal */}
      <AnimatePresence>
        {showForm && (
          <PeriodFormModal companyId={companyId!} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchPeriods() }} />
        )}
      </AnimatePresence>
    </div>
  )
}

function PeriodFormModal({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name || !startDate || !endDate) { setError('All fields are required.'); return }
    setSaving(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/accounting/periods`, { name, startDate, endDate })
      onSaved()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create period')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-900">New Accounting Period</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Period Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Q1 2024"
              className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Start Date *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">End Date *</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />} Create
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
