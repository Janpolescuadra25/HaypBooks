"use client"
import { useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePaymentsState } from '@/hooks/usePaymentsState'
import DevWebhookListener from '@/components/DevWebhookListener'
import Toaster from '@/components/Toaster'
import CoaSelect from '@/components/CoaSelect'

interface MappingForm {
  standardDeposit: string
  instantDeposit: string
  processingFees: string
}
const DEFAULT_MAPPING: MappingForm = { standardDeposit: 'Checking', instantDeposit: 'Checking', processingFees: 'Payments Fees' }

export default function ManagePaymentsAccountPage() {
  const router = useRouter()
  const { state, save } = usePaymentsState()
  const mapping = state.mapping || DEFAULT_MAPPING
  const methods = state.methods
  const application = state.application
  const selectedStatement = state.selectedStatement || ''
  const depositSpeedCC = '1 business day'
  const depositSpeedACH = '1–5 business days'
  const mappingRef = useRef<HTMLDivElement | null>(null)

  function saveAll() {
    save({ methods, mapping, selectedStatement })
    try { (window as any).toast?.('Changes saved') } catch {}
  }

  function parseYearMonth(ym: string) {
    const [y, m] = ym.split('-').map((x)=>parseInt(x,10))
    if (!y || !m) return null
    const start = new Date(y, m-1, 1)
    const end = new Date(y, m, 1)
    return { start: start.getTime(), end: end.getTime() }
  }

  function downloadCSV(filename: string, rows: string[][]) {
    const escape = (s: string) => {
      const needsQuotes = /[",\n]/.test(s)
      const escaped = s.replace(/"/g, '""')
      return needsQuotes ? `"${escaped}"` : escaped
    }
    const csv = rows.map(r => r.map(c => escape(c ?? '')).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function onDownloadStatement() {
    if (!selectedStatement) return
    const range = parseYearMonth(selectedStatement)
    if (!range) return
    let payments: Array<{invoiceId:string; amount:number; method:string; ts:number}> = []
    try {
      const raw = localStorage.getItem('hb.mockPayments')
      payments = raw ? JSON.parse(raw) : []
    } catch {}
    const monthItems = payments.filter(p => p.ts >= range.start && p.ts < range.end)
    const fmt = (n: number) => {
      try {
        // Prefer centralized currency formatting utility if available
        const { formatCurrency } = require('@/lib/format')
        return formatCurrency(n)
      } catch {
        return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
    }
    const rows: string[][] = [[
      'Date', 'Invoice', 'Method', 'Amount'
    ]]
    let total = 0
    monthItems.sort((a,b)=>a.ts-b.ts).forEach(p => {
      total += p.amount
      rows.push([
        new Date(p.ts).toISOString().slice(0,10),
        String(p.invoiceId ?? ''),
        String(p.method ?? ''),
        fmt(p.amount)
      ])
    })
    rows.push(['', '', 'Total', fmt(total)])
    downloadCSV(`statement-${selectedStatement}.csv`, rows)
    try { (window as any).toast?.(`Statement ${selectedStatement} downloaded`) } catch {}
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <DevWebhookListener />
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Manage Payments account</h1>
        <button onClick={()=>router.back()} className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50">Back</button>
      </div>

      {/* Overview table inspired by common payments management UIs */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-200 text-sm">
          <OverviewRow label="Deposit Speed">
            <div className="space-y-1">
              <div className="font-medium text-slate-700">Standard speeds</div>
              <div>Credit Cards <span className="text-slate-500">{depositSpeedCC}</span></div>
              <div>Bank Transfers <span className="text-slate-500">{depositSpeedACH}</span></div>
              <div><a href="#" onClick={(e)=>e.preventDefault()} className="text-emerald-700 hover:underline">Get same-day deposit speed set up <NewBadge>NEW</NewBadge></a></div>
            </div>
          </OverviewRow>
          <OverviewRow label="Payment methods">
            <div className="flex flex-wrap gap-2">
              {Object.entries(methods).filter(([,v])=>!!v).map(([k])=> (
                <span key={k} className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-medium capitalize">{k.replace(/([A-Z])/g,' $1').trim()}</span>
              ))}
              {Object.values(methods).every(v=>!v) && (
                <span className="text-slate-500">None enabled</span>
              )}
            </div>
          </OverviewRow>
          <OverviewRow label="Deposit accounts">Standard deposits</OverviewRow>
          <OverviewRow label="Business Owner info">
            <div className="space-y-2">
              <OwnerAddress application={application} />
              <div className="text-slate-700">{application?.owner?.phone || '(650) 555-1234'}</div>
            </div>
          </OverviewRow>
          <OverviewRow label="Documents">
            <div className="flex items-center gap-3">
              <select className="input w-44" aria-label="Select statement month" value={selectedStatement} onChange={(e)=>save({ selectedStatement: e.target.value })}>
                <option value="">Select a month</option>
                {useMemo(()=>{
                  const now = new Date()
                  return Array.from({length:12}).map((_,i)=>{
                    const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
                    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
                  })
                },[]).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <button className="text-xs font-medium text-emerald-700 hover:underline" onClick={(e)=>{e.preventDefault(); if(!selectedStatement) return; alert(`Viewing statement ${selectedStatement}`)}}>View</button>
              <button
                className={`text-xs font-medium ${selectedStatement ? 'text-emerald-700 hover:underline' : 'text-slate-400 cursor-not-allowed'}`}
                onClick={(e)=>{ e.preventDefault(); onDownloadStatement() }}
                disabled={!selectedStatement}
              >
                Download CSV
              </button>
            </div>
          </OverviewRow>
          <OverviewRow label="Chart of Accounts">
            <div className="space-y-1">
              <div>Tell us where to automatically record:</div>
              <div className="grid grid-cols-[160px_1fr] gap-x-4 text-slate-700">
                <span className="text-slate-500">Standard deposits</span><span>{mapping.standardDeposit}</span>
                <span className="text-slate-500">Instant deposits</span><span>{mapping.instantDeposit}</span>
                <span className="text-slate-500">Processing fees</span><span>{mapping.processingFees}</span>
              </div>
              <div>
                <button className="text-xs text-emerald-700 hover:underline" onClick={()=>mappingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Edit</button>
              </div>
            </div>
          </OverviewRow>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Methods */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Payment methods</h2>
          <p className="mt-1 text-xs text-slate-500">Shown on invoices and payment links.</p>
          <div className="mt-3 space-y-2 text-sm">
            {([
              ['Cards','cards'],
              ['ACH','ach'],
              ['Apple Pay','applePay'],
              ['PayPal','paypal'],
              ['Venmo','venmo'],
            ] as const).map(([label,key]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={(methods as any)[key]} onChange={e=>save({ methods: { ...methods, [key]: e.target.checked } })} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div ref={mappingRef} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Chart of Accounts mapping</h2>
        <div className="mt-4 grid gap-3 text-sm max-w-md">
          <CoaSelect label="Standard deposits" value={mapping.standardDeposit} onChange={v=>save({ mapping: { ...mapping, standardDeposit: v } })} />
          <CoaSelect label="Instant deposits" value={mapping.instantDeposit} onChange={v=>save({ mapping: { ...mapping, instantDeposit: v } })} />
          <CoaSelect label="Processing fees" value={mapping.processingFees} onChange={v=>save({ mapping: { ...mapping, processingFees: v } })} />
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={saveAll} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700">Save changes</button>
      </div>
    </div>
  )
}

function MappingInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string)=>void }) {
  return (
    <label className="block text-xs font-medium text-slate-700">
      <span>{label}</span>
      <input value={value} onChange={e=>onChange(e.target.value)} className="input mt-1 text-sm" placeholder="Search or select account" />
    </label>
  )
}

function OverviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-6 px-6 py-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 pt-0.5">{label}</div>
      <div className="text-sm text-slate-800 space-y-1">{children}</div>
    </div>
  )
}

function NewBadge({ children }: { children: React.ReactNode }) {
  return <span className="ml-1 inline-block rounded bg-fuchsia-700 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white align-middle">{children}</span>
}

function OwnerAddress({ application }: { application: any }) {
  const addr = application?.owner?.address || application?.business?.address
  if (!addr) return <div className="text-slate-500">Owner’s address</div>
  const parts = [addr.line1, addr.line2, (addr.city && addr.state) ? `${addr.city}, ${addr.state} ${addr.postal}` : (addr.city || addr.state), addr.country].filter(Boolean)
  return <div className="text-slate-700">{parts.map((p: string, i: number) => <div key={i}>{p}</div>)}</div>
}