"use client"
import React from 'react'
import Link from 'next/link'
import { formatInteger, formatPercentFromPct } from '@/lib/format'
import { useCurrency } from '@/components/CurrencyProvider'
// Client component implementing interactive collections overview (selection + reminders)

interface OverviewRow {
  customerId: string
  name: string
  openInvoices: number
  openBalance: number
  overdueBalance: number
  netReceivable: number
  lastPaymentDate?: string | null
  daysSinceLastPayment?: number | null
  nextDueDate?: string | null
  creditLimit?: number | null
  creditUtilizationPct?: number | null
  riskLevel: 'low' | 'moderate' | 'elevated' | 'critical'
  lastReminderDate?: string | null
  daysSinceLastReminder?: number | null
  maxReminderCount?: number | null
  worstDunningStage?: 'Stage1' | 'Stage2' | 'Stage3' | 'Stage4' | null
  openPromises?: number | null
  nextPromiseDate?: string | null
  promiseAgingDays?: number | null
}

async function fetchOverview(): Promise<{ asOf: string; rows: OverviewRow[]; totals: any }> {
  const asOf = new Date().toISOString().slice(0,10)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/collections/overview?asOf=${asOf}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load collections overview')
  const json = await res.json()
  return json.overview
}

function RiskBadge({ level }: { level: OverviewRow['riskLevel'] }) {
  const styles: Record<string,string> = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    moderate: 'bg-amber-100 text-amber-700 border-amber-300',
    elevated: 'bg-orange-100 text-orange-700 border-orange-300',
    critical: 'bg-red-100 text-red-700 border-red-300'
  }
  return <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[level]}`}>{level}</span>
}


export default function CollectionsPageWrapper() {
  return <CollectionsClient />
}

function CollectionsClient() {
  const { formatCurrency } = useCurrency()
  const [loading, setLoading] = React.useState(true)
  const [overview, setOverview] = React.useState<{ asOf: string; rows: OverviewRow[]; totals: any } | null>(null)
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const [sending, setSending] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [stmtType, setStmtType] = React.useState<'open-item'|'transaction'|'balance-forward'>('open-item')
  const [stmtStart, setStmtStart] = React.useState<string>('')
  const [riskFilter, setRiskFilter] = React.useState<string>('')
  const [stageFilter, setStageFilter] = React.useState<string>('')
  const [openPromiseOnly, setOpenPromiseOnly] = React.useState<boolean>(false)
  const [brokenPromiseOnly, setBrokenPromiseOnly] = React.useState<boolean>(false)
  const [search, setSearch] = React.useState('')
  const [promiseForm, setPromiseForm] = React.useState<{ customerId: string; amount: string; date: string; note: string } | null>(null)
  const [promiseSubmitting, setPromiseSubmitting] = React.useState(false)

  React.useEffect(()=>{ (async ()=>{ try { const data = await fetchOverview(); setOverview(data) } finally { setLoading(false) } })() },[])

  function toggle(id: string) { setSelected(s => ({ ...s, [id]: !s[id] })) }
  function toggleAll() { if (!overview) return; const allSelected = overview.rows.every(r => selected[r.customerId]); if (allSelected) { setSelected({}) } else { const map: Record<string, boolean> = {}; overview.rows.forEach(r=> map[r.customerId]=true); setSelected(map) } }

  async function sendReminders() {
    if (!overview) return
    const ids = Object.keys(selected).filter(k=> selected[k])
    if (!ids.length) { setMessage('Select at least one customer'); return }
    setSending(true); setMessage(null)
    try {
      const res = await fetch('/api/collections/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerIds: ids }) })
      if (!res.ok) throw new Error('Failed to send reminders')
      const json = await res.json()
      const totalSent = json.results.reduce((s: number, r: any)=> s + r.sent, 0)
      setMessage(`Reminders sent: ${totalSent} (${json.results.length} customers)`)    
    } catch (e: any) {
      setMessage(e?.message || 'Reminder dispatch failed')
    } finally { setSending(false) }
  }

  async function sendStatements() {
    if (!overview) return
    const ids = Object.keys(selected).filter(k=> selected[k])
    if (!ids.length) { setMessage('Select at least one customer'); return }
    setSending(true); setMessage(null)
    try {
      const results: any[] = []
      for (const cid of ids) {
        const sp = new URLSearchParams({ asOf: overview.asOf })
        if (stmtStart) sp.set('start', stmtStart)
        if (stmtType) sp.set('type', stmtType)
        const url = `/api/customers/${encodeURIComponent(cid)}/statement/send?` + sp.toString()
        const res = await fetch(url, { method: 'POST' })
        let messageId: string | undefined
        if (res.ok) { const j = await res.json().catch(()=>null); messageId = j?.result?.messageId }
        results.push({ cid, ok: res.ok, messageId })
      }
      const ok = results.filter(r=> r.ok)
      const fail = results.filter(r=> !r.ok)
      const idCount = ok.filter(r=> r.messageId).length
      setMessage(`Statements queued: ${ok.length}/${ids.length}${idCount ? ` (${idCount} with ids)` : ''}${fail.length ? `, failed: ${fail.length}` : ''}`)
    } catch (e:any) {
      setMessage(e?.message || 'Failed to queue statements')
    } finally { setSending(false) }
  }

  function riskTooltip(level: OverviewRow['riskLevel']) {
    switch(level) {
      case 'critical': return 'High overdue ratio, long payment gap, or extreme utilization'
      case 'elevated': return 'Meaningful delinquency or high utilization'
      case 'moderate': return 'Early signs of aging or rising utilization'
      default: return 'Healthy'
    }
  }

  const filteredRows = React.useMemo(()=>{
    if (!overview) return [] as OverviewRow[]
    return overview.rows.filter(r => {
      if (riskFilter && r.riskLevel !== riskFilter) return false
      if (stageFilter && r.worstDunningStage !== stageFilter) return false
      if (openPromiseOnly && !(r.openPromises && r.openPromises > 0)) return false
      if (brokenPromiseOnly && !(r.promiseAgingDays != null)) return false
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [overview, riskFilter, stageFilter, openPromiseOnly, brokenPromiseOnly, search])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold">Collections Overview</h1>
        <div className="flex items-center gap-3 text-sm">
          {overview && <span className="text-gray-500">As of {overview.asOf}</span>}
          <button disabled={sending || !overview} onClick={sendReminders} className="btn-primary disabled:opacity-50">
            {sending ? 'Sending…' : 'Send Reminders'}
          </button>
          <div className="hidden sm:flex items-end gap-2">
            <div className="flex flex-col">
              <label htmlFor="stmt-type" className="text-[10px] text-gray-600">Statement Type</label>
              <select id="stmt-type" aria-label="Statement Type" value={stmtType} onChange={e=> setStmtType(e.target.value as any)} className="border rounded px-2 py-1 text-sm min-w-[10rem]">
                <option value="open-item">Open item</option>
                <option value="transaction">Transaction</option>
                <option value="balance-forward">Balance forward</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="stmt-start" className="text-[10px] text-gray-600">Start</label>
              <input id="stmt-start" aria-label="Statement start date" type="date" value={stmtStart} onChange={e=> setStmtStart(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <button disabled={sending || !overview} onClick={sendStatements} className="btn-secondary disabled:opacity-50">Send Statements</button>
          </div>
          <button disabled={!filteredRows.length || !overview} onClick={async()=>{
            if (!overview) return
            const url = `/api/collections/overview/export?asOf=${overview.asOf}`
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) { setMessage('Export failed'); return }
            const blob = await res.blob()
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `collections-overview-${overview.asOf}.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()
          }} className="btn-secondary disabled:opacity-50">Export CSV</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600">Risk</label>
          <select aria-label="Risk filter" value={riskFilter} onChange={e=>setRiskFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="elevated">Elevated</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600">Dunning Stage</label>
          <select aria-label="Stage filter" value={stageFilter} onChange={e=>setStageFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="">All</option>
            <option value="Stage4">Stage4</option>
            <option value="Stage3">Stage3</option>
            <option value="Stage2">Stage2</option>
            <option value="Stage1">Stage1</option>
          </select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm select-none">
          <input type="checkbox" checked={openPromiseOnly} onChange={e=>setOpenPromiseOnly(e.target.checked)} />
          <span>Has open promise</span>
        </label>
        <label className="inline-flex items-center gap-2 text-sm select-none">
          <input type="checkbox" checked={brokenPromiseOnly} onChange={e=>setBrokenPromiseOnly(e.target.checked)} />
          <span>Has broken promise</span>
        </label>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600">Search</label>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Customer name" className="border rounded px-2 py-1 text-sm" />
        </div>
      </div>
      {promiseForm && (
        <div className="border rounded p-3 bg-white shadow-sm space-y-2 max-w-md">
          <h2 className="font-semibold text-sm">Record Promise-To-Pay</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">Amount</span>
              <input type="number" step="0.01" value={promiseForm.amount} onChange={e=>setPromiseForm(f=> f ? { ...f, amount: e.target.value } : f)} className="border rounded px-2 py-1" />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">Promised Date</span>
              <input type="date" value={promiseForm.date} onChange={e=>setPromiseForm(f=> f ? { ...f, date: e.target.value } : f)} className="border rounded px-2 py-1 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">Note (optional)</span>
              <textarea value={promiseForm.note} onChange={e=>setPromiseForm(f=> f ? { ...f, note: e.target.value } : f)} className="border rounded px-2 py-1" rows={2} />
            </label>
          </div>
          <div className="flex gap-2 text-sm">
            <button disabled={promiseSubmitting} onClick={async()=>{
              if (!promiseForm) return
              if (!promiseForm.amount || !promiseForm.date) { setMessage('Amount and date required'); return }
              setPromiseSubmitting(true); setMessage(null)
              try {
                const res = await fetch('/api/collections/promises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId: promiseForm.customerId, amount: Number(promiseForm.amount), promisedDate: promiseForm.date, note: promiseForm.note }) })
                if (!res.ok) throw new Error('Failed to record promise')
                setMessage('Promise recorded')
                setPromiseForm(null)
                // Refresh overview to show new promise counts
                setLoading(true)
                try { const data = await fetchOverview(); setOverview(data) } finally { setLoading(false) }
              } catch(e:any) { setMessage(e?.message || 'Promise create failed') }
              finally { setPromiseSubmitting(false) }
            }} className="btn-primary disabled:opacity-50">{promiseSubmitting ? 'Saving…' : 'Save Promise'}</button>
            <button disabled={promiseSubmitting} onClick={()=> setPromiseForm(null)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
      {message && <div className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded">{message}</div>}
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {!loading && overview && (
        <div className="overflow-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-2"><input type="checkbox" onChange={toggleAll} checked={overview.rows.length>0 && overview.rows.every(r=> selected[r.customerId])} aria-label="Select all" /></th>
                <th className="p-2 font-medium">Customer</th>
                <th className="p-2 font-medium text-right">Open Invoices</th>
                <th className="p-2 font-medium text-right">Open Balance</th>
                <th className="p-2 font-medium text-right">Overdue</th>
                <th className="p-2 font-medium text-right">Net AR</th>
                <th className="p-2 font-medium text-right">Credit Util %</th>
                <th className="p-2 font-medium text-right">Days Since Pay</th>
                <th className="p-2 font-medium">Risk</th>
                <th className="p-2 font-medium">Next Due</th>
                <th className="p-2 font-medium">Last Pay</th>
                <th className="p-2 font-medium text-right">Days Since Reminder</th>
                <th className="p-2 font-medium text-right">Reminders</th>
                <th className="p-2 font-medium">Dunning</th>
                <th className="p-2 font-medium text-right">Open Promises</th>
                <th className="p-2 font-medium">Next Promise</th>
                <th className="p-2 font-medium">Promise Aging</th>
                <th className="p-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(r => (
                <tr key={r.customerId} className={`border-b hover:bg-gray-50 ${selected[r.customerId] ? 'bg-blue-50/40' : ''}`}>              
                  <td className="p-2 align-middle">
                    <input type="checkbox" checked={!!selected[r.customerId]} onChange={()=>toggle(r.customerId)} aria-label={`Select ${r.name}`} />
                  </td>
                  <td className="p-2 align-middle">
                    <Link className="text-blue-600 hover:underline" href={`/sales/statements/${r.customerId}`}>{r.name}</Link>
                  </td>
                  <td className="p-2 text-right tabular-nums font-mono align-middle">{formatInteger(r.openInvoices)}</td>
                  <td className="p-2 text-right tabular-nums font-mono align-middle">{formatCurrency(r.openBalance)}</td>
                  <td className="p-2 text-right tabular-nums font-mono align-middle">{formatCurrency(r.overdueBalance)}</td>
                  <td className="p-2 text-right tabular-nums font-mono align-middle">{formatCurrency(r.netReceivable)}</td>
                  <td className="p-2 text-right tabular-nums font-mono align-middle">{r.creditUtilizationPct == null ? '—' : formatPercentFromPct(r.creditUtilizationPct, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                  <td className="p-2 text-right tabular-nums font-mono align-middle">{formatInteger(r.daysSinceLastPayment as any)}</td>
                  <td className="p-2 align-middle" title={riskTooltip(r.riskLevel)}><RiskBadge level={r.riskLevel} /></td>
                  <td className="p-2 align-middle">{r.nextDueDate || '—'}</td>
                  <td className="p-2 align-middle">{r.lastPaymentDate || '—'}</td>
                  <td className="p-2 text-right tabular-nums font-mono align-middle">{formatInteger(r.daysSinceLastReminder as any)}</td>
                  <td className="p-2 text-right tabular-nums font-mono align-middle">{formatInteger(r.maxReminderCount as any)}</td>
                  <td className="p-2 align-middle">{r.worstDunningStage || '—'}</td>
                  <td className="p-2 text-right tabular-nums font-mono align-middle">{formatInteger(r.openPromises as any)}</td>
                  <td className="p-2 align-middle">{r.nextPromiseDate || '—'}</td>
                  <td className="p-2 align-middle">
                    {r.promiseAgingDays != null ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded border bg-red-100 text-red-700 border-red-300" title="Days since most recent broken commitment">
                        Broken {formatInteger(r.promiseAgingDays as any)}d
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-2 align-middle text-xs space-y-1">
                    <div>
                      <button onClick={()=> setPromiseForm({ customerId: r.customerId, amount: '', date: '', note: '' })} className="text-blue-600 hover:underline">Record Promise</button>
                    </div>
                    <div>
                      <a className="text-sky-700 hover:underline text-xs" href={`/collections/reminders/history?customerId=${encodeURIComponent(r.customerId)}&start=&end=&asOf=${encodeURIComponent(overview?.asOf || '')}`}>Reminder history</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="p-2" colSpan={2}>Totals ({formatInteger(overview.totals.customers as any)} customers)</td>
                <td className="p-2" />
                <td className="p-2 text-right font-medium tabular-nums font-mono">{formatCurrency(overview.totals.openBalance)}</td>
                <td className="p-2 text-right font-medium tabular-nums font-mono">{formatCurrency(overview.totals.overdueBalance)}</td>
                <td className="p-2 text-right font-medium tabular-nums font-mono">{formatCurrency(overview.totals.netReceivable)}</td>
                <td className="p-2" colSpan={11}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-500">Sorted by risk severity, overdue amount, then open balance for focused follow-up. Dunning stage escalates with cumulative reminders. Use Record Promise to capture a customer commitment date and surface it for prioritization.</p>
    </div>
  )
}
