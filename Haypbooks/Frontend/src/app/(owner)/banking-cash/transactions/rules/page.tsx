'use client'

import { useState, useMemo } from 'react'
import { Edit2, Plus, Trash2, X, Check } from 'lucide-react'
import { MOCK_RULES, MOCK_COA_ACCOUNTS, type MockRule } from '../mockGLState'

let ruleCounter = 9

function nextRuleId() {
  return `rule-${String(ruleCounter++).padStart(3, '0')}`
}

interface RuleFormState {
  name: string
  matchKeyword: string
  accountId: string
  transactionType: 'Bank Payment' | 'Bank Receipt'
}

const EMPTY_FORM: RuleFormState = {
  name: '',
  matchKeyword: '',
  accountId: '',
  transactionType: 'Bank Payment',
}

export default function RulesPage() {
  const [rules, setRules] = useState<MockRule[]>(() => [...MOCK_RULES])
  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RuleFormState>(EMPTY_FORM)
  const [coaSearch, setCoaSearch] = useState('')
  const [coaOpen, setCoaOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredCoa = useMemo(() => {
    const q = coaSearch.toLowerCase()
    return q
      ? MOCK_COA_ACCOUNTS.filter(a => a.name.toLowerCase().includes(q) || a.code.includes(q))
      : MOCK_COA_ACCOUNTS
  }, [coaSearch])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setCoaSearch('')
    setEditingId(null)
    setAddOpen(true)
  }

  const openEdit = (rule: MockRule) => {
    setForm({
      name: rule.name,
      matchKeyword: rule.matchKeyword,
      accountId: rule.accountId,
      transactionType: (rule.transactionType as 'Bank Payment' | 'Bank Receipt') ?? 'Bank Payment',
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

  const handleSave = () => {
    if (!form.name.trim() || !form.matchKeyword.trim() || !form.accountId) return
    const acct = MOCK_COA_ACCOUNTS.find(a => a.id === form.accountId)
    if (!acct) return

    if (editingId) {
      const updated = rules.map(r => r.id === editingId
        ? { ...r, name: form.name.trim(), matchKeyword: form.matchKeyword.trim().toUpperCase(), accountId: form.accountId, accountName: acct.name, transactionType: form.transactionType }
        : r
      )
      setRules(updated)
      // Keep MOCK_RULES in sync
      const idx = MOCK_RULES.findIndex(r => r.id === editingId)
      if (idx >= 0) MOCK_RULES[idx] = { ...MOCK_RULES[idx], name: form.name.trim(), matchKeyword: form.matchKeyword.trim().toUpperCase(), accountId: form.accountId, accountName: acct.name, transactionType: form.transactionType }
    } else {
      const newRule: MockRule = {
        id: nextRuleId(),
        name: form.name.trim(),
        matchKeyword: form.matchKeyword.trim().toUpperCase(),
        accountId: form.accountId,
        accountName: acct.name,
        transactionType: form.transactionType,
      }
      setRules(prev => [...prev, newRule])
      MOCK_RULES.push(newRule)
    }
    closeModal()
  }

  const handleDelete = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
    const idx = MOCK_RULES.findIndex(r => r.id === id)
    if (idx >= 0) MOCK_RULES.splice(idx, 1)
    setDeleteConfirm(null)
  }

  const selectedAcct = MOCK_COA_ACCOUNTS.find(a => a.id === form.accountId)

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
        {rules.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <p className="text-sm">No rules yet. Click <strong className="text-slate-600">Add Rule</strong> to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-4">
                {/* Rule info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-800">{rule.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      rule.transactionType === 'Bank Payment' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {rule.transactionType === 'Bank Payment' ? 'Payment' : 'Receipt'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>If description contains <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{rule.matchKeyword}</code></span>
                    <span className="text-slate-300">→</span>
                    <span className="font-medium text-slate-700">{rule.accountName}</span>
                    {rule.contactName && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600">{rule.contactName}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
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
                      <button onClick={() => openEdit(rule)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(rule.id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">{editingId ? 'Edit Rule' : 'Add Rule'}</h2>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
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
                <input value={form.matchKeyword} onChange={e => setForm(f => ({ ...f, matchKeyword: e.target.value }))}
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
                              onClick={() => { setForm(f => ({ ...f, accountId: a.id })); setCoaOpen(false); setCoaSearch('') }}
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
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Transaction Type</label>
                <div className="flex gap-3">
                  {(['Bank Payment', 'Bank Receipt'] as const).map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={form.transactionType === t} onChange={() => setForm(f => ({ ...f, transactionType: t }))}
                        className="text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm text-slate-700">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <button onClick={closeModal}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.matchKeyword.trim() || !form.accountId}
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-1.5">
                <Check size={14} /> {editingId ? 'Save Changes' : 'Add Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
