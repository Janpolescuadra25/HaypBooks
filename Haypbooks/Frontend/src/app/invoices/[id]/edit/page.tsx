"use client"
import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toHref from '@/lib/route'
import { BackButton } from '@/components/BackButton'
import BackBar from '@/components/BackBar'

type Invoice = {
  id: string
  number: string
  customer: string
  date: string
  status: 'draft'|'sent'|'paid'
  items: Array<{ description: string; amount: number; qty?: number; rate?: number; taxable?: boolean; item?: string; sku?: string; lineDate?: string; class?: string }>
  total: number
}

type InvoiceSettings = {
  sales: boolean
  discount: boolean
  deposit: boolean
  customNumbers: boolean
  tags: boolean
  optCols: { date: boolean; productService: boolean; sku: boolean }
  customFieldNames: string[]
}
const defaultSettings: InvoiceSettings = {
  sales: true,
  discount: true,
  deposit: false,
  customNumbers: true,
  tags: true,
  optCols: { date: false, productService: true, sku: false },
  customFieldNames: []
}

export default function EditInvoicePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id
  const [inv, setInv] = useState<Invoice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([])
  const [settings, setSettings] = useState<InvoiceSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState<'invoice'|'settings'>('invoice')
  const [deposit, setDeposit] = useState<number>(0)
  const [discountPct, setDiscountPct] = useState<number>(0)
  const [taxPct, setTaxPct] = useState<number>(0)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch(`/api/invoices/${id}`, { cache: 'no-store' })
        const data = await res.json()
        if (alive) setInv(data.invoice)
      } catch (e: any) {
        if (alive) setError(e.message)
      }
    }
    async function loadCustomers() {
      try {
        const r = await fetch('/api/customers', { cache: 'no-store' })
        if (r.ok) {
          const d = await r.json()
          setCustomers(d.customers || [])
        }
      } catch {}
    }
    load();
    loadCustomers();
    return () => { alive = false }
  }, [id])

  // Load settings from localStorage for consistency with new page
  useEffect(() => {
    try {
      const raw = localStorage.getItem('invoiceSettings')
      if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) })
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('invoiceSettings', JSON.stringify(settings)) } catch {}
  }, [settings])

  // Derived totals using qty * rate if present
  const computedLines = useMemo(() => (inv?.items||[]).map(l => {
    const amount = l.amount !== undefined ? l.amount : (l.qty||0) * (l.rate||0)
    return { ...l, amount }
  }), [inv])
  const subtotal = useMemo(()=> computedLines.reduce((s,l)=> s + (l.amount||0),0), [computedLines])
  const taxableSubtotal = useMemo(()=> computedLines.filter(l=> l.taxable).reduce((s,l)=> s + (l.amount||0),0), [computedLines])
  const discountAmt = useMemo(()=> Number((subtotal * (discountPct/100)).toFixed(2)), [subtotal, discountPct])
  const afterDiscount = useMemo(()=> subtotal - discountAmt, [subtotal, discountAmt])
  const taxAmt = useMemo(()=> Number((taxableSubtotal * (taxPct/100)).toFixed(2)), [taxableSubtotal, taxPct])
  const total = useMemo(()=> Number((afterDiscount + taxAmt).toFixed(2)), [afterDiscount, taxAmt])
  const balanceDue = useMemo(()=> Math.max(0, Number((total - deposit).toFixed(2))), [total, deposit])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inv) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify({ number: inv.number, customer: inv.customer, date: inv.date, items: inv.items, status: inv.status }) })
      if (!res.ok) throw new Error('Failed to update invoice')
      router.push(toHref(`/invoices/${id}`))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!inv) return <div className="glass-card">Loading…</div>

  return (
    <div className="glass-card max-w-4xl">
      <BackBar href={toHref(`/invoices/${id}`)} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-900">{activeTab === 'settings' ? 'Invoice Settings' : 'Edit Invoice'}</h1>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Settings" title="Settings" className="rounded-full p-2 hover:bg-slate-100 border border-slate-200" onClick={()=> setActiveTab('settings')}>
            <span aria-hidden>⚙️</span>
          </button>
        </div>
      </div>
  {activeTab==='invoice' ? (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="inv-number" className="block text-sm font-medium text-slate-700">Invoice #</label>
            <input id="inv-number" placeholder="Invoice number" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={inv.number} readOnly={!settings.customNumbers} onChange={(e) => setInv({ ...inv!, number: e.target.value })} />
          </div>
          <div>
            <label htmlFor="inv-date" className="block text-sm font-medium text-slate-700">Date</label>
            <input id="inv-date" type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={inv.date.slice(0,10)} onChange={(e) => setInv({ ...inv!, date: e.target.value })} />
          </div>
        </div>
        <div>
          <label htmlFor="inv-customer" className="block text-sm font-medium text-slate-700">Customer</label>
          {customers.length > 0 ? (
            <select id="inv-customer" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={inv.customer}
              onChange={(e) => setInv({ ...inv!, customer: e.target.value })}
            >
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <input id="inv-customer" placeholder="Customer name" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={inv.customer} onChange={(e) => setInv({ ...inv!, customer: e.target.value })} />
          )}
        </div>
        {settings.sales && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Items</span>
            <button type="button" className="btn-secondary" onClick={() => setInv({ ...inv!, items: [...inv.items, { description: '', amount: 0 }] })}>+ Add item</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr>
                  {settings.optCols.productService && <th className="px-3 py-2 text-left">Product/Service</th>}
                  {settings.optCols.sku && <th className="px-3 py-2 text-left">SKU</th>}
                  {settings.optCols.date && <th className="px-3 py-2 text-left">Date</th>}
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-center">Taxable</th>
                  <th className="px-3 py-2 text-left">Class</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {inv.items.map((it, i) => (
                  <tr className="border-t border-slate-200" key={i}>
                    {settings.optCols.productService && (
                      <td className="px-3 py-2"><input placeholder="Item" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={it.item||''} onChange={(e)=> setInv({ ...inv!, items: inv.items.map((x, idx)=> idx===i? { ...x, item: e.target.value }: x) })} /></td>
                    )}
                    {settings.optCols.sku && (
                      <td className="px-3 py-2"><input placeholder="SKU" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={it.sku||''} onChange={(e)=> setInv({ ...inv!, items: inv.items.map((x, idx)=> idx===i? { ...x, sku: e.target.value }: x) })} /></td>
                    )}
                    {settings.optCols.date && (
                      <td className="px-3 py-2"><input type="date" aria-label={`Line date ${i+1}`} title="Line date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={it.lineDate?it.lineDate.slice(0,10):''} onChange={(e)=> setInv({ ...inv!, items: inv.items.map((x, idx)=> idx===i? { ...x, lineDate: e.target.value }: x) })} /></td>
                    )}
                    <td className="px-3 py-2"><input aria-label={`Description ${i+1}`} placeholder="Description" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={it.description} onChange={(e) => setInv({ ...inv!, items: inv.items.map((x, idx) => idx===i ? { ...x, description: e.target.value } : x) })} /></td>
                    <td className="px-3 py-2 text-right"><input aria-label={`Qty ${i+1}`} type="number" step="0.01" min={0} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right" value={it.qty||0} onChange={(e)=> setInv({ ...inv!, items: inv.items.map((x, idx)=> idx===i? { ...x, qty: Number(e.target.value) }: x) })} /></td>
                    <td className="px-3 py-2 text-right"><input aria-label={`Rate ${i+1}`} type="number" step="0.01" min={0} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right" value={it.rate||0} onChange={(e)=> setInv({ ...inv!, items: inv.items.map((x, idx)=> idx===i? { ...x, rate: Number(e.target.value) }: x) })} /></td>
                    <td className="px-3 py-2 text-right"><input aria-label={`Amount ${i+1}`} type="number" step="0.01" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right" value={it.amount} onChange={(e) => setInv({ ...inv!, items: inv.items.map((x, idx) => idx===i ? { ...x, amount: Number(e.target.value) } : x) })} /></td>
                    <td className="px-3 py-2 text-center"><input type="checkbox" aria-label={`Taxable ${i+1}`} title="Taxable" checked={!!it.taxable} onChange={(e)=> setInv({ ...inv!, items: inv.items.map((x, idx)=> idx===i? { ...x, taxable: e.target.checked }: x) })} /></td>
                    <td className="px-3 py-2"><input placeholder="Class" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={it.class||''} onChange={(e)=> setInv({ ...inv!, items: inv.items.map((x, idx)=> idx===i? { ...x, class: e.target.value }: x) })} /></td>
                    <td className="px-3 py-2 text-right"><button type="button" className="btn-secondary" onClick={() => setInv({ ...inv!, items: inv.items.filter((_, idx) => idx !== i) })} disabled={inv.items.length<=1}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Summary (mirrors new page subset) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
          {settings.discount && <div className="flex justify-between"><label className="flex items-center gap-2">Discount %<input type="number" min={0} max={100} step={0.01} className="w-20 rounded border border-slate-300 px-2 py-1 text-right" value={discountPct} onChange={(e)=> setDiscountPct(Number(e.target.value))} /></label><span>-{discountAmt.toFixed(2)}</span></div>}
          <div className="flex justify-between"><span>Taxable Subtotal</span><span>{taxableSubtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><label className="flex items-center gap-2">Sales Tax %<input type="number" min={0} max={100} step={0.01} className="w-20 rounded border border-slate-300 px-2 py-1 text-right" value={taxPct} onChange={(e)=> setTaxPct(Number(e.target.value))} /></label><span>+{taxAmt.toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold text-slate-900"><span>Total</span><span>{total.toFixed(2)}</span></div>
          {settings.deposit && <div className="flex justify-between"><label className="flex items-center gap-2">Deposit<input type="number" min={0} step={0.01} className="w-28 rounded border border-slate-300 px-2 py-1 text-right" value={deposit} onChange={(e)=> setDeposit(Number(e.target.value))} /></label><span>-{deposit.toFixed(2)}</span></div>}
          {settings.deposit && <div className="flex justify-between font-semibold text-slate-900"><span>Balance due</span><span>{balanceDue.toFixed(2)}</span></div>}
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2 flex-wrap items-center">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            <BackButton ariaLabel="Back to Invoice" fallback={`/invoices/${id}`} disabled={saving}>Cancel</BackButton>
        </div>
      </form>
      ) : (
        <div>
          <div className="mb-3">
            <button type="button" className="btn-secondary" onClick={()=> setActiveTab('invoice')}>Back</button>
          </div>
          <SettingsInline settings={settings} onChange={setSettings} />
        </div>
      )}
    </div>
  )
}

function SettingsInline({ settings, onChange }: { settings: InvoiceSettings; onChange: (s: InvoiceSettings) => void }) {
  function toggle<K extends keyof InvoiceSettings>(key: K) {
    if (key === 'optCols' || key === 'customFieldNames') return
    onChange({ ...settings, [key]: !(settings as any)[key] })
  }
  function toggleCol(col: 'date'|'productService'|'sku') {
    onChange({ ...settings, optCols: { ...settings.optCols, [col]: !settings.optCols[col] } })
  }
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-medium text-slate-800 mb-2">Fields</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.sales} onChange={()=> toggle('sales')} /> Sales</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.discount} onChange={()=> toggle('discount')} /> Discount</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.deposit} onChange={()=> toggle('deposit')} /> Deposit</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.customNumbers} onChange={()=> toggle('customNumbers')} /> Custom numbers</label>
        </div>
      </section>
      <section>
        <h3 className="font-medium text-slate-800 mb-2">Optional Columns</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.optCols.date} onChange={()=> toggleCol('date')} /> Date</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.optCols.productService} onChange={()=> toggleCol('productService')} /> Product/Service</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.optCols.sku} onChange={()=> toggleCol('sku')} /> SKU</label>
        </div>
      </section>
    </div>
  )
}
