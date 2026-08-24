'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, Users, Database, HardDrive, Search, ArrowLeft, ArrowRight, X } from 'lucide-react'
import apiClient from '@/lib/api-client'

interface StorageCompany {
  companyId: string
  companyName: string
  dbStorageMb: number
  r2StorageMb: number
  planBaseLimitMb: number
  ownerOverrideMb: number | null
  safetyNetMb: number
  effectiveLimitMb: number
  usagePercent: number
  userCount: number
}

interface StorageUsageResponse {
  totalCompanies: number
  totalUsers: number
  totalDbStorageMb: number
  totalR2StorageMb: number
  companies: StorageCompany[]
}

const formatMbToGb = (mb: number) => `${(mb / 1024).toFixed(1)} GB`
const formatCount = (count: number) => count.toLocaleString()

const getTierLabel = (percent: number) => {
  if (percent > 80) return { label: 'Red (>80%)', className: 'bg-red-50 text-red-700' }
  if (percent > 60) return { label: 'Yellow (60-80%)', className: 'bg-amber-50 text-amber-700' }
  return { label: 'Green (<60%)', className: 'bg-emerald-50 text-emerald-700' }
}

export default function OwnerStoragePage() {
  const [data, setData] = useState<StorageUsageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<StorageCompany | null>(null)
  const [overrideMb, setOverrideMb] = useState('')
  const [removeOverride, setRemoveOverride] = useState(false)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get<StorageUsageResponse>('/api/owner/storage/usage')
      setData(response.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load storage data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    if (!alert) return
    const timeout = window.setTimeout(() => setAlert(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [alert])

  const companies = useMemo(() => {
    if (!data) return []
    return data.companies.filter(company =>
      company.companyName.toLowerCase().includes(search.toLowerCase().trim()),
    )
  }, [data, search])

  const totalPages = Math.max(1, Math.ceil(companies.length / 10))
  const currentPageCompanies = companies.slice((page - 1) * 10, page * 10)

  const greenCount = useMemo(() => companies.filter(c => c.usagePercent <= 60).length, [companies])
  const yellowCount = useMemo(() => companies.filter(c => c.usagePercent > 60 && c.usagePercent <= 80).length, [companies])
  const redCount = useMemo(() => companies.filter(c => c.usagePercent > 80).length, [companies])

  const totalCapacityGb = useMemo(() => {
    if (!data) return 0
    return data.companies.reduce((sum, c) => sum + c.effectiveLimitMb, 0) / 1024
  }, [data])

  const openModal = (company: StorageCompany) => {
    setSelectedCompany(company)
    setOverrideMb(company.ownerOverrideMb === null ? '' : String(company.ownerOverrideMb))
    setRemoveOverride(company.ownerOverrideMb === null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedCompany(null)
    setOverrideMb('')
    setRemoveOverride(false)
  }

  const saveOverride = async () => {
    if (!selectedCompany) return
    setSaving(true)
    try {
      let bodyOverride: number | null = null
      if (!removeOverride) {
        const trimmed = overrideMb.trim()
        if (trimmed === '') {
          bodyOverride = null
        } else {
          const parsed = Number(trimmed)
          if (!Number.isInteger(parsed) || parsed < 0) {
            throw new Error('Override must be a non-negative integer')
          }
          bodyOverride = parsed
        }
      }
      await apiClient.put(`/api/owner/storage/limits/${selectedCompany.companyId}`, { overrideMb: bodyOverride })
      setAlert({ type: 'success', message: 'Storage limit updated successfully' })
      closeModal()
      await loadData()
    } catch (err: any) {
      setAlert({ type: 'error', message: err?.response?.data?.message || err?.message || 'Failed to save override' })
    } finally {
      setSaving(false)
    }
  }

  const getBadge = (count: number, label: string, className: string) => (
    <span className={`${className} text-xs font-semibold px-3 py-1 rounded-full`}>{label}: {count}</span>
  )

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-sm text-emerald-700 font-semibold uppercase tracking-[0.2em]">Owner Storage</p>
            <h1 className="text-3xl font-bold text-slate-950">Storage Monitoring</h1>
          </div>
          <div className="space-y-1 text-sm text-slate-500">
            <p className="font-medium">Monitor platform-wide storage usage and manage per-company limits.</p>
          </div>
        </div>

        {alert && (
          <div className={`rounded-2xl px-4 py-3 text-sm ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            {alert.message}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -4 }} className="rounded-[20px] border border-emerald-100 bg-white shadow-sm p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Building2 size={24} /></div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Companies</span>
          </div>
          <p className="mt-6 text-4xl font-bold text-slate-950">{formatCount(data?.totalCompanies ?? 0)}</p>
          <p className="mt-2 text-sm text-slate-500">Total registered companies</p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="rounded-[20px] border border-emerald-100 bg-white shadow-sm p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Users size={24} /></div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Users</span>
          </div>
          <p className="mt-6 text-4xl font-bold text-slate-950">{formatCount(data?.totalUsers ?? 0)}</p>
          <p className="mt-2 text-sm text-slate-500">Active workspace users</p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="rounded-[20px] border border-emerald-100 bg-white shadow-sm p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Database size={24} /></div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">DB Storage</span>
          </div>
          <p className="mt-6 text-4xl font-bold text-slate-950">{formatMbToGb(data?.totalDbStorageMb ?? 0)}</p>
          <p className="mt-2 text-sm text-slate-500">PostgreSQL usage estimate</p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="rounded-[20px] border border-emerald-100 bg-white shadow-sm p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><HardDrive size={24} /></div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">R2 Storage</span>
          </div>
          <p className="mt-6 text-4xl font-bold text-slate-950">{formatMbToGb(data?.totalR2StorageMb ?? 0)}</p>
          <p className="mt-2 text-sm text-slate-500">Cloud object storage</p>
        </motion.div>
      </div>

      <div className="bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm">
        <p className="text-sm text-slate-500">{formatCount(data?.totalCompanies ?? 0)} companies across {totalCapacityGb.toFixed(1)} GB of total storage capacity</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {getBadge(greenCount, 'Green (<60%)', 'bg-emerald-50 text-emerald-700')}
          {getBadge(yellowCount, 'Yellow (60-80%)', 'bg-amber-50 text-amber-700')}
          {getBadge(redCount, 'Red (>80%)', 'bg-red-50 text-red-700')}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Per-Company Storage</h2>
            <p className="text-sm text-slate-500 mt-1">Filter, page, and adjust storage limits across all companies.</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-slate-600">Company Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Users</th>
                <th className="px-4 py-3 font-semibold text-slate-600">DB Storage</th>
                <th className="px-4 py-3 font-semibold text-slate-600">R2 Storage</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Plan Limit</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Safety Net</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Owner Override</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Effective Limit</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Usage %</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                new Array(10).fill(null).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {new Array(10).fill(null).map((__, col) => (
                      <td key={col} className="px-4 py-4 h-10 bg-slate-100" />
                    ))}
                  </tr>
                ))
              ) : currentPageCompanies.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">No companies match your search.</td>
                </tr>
              ) : (
                currentPageCompanies.map(company => {
                  const usageColor = company.usagePercent > 80 ? '#ef4444' : company.usagePercent > 60 ? '#f59e0b' : '#10b981'
                  return (
                    <tr key={company.companyId} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900">{company.companyName}</td>
                      <td className="px-4 py-4">{company.userCount}</td>
                      <td className="px-4 py-4">{formatMbToGb(company.dbStorageMb)}</td>
                      <td className="px-4 py-4">{formatMbToGb(company.r2StorageMb)}</td>
                      <td className="px-4 py-4">{formatMbToGb(company.planBaseLimitMb)}</td>
                      <td className="px-4 py-4">{formatMbToGb(company.safetyNetMb)}</td>
                      <td className="px-4 py-4">{company.ownerOverrideMb === null ? 'None' : formatMbToGb(company.ownerOverrideMb)}</td>
                      <td className="px-4 py-4">{formatMbToGb(company.effectiveLimitMb)}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-2 max-w-[180px]">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(company.usagePercent, 100)}%`, backgroundColor: usageColor }}
                            />
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600">{company.usagePercent.toFixed(1)}%</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => openModal(company)}
                          className="inline-flex items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          Set Limit
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && selectedCompany && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div className="w-full max-w-2xl rounded-[24px] bg-white border border-slate-200 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)]">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">Set Storage Limit</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">Set Storage Limit for {selectedCompany.companyName}</h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Plan Limit</div>
                      <div className="text-lg font-semibold text-slate-900">{formatMbToGb(selectedCompany.planBaseLimitMb)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Safety Net</div>
                      <div className="text-lg font-semibold text-slate-900">{formatMbToGb(selectedCompany.safetyNetMb)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 sm:col-span-2">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Current Effective Limit</div>
                      <div className="text-lg font-semibold text-slate-900">{formatMbToGb(selectedCompany.effectiveLimitMb)}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Owner Override (MB)</label>
                      <input
                        type="number"
                        min={0}
                        value={overrideMb}
                        onChange={e => setOverrideMb(e.target.value)}
                        disabled={removeOverride}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={removeOverride}
                          onChange={e => setRemoveOverride(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Remove custom override
                      </label>
                      <p className="text-sm text-slate-500">Leave empty to use plan default. Effective limit = max(plan, override) + 50GB safety net.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      onClick={closeModal}
                      className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveOverride}
                      disabled={saving}
                      className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
