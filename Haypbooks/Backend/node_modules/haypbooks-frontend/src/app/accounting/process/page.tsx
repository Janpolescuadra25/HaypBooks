'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useCurrency } from '@/components/CurrencyProvider'
import HelpPopover from '@/components/HelpPopover'
import ClosedThroughBanner from '@/components/ClosedThroughBanner'

interface Summary {
  asOf: string
  period: { start: string; end: string }
  ar: { customers: number; openInvoices: number; openBalance: number; overdueBalance: number; unappliedCredits: number; nextDueDate: string | null }
  receipts: { undeposited: { count: number; total: number }; deposits: { last30: { count: number; total: number }; totalCount: number } }
  ap: { vendors: number; openBills: number; openBalance: number; overdueBalance: number; creditsAvailable: number; nextDueDate: string | null }
  gl: { trialBalanceBalanced: boolean; accounts: number; journalEntries: number }
  kpis?: { dsoDays?: number | null; dpoDays?: number | null }
  settings: { accountingMethod: string; closeDate: string | null; allowBackdated: boolean }
}

export default function AccountingProcessPage() {
  const [data, setData] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { formatCurrency } = useCurrency()
  const [closePeriod, setClosePeriod] = useState<string>(() => new Date().toISOString().slice(0,7))
  const [closing, setClosing] = useState(false)
  const [closeMsg, setCloseMsg] = useState<string|null>(null)
  const [closeErr, setCloseErr] = useState<string|null>(null)
  const [reopening, setReopening] = useState(false)
  const [reopenMsg, setReopenMsg] = useState<string|null>(null)
  const [reopenErr, setReopenErr] = useState<string|null>(null)
  const [closePassword, setClosePassword] = useState<string>('')
  const [reopenReason, setReopenReason] = useState<string>('')
  const [pwdWorking, setPwdWorking] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<string|null>(null)
  const [pwdErr, setPwdErr] = useState<string|null>(null)
  const [newClosePassword, setNewClosePassword] = useState('')
  const [genClosingBusy, setGenClosingBusy] = useState(false)
  const [genClosingMsg, setGenClosingMsg] = useState<string|null>(null)
  const [genClosingErr, setGenClosingErr] = useState<string|null>(null)
  const [genClosingEntryId, setGenClosingEntryId] = useState<string|undefined>(undefined)
  // Adjusting journal quick entry state
  const [accounts, setAccounts] = useState<Array<{ id: string; number: string; name: string; type: string }>>([])
  const [adjDate, setAdjDate] = useState<string>('')
  const [adjFrom, setAdjFrom] = useState<string>('')
  const [adjTo, setAdjTo] = useState<string>('')
  const [adjAmount, setAdjAmount] = useState<string>('')
  const [adjMemo, setAdjMemo] = useState<string>('')
  const [adjReversing, setAdjReversing] = useState<boolean>(true)
  const [adjBusy, setAdjBusy] = useState(false)
  const [adjMsg, setAdjMsg] = useState<string|null>(null)
  const [adjErr, setAdjErr] = useState<string|null>(null)
  // Month-end checklist state
  const [checklist, setChecklist] = useState<Array<{ id: string; label: string; done: boolean }> | null>(null)
  const [checklistPeriod, setChecklistPeriod] = useState<string>('')
  const [checklistBusy, setChecklistBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const r = await fetch('/api/accounting/process/summary', { cache: 'no-store' })
        if (!r.ok) throw new Error('Failed to load summary')
        const json = await r.json()
        if (mounted) {
          setData(json)
          // Default adjusting date to period end once
          setAdjDate(prev => prev || json?.period?.end || prev)
          // Load checklist for current period
          try {
            const ck = await fetch(`/api/accounting/process/checklist?period=${encodeURIComponent((json?.period?.end || '').slice(0,7))}`)
            if (ck.ok) {
              const cj = await ck.json()
              if (mounted) { setChecklist(cj.items || []); setChecklistPeriod(cj.period || (json?.period?.end || '').slice(0,7)) }
            }
          } catch { /* ignore checklist load */ }
        }
      } catch (e: any) { if (mounted) setError(e?.message || 'Failed') } finally { if (mounted) setLoading(false) }
    })()
    return () => { mounted = false }
  }, [])

  // Load accounts for adjusting journal selects
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const r = await fetch('/api/accounts?includeInactive=1', { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json()
        if (!mounted) return
        const rows = Array.isArray(j?.rows) ? j.rows : (Array.isArray(j) ? j : [])
        const mapped = rows.map((a: any) => ({ id: a.id, number: a.number, name: a.name, type: a.type }))
        setAccounts(mapped)
      } catch { /* ignore */ }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <div role="status" aria-live="polite" className="p-6">Loading accounting process…</div>
  if (error) return <div role="alert" className="p-6 text-red-600">{error}</div>
  if (!data) return null

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Accounting process</h1>
        <p className="text-sm text-gray-600">As of {data.asOf} • Period {data.period.start} → {data.period.end}</p>
        <nav className="mt-2 text-sm flex gap-3">
          <Link className="text-teal-700 underline" href="/accountant/write-offs">Write-offs</Link>
          <Link className="text-teal-700 underline" href="/accountant/finance-charges">Finance charges</Link>
        </nav>
        <div className="mt-3 glass-card p-3 flex flex-col gap-2 max-w-xl">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600">Close books through</span>
              <input aria-label="Close books through period" type="text" inputMode="numeric" pattern="\\d{4}-\\d{2}" placeholder="YYYY-MM" value={closePeriod} onChange={e=>setClosePeriod(e.target.value)} className="border rounded p-2" />
            </label>
            <button className="btn btn-primary" disabled={closing} onClick={async ()=>{
              setClosing(true); setCloseErr(null); setCloseMsg(null)
              try {
                const res = await fetch('/api/accounting/month-end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'close_period', period: closePeriod, password: closePassword || undefined }) })
                const json = await res.json()
                if (!res.ok) throw new Error(json?.error || 'Failed to close')
                setCloseMsg(json?.message || 'Books closed')
                // refresh summary to show updated close date
                setLoading(true)
                const r = await fetch('/api/accounting/process/summary', { cache: 'no-store' })
                if (r.ok) setData(await r.json())
              } catch (e:any) {
                setCloseErr(String(e?.message || 'Failed to close'))
              } finally { setClosing(false); setLoading(false) }
            }}>{closing ? 'Closing…' : 'Close books'}</button>

            <div className="ml-auto" />
            <button className="btn" disabled={reopening} onClick={async ()=>{
              setReopening(true); setReopenErr(null); setReopenMsg(null)
              try {
                if (!reopenReason || reopenReason.trim().length < 3) {
                  throw new Error('Please provide a reason (min 3 characters) to reopen the period')
                }
                const proceed = typeof window !== 'undefined' ? window.confirm(`Reopen period with reason:\n\n${reopenReason}\n\nThis will allow posting to prior dates. Continue?`) : true
                if (!proceed) { setReopening(false); return }
                const res = await fetch('/api/settings/reopen-period', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: closePassword || undefined, reason: reopenReason || undefined }) })
                const json = res.ok ? await res.json() : null
                if (!res.ok) throw new Error(json?.error || 'Failed to reopen')
                setReopenMsg('Period reopened. You can now post to prior dates.')
                // refresh summary to show updated close date
                setLoading(true)
                const r = await fetch('/api/accounting/process/summary', { cache: 'no-store' })
                if (r.ok) setData(await r.json())
              } catch (e:any) {
                setReopenErr(String(e?.message || 'Failed to reopen'))
              } finally { setReopening(false); setLoading(false) }
            }}>{reopening ? 'Reopening…' : 'Reopen period'}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600">Close password (optional)</span>
              <input type="password" value={closePassword} onChange={e=>setClosePassword(e.target.value)} placeholder="••••••" className="border rounded p-2" />
            </label>
            <label className="flex flex-col md:col-span-2">
              <span className="text-sm text-slate-600">Reopen reason (for audit)</span>
              <input type="text" value={reopenReason} onChange={e=>setReopenReason(e.target.value)} placeholder="Explain why you are reopening the period" className="border rounded p-2" />
            </label>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3 text-sm text-slate-600">Manage close password (admin):</div>
            <label className="flex flex-col">
              <span className="text-sm text-slate-600">New password</span>
              <input type="password" value={newClosePassword} onChange={e=>setNewClosePassword(e.target.value)} placeholder="Set a password to require for close/reopen" className="border rounded p-2" />
            </label>
            <div className="flex items-end gap-2">
              <button className="btn btn-secondary" disabled={pwdWorking || !newClosePassword} onClick={async ()=>{
                setPwdWorking(true); setPwdErr(null); setPwdMsg(null)
                try {
                  const res = await fetch('/api/settings/close-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: newClosePassword }) })
                  const json = await res.json()
                  if (!res.ok) throw new Error(json?.error || 'Failed to set password')
                  setPwdMsg('Close password enabled')
                  setNewClosePassword('')
                } catch (e:any) { setPwdErr(String(e?.message || 'Failed')) } finally { setPwdWorking(false) }
              }}>Set password</button>
              <button className="btn" disabled={pwdWorking} onClick={async ()=>{
                setPwdWorking(true); setPwdErr(null); setPwdMsg(null)
                try {
                  const res = await fetch('/api/settings/close-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
                  const json = await res.json()
                  if (!res.ok) throw new Error(json?.error || 'Failed to clear password')
                  setPwdMsg('Close password cleared')
                } catch (e:any) { setPwdErr(String(e?.message || 'Failed')) } finally { setPwdWorking(false) }
              }}>Clear password</button>
            </div>
            <div className="md:col-span-1 flex items-end text-sm">
              {pwdMsg && <span className="text-green-700" role="status">{pwdMsg}</span>}
              {pwdErr && <span className="text-red-700" role="alert">{pwdErr}</span>}
            </div>
          </div>
          <div className="text-sm text-slate-700">Current close date: <strong>{data.settings.closeDate || 'Open'}</strong></div>
          <div className="mt-2 flex items-center gap-2">
            <button className="btn" disabled={genClosingBusy} onClick={async ()=>{
              setGenClosingBusy(true); setGenClosingErr(null); setGenClosingMsg(null)
              try {
                const confirmMsg = `Generate closing entries for ${closePeriod}? This will move current period P&L to Retained Earnings.`
                const ok = typeof window !== 'undefined' ? window.confirm(confirmMsg) : true
                if (!ok) { setGenClosingBusy(false); return }
                const res = await fetch('/api/accounting/month-end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate_closing_entries', period: closePeriod }) })
                const json = await res.json().catch(()=>null)
                if (!res.ok) throw new Error(json?.error || 'Failed to generate closing entries')
                setGenClosingMsg(json?.message || 'Closing entries generated')
                setGenClosingEntryId(json?.entryId || undefined)
              } catch (e:any) { setGenClosingErr(String(e?.message || 'Failed')) } finally { setGenClosingBusy(false) }
            }}>{genClosingBusy ? 'Generating…' : 'Generate closing entries'}</button>
            {genClosingMsg && <span className="text-green-700" role="status">{genClosingMsg}</span>}
            {genClosingEntryId && (
              <div className="flex items-center gap-3">
                <a className="text-blue-600 underline text-sm" href={`/journal/${encodeURIComponent(genClosingEntryId)}` as any}>View journal</a>
                <a className="text-blue-600 underline text-sm" href={`/api/journal/${encodeURIComponent(genClosingEntryId)}/export`} target="_blank" rel="noreferrer">Export CSV</a>
              </div>
            )}
            {genClosingErr && <span className="text-red-700" role="alert">{genClosingErr}</span>}
          </div>
          {closeMsg && <div role="status" className="text-green-700">{closeMsg}</div>}
          {closeErr && <div role="alert" className="text-red-700">{closeErr}</div>}
          {reopenMsg && <div role="status" className="text-green-700">{reopenMsg}</div>}
          {reopenErr && <div role="alert" className="text-red-700">{reopenErr}</div>}
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <h2 className="font-medium">Receivables</h2>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between"><dt>Open invoices</dt><dd>{data.ar.openInvoices}</dd></div>
            <div className="flex justify-between"><dt>Open balance</dt><dd>{formatCurrency(data.ar.openBalance)}</dd></div>
            <div className="flex justify-between"><dt>Overdue</dt><dd>{formatCurrency(data.ar.overdueBalance)}</dd></div>
            <div className="flex justify-between"><dt>Unapplied credits</dt><dd>{formatCurrency(data.ar.unappliedCredits)}</dd></div>
            <div className="flex justify-between"><dt>Next due date</dt><dd>{data.ar.nextDueDate || '—'}</dd></div>
            {typeof data.kpis?.dsoDays === 'number' && (
              <div className="flex justify-between items-center gap-2">
                <dt className="flex items-center gap-2">
                  <span>DSO</span>
                  <HelpPopover ariaLabel="DSO help" buttonAriaLabel="What is DSO?" storageKey="acct-process-dso">
                    <p className="mb-2"><strong>Days Sales Outstanding (DSO)</strong> estimates how many days receivables stay open before collection.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Approximated here as: ending A/R divided by average daily revenue for the selected period.</li>
                      <li>If revenue is zero for the period, this value is not shown.</li>
                      <li>Use it to monitor collection speed and trends.</li>
                    </ul>
                  </HelpPopover>
                </dt>
                <dd>{data.kpis!.dsoDays!.toFixed(1)} days</dd>
              </div>
            )}
          </dl>
          <nav className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <Link className="text-teal-700 underline" href={"/invoices" as any}>Invoices</Link>
            <Link className="text-teal-700 underline" href={"/sales/collections" as any}>Collections</Link>
            <Link className="text-teal-700 underline" href={"/customers" as any}>Customers</Link>
            <Link className="text-teal-700 underline" href={"/sales/customer-payments" as any}>Record payment</Link>
            <Link className="text-teal-700 underline" href={`/reports/ar-aging-detail?bucket=30&from=${encodeURIComponent('/accounting/process')}`}>Overdue detail</Link>
            <Link className="text-teal-700 underline" href={`/reports/ar-aging-detail?bucket=60&from=${encodeURIComponent('/accounting/process')}`}>60+</Link>
            <Link className="text-teal-700 underline" href={`/reports/ar-aging-detail?bucket=90&from=${encodeURIComponent('/accounting/process')}`}>90+</Link>
            <Link className="text-teal-700 underline" href={`/reports/ar-aging-detail?bucket=120&from=${encodeURIComponent('/accounting/process')}`}>120+</Link>
            <Link className="text-teal-700 underline" href={"/receivables/payments/applications/history" as any}>Payment application history</Link>
            <Link className="text-teal-700 underline" href={"/collections/reminders/history" as any}>Reminder history</Link>
            <Link className="text-teal-700 underline" href={"/sales/statements/send/history" as any}>Statement send history</Link>
          </nav>
        </div>

        <div className="glass-card p-4">
          <h2 className="font-medium">Customer receipts</h2>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between"><dt>Undeposited payments</dt><dd>{data.receipts.undeposited.count} • {formatCurrency(data.receipts.undeposited.total)}</dd></div>
            <div className="flex justify-between"><dt>Deposits (30d)</dt><dd>{data.receipts.deposits.last30.count} • {formatCurrency(data.receipts.deposits.last30.total)}</dd></div>
          </dl>
          <nav className="mt-3 flex gap-2 text-sm">
            <Link className="text-teal-700 underline" href="/transactions">Banking</Link>
            <Link className="text-teal-700 underline" href="/sales/deposits">Deposits</Link>
            <Link className="text-teal-700 underline" href={`/sales/deposits?from=${encodeURIComponent('/accounting/process')}`}>Undeposited list</Link>
          </nav>
        </div>

        <div className="glass-card p-4">
          <h2 className="font-medium">Payables</h2>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between"><dt>Open bills</dt><dd>{data.ap.openBills}</dd></div>
            <div className="flex justify-between"><dt>Open balance</dt><dd>{formatCurrency(data.ap.openBalance)}</dd></div>
            <div className="flex justify-between"><dt>Overdue</dt><dd>{formatCurrency(data.ap.overdueBalance)}</dd></div>
            <div className="flex justify-between"><dt>Vendor credits</dt><dd>{formatCurrency(data.ap.creditsAvailable)}</dd></div>
            <div className="flex justify-between"><dt>Next due date</dt><dd>{data.ap.nextDueDate || '—'}</dd></div>
            {typeof data.kpis?.dpoDays === 'number' && (
              <div className="flex justify-between items-center gap-2">
                <dt className="flex items-center gap-2">
                  <span>DPO</span>
                  <HelpPopover ariaLabel="DPO help" buttonAriaLabel="What is DPO?" storageKey="acct-process-dpo">
                    <p className="mb-2"><strong>Days Payables Outstanding (DPO)</strong> estimates how many days payables remain unpaid.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Approximated here as: ending A/P divided by average daily expenses for the selected period.</li>
                      <li>If expenses are zero for the period, this value is not shown.</li>
                      <li>Use it to understand vendor payment cadence.</li>
                    </ul>
                  </HelpPopover>
                </dt>
                <dd>{data.kpis!.dpoDays!.toFixed(1)} days</dd>
              </div>
            )}
          </dl>
          <nav className="mt-3 flex gap-2 text-sm">
            <Link className="text-teal-700 underline" href={"/bills" as any}>Bills</Link>
            <Link className="text-teal-700 underline" href={"/vendors" as any}>Vendors</Link>
            <Link className="text-teal-700 underline" href={"/purchase-orders" as any}>POs</Link>
            <Link className="text-teal-700 underline" href={`/reports/ap-aging-detail?bucket=30&from=${encodeURIComponent('/accounting/process')}`}>Overdue detail</Link>
            <Link className="text-teal-700 underline" href={`/reports/ap-aging-detail?bucket=60&from=${encodeURIComponent('/accounting/process')}`}>60+</Link>
            <Link className="text-teal-700 underline" href={`/reports/ap-aging-detail?bucket=90&from=${encodeURIComponent('/accounting/process')}`}>90+</Link>
            <Link className="text-teal-700 underline" href={`/reports/ap-aging-detail?bucket=120&from=${encodeURIComponent('/accounting/process')}`}>120+</Link>
          </nav>
        </div>
      </section>

      <section className="glass-card p-4">
        <h2 className="font-medium">General ledger</h2>
        <div className="mt-2 grid md:grid-cols-4 gap-2 text-sm">
          <div>Balanced: <span aria-live="polite">{data.gl.trialBalanceBalanced ? 'Yes' : 'No'}</span></div>
          <div>Accounts: {data.gl.accounts}</div>
          <div>Journal entries: {data.gl.journalEntries}</div>
          <div>Close date: {data.settings.closeDate || 'Open'}</div>
        </div>
        <nav className="mt-3 flex gap-2 text-sm">
          <Link className="text-teal-700 underline" href="/journal">Journal</Link>
          <Link className="text-teal-700 underline" href="/reports">Reports</Link>
          <Link className="text-teal-700 underline" href="/account-and-settings/company">Settings</Link>
          <Link className="text-teal-700 underline" href="/reports/closing-date">Closing date</Link>
          <Link className="text-teal-700 underline" href="/reports/invalid-journal-transactions">Invalid journals</Link>
        </nav>
      </section>

      <section className="glass-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">Month‑end checklist</h2>
          <div className="text-sm text-slate-600">Period: <code>{checklistPeriod || (data.period.end || '').slice(0,7)}</code></div>
        </div>
        {!checklist && (
          <p className="mt-2 text-sm text-slate-500">Loading checklist…</p>
        )}
        {Array.isArray(checklist) && (
          <div className="mt-3 space-y-2">
            {checklist.map(item => (
              <label key={item.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={!!item.done}
                  onChange={async (e)=>{
                    setChecklistBusy(true)
                    try {
                      const res = await fetch('/api/accounting/process/checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ period: checklistPeriod || (data.period.end || '').slice(0,7), id: item.id, done: e.target.checked }) })
                      const j = await res.json()
                      if (res.ok) setChecklist(j.items || [])
                    } finally { setChecklistBusy(false) }
                  }}
                />
                <span className={item.done ? 'line-through text-slate-500' : ''}>{item.label}</span>
              </label>
            ))}
            <div className="mt-3 flex items-center gap-3">
              <button className="btn btn-secondary" disabled={checklistBusy} onClick={async ()=>{
                setChecklistBusy(true)
                try {
                  const res = await fetch('/api/accounting/process/checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ period: checklistPeriod || (data.period.end || '').slice(0,7), action: 'reset' }) })
                  const j = await res.json()
                  if (res.ok) setChecklist(j.items || [])
                } finally { setChecklistBusy(false) }
              }}>Reset checklist</button>
              <div className="text-xs text-slate-500">Use this list to track month‑end tasks like reconciliation, AR/AP review, adjustments, and closing.</div>
            </div>
          </div>
        )}
      </section>

      <section className="glass-card p-4 space-y-3">
        <h2 className="font-medium">Adjusting journal (quick)</h2>
        <p className="text-sm text-slate-600">Create a single-line reclass or period-end adjustment. For multi-line entries, use the Journal page.</p>
        <ClosedThroughBanner date={adjDate} onSuggestNextOpenDate={setAdjDate} />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Date</span>
            <input type="text" inputMode="numeric" pattern="\\d{4}-\\d{2}-\\d{2}" placeholder="YYYY-MM-DD" value={adjDate} onChange={e=>setAdjDate(e.target.value)} className="border rounded p-2" />
          </label>
          <label className="flex flex-col md:col-span-2">
            <span className="text-sm text-slate-600">From account</span>
            <select className="border rounded p-2" value={adjFrom} onChange={e=>setAdjFrom(e.target.value)}>
              <option value="">Select account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.number}>{a.number} — {a.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col md:col-span-2">
            <span className="text-sm text-slate-600">To account</span>
            <select className="border rounded p-2" value={adjTo} onChange={e=>setAdjTo(e.target.value)}>
              <option value="">Select account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.number}>{a.number} — {a.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-slate-600">Amount</span>
            <input type="number" step="0.01" value={adjAmount} onChange={e=>setAdjAmount(e.target.value)} placeholder="0.00" className="border rounded p-2" />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <label className="flex flex-col md:col-span-4">
            <span className="text-sm text-slate-600">Memo (optional)</span>
            <input type="text" value={adjMemo} onChange={e=>setAdjMemo(e.target.value)} placeholder="Describe the adjustment" className="border rounded p-2" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={adjReversing} onChange={e=>setAdjReversing(e.target.checked)} />
            <span className="text-sm text-slate-700">Create reversing entry next month</span>
          </label>
          <div className="flex items-end">
            <button className="btn btn-primary" disabled={adjBusy} onClick={async ()=>{
              setAdjBusy(true); setAdjMsg(null); setAdjErr(null)
              try {
                const amount = Number(adjAmount)
                if (!adjDate || !/\d{4}-\d{2}-\d{2}/.test(adjDate)) throw new Error('Enter a valid date YYYY-MM-DD')
                if (!adjFrom || !adjTo || adjFrom === adjTo) throw new Error('Select different From and To accounts')
                if (!(amount > 0)) throw new Error('Enter a positive amount')
                const lines = [
                  { accountNumber: adjTo, debit: amount, memo: adjMemo || undefined },
                  { accountNumber: adjFrom, credit: amount, memo: adjMemo || undefined },
                ]
                const res = await fetch('/api/journal/adjusting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: adjDate, lines, reversing: adjReversing }) })
                const json = await res.json().catch(()=>null)
                if (!res.ok) throw new Error(json?.error || 'Failed to post adjusting journal')
                setAdjMsg(`Adjusting entry posted${json?.reversingId ? ' with reversing entry' : ''}.`)
                setAdjMemo(''); setAdjAmount('');
              } catch (e:any) {
                setAdjErr(String(e?.message || 'Failed'))
              } finally { setAdjBusy(false) }
            }}>{adjBusy ? 'Posting…' : 'Post adjustment'}</button>
          </div>
        </div>
        {adjMsg && <div className="text-green-700" role="status">{adjMsg}</div>}
        {adjErr && <div className="text-red-700" role="alert">{adjErr}</div>}
      </section>
    </main>
  )
}
