'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, Edit2, Plus, Trash2, X, Check, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/components/ToastProvider'
import { useCompanyId } from '@/hooks/useCompanyId'
import { bankingService } from '@/services/banking.service'

interface Rule {
  id: string
  companyId: string
  name: string
  priority: number
  matchType: string
  matchString: string
  amountRangeMin?: number | null
  amountRangeMax?: number | null
  assignmentAccountId?: string | null
  assignmentPayee?: string | null
  assignmentClassId?: string | null
  isActive: boolean
  assignmentAccountName?: string
  assignmentAccountCode?: string
}

interface CoaAccount {
  id: string
  code: string
  name: string
}

interface RuleFormState {
  name: string
  matchString: string
  assignmentAccountId: string
}

const EMPTY_FORM: RuleFormState = {
  name: '',
  matchString: '',
  assignmentAccountId: '',
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RuleFormState>(EMPTY_FORM)
  const [coaSearch, setCoaSearch] = useState('')
  const [coaOpen, setCoaOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [coa, setCoa] = useState<CoaAccount[]>([])
  const { companyId } = useCompanyId()
  const toast = useToast()

  const loadRules = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await bankingService.listSmartRules(companyId)
      setRules(data)
    } catch {
      toast.push({ type: 'error', message: 'Failed to load rules' })
    } finally {
      setLoading(false)
    }
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCoa = useCallback(async () => {
    if (!companyId) return
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/accounts`)
      const fetched = (Array.isArray(data) ? data : data?.accounts ?? []).map((a: any): CoaAccount => ({
        id: a.id,
        code: a.code ?? '',
        name: a.name,
      }))
      if (fetched.length > 0) setCoa(fetched)
    } catch {
      // silent — COA is non-critical for page load
    }
  }, [companyId])

  useEffect(() => {
    loadRules()
    loadCoa()
  }, [loadRules, loadCoa])

  const filteredCoa = useMemo(() => {
    const q = coaSearch.toLowerCase()
    return q
      ? coa.filter(a => a.name.toLowerCase().includes(q) || a.code.includes(q))
      : coa
  }, [coaSearch, coa])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setCoaSearch('')
    setEditingId(null)
    setAddOpen(true)
  }

  const openEdit = (rule: Rule) => {
    setForm({
      name: rule.name,
      matchString: rule.matchString,
      assignmentAccountId: rule.assignmentAccountId ?? '',
    })
    setCoaSearch('')
    setEditingId(rule.id)
    setAddOpen(true)
  }

  const closeModal = () => {
    setAddOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setCoaSearch('')
    setCoaOpen(false)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.matchString.trim() || !form.assignmentAccountId) return
    setSaving(true)
    try {
      if (editingId) {
        await bankingService.updateSmartRule(companyId!, editingId, {
          name: form.name.trim(),
          matchString: form.matchString.trim(),
          assignmentAccountId: form.assignmentAccountId,
        })
        toast.push({ type: 'success', message: 'Rule updated' })
      } else {
        await bankingService.createSmartRule(companyId!, {
          name: form.name.trim(),
          matchString: form.matchString.trim(),
          matchType: 'CONTAINS',
          assignmentAccountId: form.assignmentAccountId,
          isActive: true,
          priority: rules.length + 1,
        })
        toast.push({ type: 'success', message: 'Rule created' })
      }
      await loadRules()
      closeModal()
    } catch {
      toast.push({ type: 'error', message: editingId ? 'Failed to update rule' : 'Failed to create rule' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await bankingService.deleteSmartRule(companyId!, id)
      toast.push({ type: 'success', message: 'Rule deleted' })
      await loadRules()
      setDeleteConfirm(null)
    } catch {
      toast.push({ type: 'error', message: 'Failed to delete rule' })
    }
  }

  const toggleEnabled = async (id: string) => {
    const rule = rules.find(r => r.id === id)
    if (!rule) return
    try {
      await bankingService.updateSmartRule(companyId!, id, { isActive: !rule.isActive })
      await loadRules()
    } catch {
      toast.push({ type: 'error', message: 'Failed to update rule' })
    }
  }

  const moveRule = async (id: string, dir: 'up' | 'down') => {
    const idx = rules.findIndex(r => r.id === id)
    if (idx < 0) return
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= rules.length) return
    const cur = rules[idx]
    const swp = rules[swapIdx]
    try {
      await Promise.all([
        bankingService.updateSmartRule(companyId!, cur.id, { priority: swp.priority ?? swapIdx + 1 }),
        bankingService.updateSmartRule(companyId!, swp.id, { priority: cur.priority ?? idx + 1 }),
      ])
      await loadRules()
    } catch {
      toast.push({ type: 'error', message: 'Failed to reorder rules' })
    }
  }

  const selectedAcct = coa.find(a => a.id === form.assignmentAccountId)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Bank Rules</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Automatically categorize transactions based on description keywords.
            </p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
            <Plus size={15} /> Add Rule
          </button>
        </div>

        {/* Rules list */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-emerald-500" />
            <p className="text-sm">Loading rules…</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <p className="text-sm">No rules yet. Click <strong className="text-slate-600">Add Rule</strong> to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, rIdx) => (
              <div key={rule.id} className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-4">
                {/* Priority arrows */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button aria-label={`Move ${rule.name} up`} title={`Move ${rule.name} up`} onClick={() => moveRule(rule.id, 'up')} disabled={rIdx === 0}
                    className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors">
                    <ChevronUp size={14} />
                  </button>
                  <button aria-label={`Move ${rule.name} down`} title={`Move ${rule.name} down`} onClick={() => moveRule(rule.id, 'down')} disabled={rIdx === rules.length - 1}
                    className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors">
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Rule info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400 font-mono">#{rule.priority ?? rIdx + 1}</span>
                    <span className="text-sm font-semibold text-slate-800">{rule.name}</span>
                  </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>If description contains <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{rule.matchString}</code></span>
                    <span className="text-slate-300">→</span>
                    <span className="font-medium text-slate-700">{rule.assignmentAccountName ?? '—'}</span>
                    {rule.assignmentPayee && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600">{rule.assignmentPayee}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Enabled toggle + Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleEnabled(rule.id)}
                    title={rule.isActive ? 'Disable rule' : 'Enable rule'}
                    className={`p-1 rounded transition-colors ${
                      rule.isActive ? 'text-emerald-500 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-500'
                    }`}
                  >
                    {rule.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  {deleteConfirm === rule.id ? (
                    <>
                      <span className="text-xs text-slate-500 mr-1">Delete this rule?</span>
                      <button onClick={() => handleDelete(rule.id)}
                        className="px-2.5 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="px-2.5 py-1 text-xs border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">No</button>
                    </>
                  ) : (
                    <>
                          <button aria-label={`Edit ${rule.name}`} title={`Edit ${rule.name}`} onClick={() => openEdit(rule)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button aria-label={`Delete ${rule.name}`} title={`Delete ${rule.name}`} onClick={() => setDeleteConfirm(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">{editingId ? 'Edit Rule' : 'Add Rule'}</h2>
              <button aria-label="Close rule dialog" title="Close rule dialog" onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Rule Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. MERALCO Utility Bills"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">If description contains</label>
                <input value={form.matchString} onChange={e => setForm(f => ({ ...f, matchString: e.target.value }))}
                  placeholder="e.g. MERALCO"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Categorize As (Account)</label>
                <div className="relative">
                  <button type="button" onClick={() => setCoaOpen(o => !o)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-300 rounded-lg hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-left">
                    {selectedAcct
                      ? <span className="text-slate-800">{selectedAcct.code} · {selectedAcct.name}</span>
                      : <span className="text-slate-400">Select account…</span>}
                    <span className="text-slate-400 text-xs ml-2">▾</span>
                  </button>
                  {coaOpen && (
                    <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-slate-100">
                        <input autoFocus value={coaSearch} onChange={e => setCoaSearch(e.target.value)}
                          placeholder="Search accounts…"
                          className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <ul className="max-h-48 overflow-y-auto">
                        {filteredCoa.map(a => (
                          <li key={a.id}>
                            <button type="button"
                              onClick={() => { setForm(f => ({ ...f, assignmentAccountId: a.id })); setCoaOpen(false); setCoaSearch('') }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                              <span className="font-mono text-slate-400 text-xs w-12 shrink-0">{a.code}</span>
                              <span className="text-slate-700">{a.name}</span>
                            </button>
                          </li>
                        ))}
                        {filteredCoa.length === 0 && <li className="px-3 py-3 text-xs text-slate-400 text-center">No accounts found</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <button onClick={closeModal}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.matchString.trim() || !form.assignmentAccountId}
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {editingId ? 'Save Changes' : 'Add Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
