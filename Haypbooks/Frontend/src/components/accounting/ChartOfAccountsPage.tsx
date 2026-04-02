'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Search, Filter, ChevronDown, ChevronRight, Edit2, Trash2, Eye,
  Download, Upload, MoreHorizontal, X, Check, AlertCircle, Loader2,
  BookOpen, ArrowUpDown
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

/* ─── types ─── */
interface Account {
  id: string
  code: string
  name: string
  type: string
  subType?: string
  parentId?: string | null
  balance: number
  isActive: boolean
  description?: string
  currency?: string
  children?: Account[]
}

interface AccountType {
  value: string
  label: string
}

const ACCOUNT_TYPES: AccountType[] = [
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Expense', label: 'Expense' },
]

const typeColors: Record<string, string> = {
  Asset: 'bg-blue-50 text-blue-700 border-blue-200',
  Liability: 'bg-amber-50 text-amber-700 border-amber-200',
  Equity: 'bg-purple-50 text-purple-700 border-purple-200',
  Revenue: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Expense: 'bg-red-50 text-red-700 border-red-200',
}

/* ─── main ─── */
export default function ChartOfAccountsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [showInactive, setShowInactive] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(ACCOUNT_TYPES.map(t => t.value)))
  const [seeding, setSeeding] = useState(false)

  /* ─── fetch ─── */
  const fetchAccounts = useCallback(async (bustCache = false) => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/accounting/accounts`, {
        params: { includeInactive: showInactive, ...(bustCache ? { _t: Date.now() } : {}) },
      })
      setAccounts(Array.isArray(data) ? data : data.accounts ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }, [companyId, showInactive])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  /* ─── filter & group ─── */
  const filtered = useMemo(() => {
    let list = accounts
    if (!showInactive) list = list.filter(a => a.isActive)
    if (typeFilter !== 'ALL') list = list.filter(a => a.type === typeFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q))
    }
    return list
  }, [accounts, search, typeFilter, showInactive])

  const grouped = useMemo(() => {
    const map: Record<string, Account[]> = {}
    for (const a of filtered) {
      const t = a.type || 'OTHER'
      if (!map[t]) map[t] = []
      map[t].push(a)
    }
    return map
  }, [filtered])

  /* ─── actions ─── */
  const handleDelete = async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.delete(`/companies/${companyId}/accounting/accounts/${id}`)
      fetchAccounts()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete account')
    }
  }

  const toggleType = (type: string) => {
    setExpandedTypes(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const handleSeedTemplate = async () => {
    if (!companyId) return
    setSeeding(true)
    setError('')
    try {
      await apiClient.post(`/companies/${companyId}/accounting/accounts/seed-default`)
      await fetchAccounts(true)
      setExpandedTypes(new Set(ACCOUNT_TYPES.map(t => t.value)))
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to seed default accounts')
    } finally {
      setSeeding(false)
    }
  }

  /* ─── loading / error ─── */
  if (cidLoading || (loading && accounts.length === 0)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading Chart of Accounts…</span>
      </div>
    )
  }
  if (cidError) {
    return <div className="p-6 text-center text-red-600">{cidError}</div>
  }

  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Chart of Accounts</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedTemplate}
            disabled={seeding}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {seeding && <Loader2 size={16} className="animate-spin" />}
            Set Up Default COA Template
          </button>
          <button
            onClick={() => { setEditingAccount(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} /> Add Account
          </button>
        </div>
      </div>

      {/* filters */}
      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            placeholder="Search accounts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          <option value="ALL">All Types</option>
          {ACCOUNT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-emerald-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
          />
          Show inactive
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* grouped table */}
      <div className="space-y-3">
        {ACCOUNT_TYPES.map(type => {
          const items = grouped[type.value] ?? []
          if (items.length === 0 && typeFilter !== 'ALL') return null
          const expanded = expandedTypes.has(type.value)
          return (
            <div key={type.value} className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
              <button
                onClick={() => toggleType(type.value)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expanded ? <ChevronDown size={16} className="text-emerald-600" /> : <ChevronRight size={16} className="text-emerald-400" />}
                  <span className={`px-2 py-0.5 text-xs font-bold rounded border ${typeColors[type.value] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {type.label}
                  </span>
                  <span className="text-sm text-emerald-600/60">({items.length})</span>
                </div>
                <span className="text-sm font-semibold text-emerald-800">
                  {fmt(items.reduce((s, a) => s + (a.balance ?? 0), 0))}
                </span>
              </button>

              <AnimatePresence>
                {expanded && items.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-t border-emerald-50 bg-emerald-50/30">
                          <th className="text-left px-4 py-2 font-medium text-emerald-700">Code</th>
                          <th className="text-left px-4 py-2 font-medium text-emerald-700">Name</th>
                          <th className="text-left px-4 py-2 font-medium text-emerald-700 hidden md:table-cell">Sub-Type</th>
                          <th className="text-right px-4 py-2 font-medium text-emerald-700">Balance</th>
                          <th className="text-right px-4 py-2 font-medium text-emerald-700 w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(account => (
                          <tr key={account.id} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-xs text-emerald-600">{account.code}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-emerald-900">{account.name}</span>
                                {!account.isActive && (
                                  <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded">Inactive</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-emerald-600/60 hidden md:table-cell">{account.subType ?? '—'}</td>
                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">
                              {fmt(account.balance ?? 0)}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => { setEditingAccount(account); setShowForm(true) }}
                                  className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(account.id)}
                                  className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600"
                                  title="Deactivate"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>

              {expanded && items.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-emerald-400 border-t border-emerald-50">
                  No {type.label.toLowerCase()} accounts found.
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Account Form Modal */}
      <AnimatePresence>
        {showForm && (
          <AccountFormModal
            companyId={companyId!}
            account={editingAccount}
            accounts={accounts}
            onClose={() => { setShowForm(false); setEditingAccount(null) }}
            onSaved={() => { setShowForm(false); setEditingAccount(null); fetchAccounts() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──────────────── Account Form Modal ──────────────── */
function AccountFormModal({
  companyId, account, accounts, onClose, onSaved,
}: {
  companyId: string
  account: Account | null
  accounts: Account[]
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!account
  const [form, setForm] = useState({
    code: account?.code ?? '',
    name: account?.name ?? '',
    type: account?.type ?? 'Asset',
    parentId: account?.parentId ?? '',
    isActive: account?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const parentOptions = accounts.filter(a => a.type === form.type && a.id !== account?.id)

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setError('Code and Name are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        type: form.type,
        parentId: form.parentId || null,
        ...(isEdit ? { isActive: form.isActive } : {}),
      }
      if (isEdit) {
        await apiClient.put(`/companies/${companyId}/accounting/accounts/${account!.id}`, payload)
      } else {
        await apiClient.post(`/companies/${companyId}/accounting/accounts`, payload)
      }
      onSaved()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save account')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-900">{isEdit ? 'Edit Account' : 'New Account'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Account Code *</label>
              <input
                value={form.code}
                onChange={e => set('code', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Account Type *</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {ACCOUNT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Account Name *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="Cash in Bank"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Parent Account</label>
            <select
              value={form.parentId}
              onChange={e => set('parentId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">None (Top Level)</option>
              {parentOptions.map(a => (
                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
              ))}
            </select>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-emerald-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => set('isActive', e.target.checked)}
                className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              Active
            </label>
          )}
        </div>

        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
