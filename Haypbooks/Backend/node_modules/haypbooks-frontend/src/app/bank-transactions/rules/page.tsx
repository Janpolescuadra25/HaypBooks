"use client"
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { PrintButton } from '@/components/ReportActions'

type Rule = {
  id: string
  name: string
  textIncludes?: string
  amountEquals?: number
  setCategory?: 'Income' | 'Expense' | 'Transfer'
  setStatus?: 'for_review' | 'categorized' | 'excluded'
}

function RulesInner() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New rule form state + validation
  const [name, setName] = useState('')
  const [textIncludes, setTextIncludes] = useState('')
  const [amountEquals, setAmountEquals] = useState('')
  const [setCategory, setSetCategory] = useState<'' | 'Income' | 'Expense' | 'Transfer'>('')
  const [setStatus, setSetStatus] = useState<'' | 'for_review' | 'categorized' | 'excluded'>('')
  const nameError = !name.trim() ? 'Name is required' : ''
  const amtError = amountEquals.trim() && isNaN(Number(amountEquals)) ? 'Amount must be a number' : ''
  const formInvalid = !!nameError || !!amtError

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/bank-feeds/rules', { cache: 'no-store' })
      if (!r.ok) throw new Error('Failed to load rules')
      const j = await r.json()
      setRules(Array.isArray(j.rules) ? j.rules : [])
    } catch (e: any) {
      setError(e.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addRule = async () => {
    if (formInvalid) return
    try {
      const body: any = { name: name.trim() }
      if (textIncludes.trim()) body.textIncludes = textIncludes.trim()
      if (amountEquals.trim()) body.amountEquals = Number(amountEquals)
      if (setCategory) body.setCategory = setCategory
      if (setStatus) body.setStatus = setStatus
      const r = await fetch('/api/bank-feeds/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || 'Create failed')
      const j = await r.json().catch(() => ({}))
      const created: Rule | undefined = j?.rule
      if (created) setRules((prev) => [created, ...prev])
      setName('')
      setTextIncludes('')
      setAmountEquals('')
      setSetCategory('')
      setSetStatus('')
    } catch (e: any) {
      alert(e.message || 'Failed to create rule')
    }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this rule?')) return
    try {
      const r = await fetch(`/api/bank-feeds/rules?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || 'Delete failed')
      setRules((prev) => prev.filter((rr) => rr.id !== id))
    } catch (e: any) {
      alert(e.message || 'Failed to delete')
    }
  }

  const apply = async () => {
    try {
      const r = await fetch('/api/bank-feeds/apply-rules', { method: 'POST' })
      if (!r.ok) throw new Error('Apply failed')
      const j = await r.json().catch(() => null)
      alert(`Applied rules. Updated ${j?.updated ?? 0} transactions.`)
      await load()
    } catch (e: any) {
      alert(e.message || 'Failed to apply rules')
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-base font-medium text-slate-900">Rules</div>
            <div className="text-sm text-slate-600">Automate categorization for imported and For Review transactions.</div>
          </div>
          <div className="flex items-center gap-2">
            <PrintButton />
            <button className="btn-primary" onClick={apply} title="Apply all rules to imported/for_review transactions">
              Apply rules
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="font-medium">New rule</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6 items-end">
          <div>
            <label className="block text-xs text-slate-600" htmlFor="r-name">Name</label>
            <input id="r-name" aria-describedby={nameError ? 'r-name-err' : undefined} className={`w-full rounded-lg border bg-white/80 px-2 py-1 ${nameError ? 'border-red-300' : 'border-slate-200'}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Rule name" />
            {nameError && (<div id="r-name-err" className="text-xs text-red-600 mt-1">{nameError}</div>)}
          </div>
          <div>
            <label className="block text-xs text-slate-600" htmlFor="r-text">Text includes</label>
            <input id="r-text" className="w-full rounded-lg border border-slate-200 bg-white/80 px-2 py-1" value={textIncludes} onChange={(e) => setTextIncludes(e.target.value)} placeholder="e.g. ONLINE" />
          </div>
          <div>
            <label className="block text-xs text-slate-600" htmlFor="r-amt">Amount equals</label>
            <input id="r-amt" inputMode="decimal" aria-describedby={amtError ? 'r-amt-err' : undefined} className={`w-full rounded-lg border bg-white/80 px-2 py-1 ${amtError ? 'border-red-300' : 'border-slate-200'}`} value={amountEquals} onChange={(e) => setAmountEquals(e.target.value)} placeholder="e.g. 5" />
            {amtError && (<div id="r-amt-err" className="text-xs text-red-600 mt-1">{amtError}</div>)}
          </div>
          <div>
            <label className="block text-xs text-slate-600" htmlFor="r-cat">Set category</label>
            <select id="r-cat" className="w-full rounded-lg border border-slate-200 bg-white/80 px-2 py-1" value={setCategory} onChange={(e) => setSetCategory(e.target.value as any)}>
              <option value="">—</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600" htmlFor="r-status">Set status</label>
            <select id="r-status" className="w-full rounded-lg border border-slate-200 bg-white/80 px-2 py-1" value={setStatus} onChange={(e) => setSetStatus(e.target.value as any)}>
              <option value="">—</option>
              <option value="for_review">For Review</option>
              <option value="categorized">Categorized</option>
              <option value="excluded">Excluded</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary disabled:opacity-50" onClick={addRule} disabled={formInvalid}>Add rule</button>
            <button className="btn-secondary" onClick={apply}>Apply rules</button>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">Bank rules</div>
          <button className="btn-secondary !px-2 !py-1 text-xs" onClick={load} disabled={loading}>Refresh</button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Match</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-2 py-1 whitespace-nowrap">{r.name}</td>
                    <td className="px-2 py-1 text-slate-600">
                      {r.textIncludes ? `text includes "${r.textIncludes}"` : ''}
                      {r.textIncludes && r.amountEquals !== undefined ? '; ' : ''}
                      {r.amountEquals !== undefined ? `amount = ${r.amountEquals}` : ''}
                      {r.setCategory || r.setStatus ? (
                        <div className="text-xs text-slate-500">
                          → {r.setCategory ? `set category ${r.setCategory}` : ''}
                          {r.setCategory && r.setStatus ? ', ' : ''}
                          {r.setStatus ? `set status ${r.setStatus}` : ''}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-2 py-1">
                      <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => del(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {!rules.length && (
                  <tr>
                    <td className="px-2 py-3 text-slate-500" colSpan={3}>No rules configured.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RulesInner />
    </Suspense>
  )
}
