"use client"

import { useEffect, useState } from 'react'
import BusinessStepComponent from '@/components/Onboarding/BusinessStep'
import apiClient from '@/lib/api-client'
import { useRouter } from 'next/navigation'

type BusinessDetails = {
  companyName?: string
  businessType?: string
  industry?: string
  address?: string
  phone?: string
  businessEmail?: string
}

type OnboardingSnapshot = {
  business?: BusinessDetails
  sells?: { sellsProducts?: boolean; inventory?: boolean }
  fiscal?: { fiscalStart?: string; accountingMethod?: string; currency?: string }
  tax?: { taxType?: string; taxRate?: number; inclusive?: boolean }
  branding?: { logo?: string; invoicePrefix?: string; paymentTerms?: string }
  banking?: { acceptsBank?: boolean; acceptsCash?: boolean; accounts?: any[] }
  openingBalances?: { cash?: number; bank?: number; ar?: number; ap?: number; equity?: number }
}

const STEPS = [
  'Business',
  'Products/services',
  'Fiscal & Accounting',
  'Tax',
  'Branding',
  'Banking',
  'Opening balances',
  'Review',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot>({})

  useEffect(() => {
    // load any saved progress
    async function load() {
      try {
        if (USE_MOCK) {
          const res = await fetch('/api/onboarding/save')
          const json = await res.json()
          setSnapshot(json || {})
        } else {
          const res = await apiClient.get('/api/onboarding/save')
          // backend returns { steps }
          setSnapshot(res.data?.steps || {})
        }
      } catch (err) {
        // ignore
      }
    }
    load()
  }, [])

  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
  const API_BASE = USE_MOCK ? '' : (process.env.NEXT_PUBLIC_API_BASE || '')

  async function saveStep(stepKey: string, data: any) {
    setLoading(true)
    try {
      if (USE_MOCK) {
        const res = await fetch('/api/onboarding/save', { method: 'POST', body: JSON.stringify({ step: stepKey, data }), headers: { 'Content-Type': 'application/json' } })
        if (!res.ok) throw new Error('save failed')
        const json = await res.json()
      } else {
        const res = await apiClient.post('/api/onboarding/save', { step: stepKey, data })
        if (!(res.status >= 200 && res.status < 300)) throw new Error('save failed')
      }
      // merge local snapshot
      setSnapshot((s) => ({ ...(s as any), [stepKey]: data }))
    } catch (err) {
      console.error(err)
      alert('Failed to save progress')
    } finally {
      setLoading(false)
    }
  }

  async function completeOnboarding() {
    setLoading(true)
    try {
      if (USE_MOCK) {
        const res = await fetch('/api/onboarding/complete', { method: 'POST', body: JSON.stringify({ type: 'full' }), headers: { 'Content-Type': 'application/json' } })
        if (!res.ok) throw new Error('complete failed')
      } else {
        const res = await apiClient.post('/api/onboarding/complete', { type: 'full' })
        if (!(res.status >= 200 && res.status < 300)) throw new Error('complete failed')
      }
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      // If the backend call failed (could be 401 due to cookie SameSite in cross-origin dev),
      // set client-side cookies so the UI won't be blocked and let the user continue.
      try {
        document.cookie = 'onboardingComplete=true; path=/'
        document.cookie = 'onboardingMode=full; path=/'
      } catch (cErr) {
        // ignore
      }
      alert('Failed to persist onboarding server-side — marking complete locally and continuing')
      // ensure user proceeds into the app even if server persistence failed
      try { router.push('/') } catch (rErr) { /* ignore */ }
    } finally {
      setLoading(false)
    }
  }

  async function skipOnboarding() {
    if (!confirm('Skip onboarding and go to Dashboard?')) return
    setLoading(true)
    try {
      if (USE_MOCK) {
        const res = await fetch('/api/onboarding/complete', { method: 'POST', body: JSON.stringify({ type: 'quick' }), headers: { 'Content-Type': 'application/json' } })
        if (!res.ok) throw new Error('complete failed')
      } else {
        const res = await apiClient.post('/api/onboarding/complete', { type: 'quick' })
        if (!(res.status >= 200 && res.status < 300)) throw new Error('complete failed')
      }
      // After marking onboarding complete (quick), navigate to home/dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      // Mark onboarding complete locally as a fallback so the UI renders (top bar/sidebar)
      try {
        document.cookie = 'onboardingComplete=true; path=/'
        document.cookie = 'onboardingMode=quick; path=/'
      } catch (cErr) {
        // ignore
      }
      alert('Failed to persist onboarding server-side — marking complete locally and continuing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-1">Onboarding</h1>
        <p className="text-sm text-slate-600 mb-2">{STEPS[step]}</p>
        <p className="text-sm text-slate-600 mb-6">Complete these short steps to configure your company for demo and testing purposes.</p>

        <div className="mb-6 flex gap-2 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s} className={`px-3 py-1 rounded ${i === step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{s}</div>
          ))}
        </div>

        {/* Body */}
        <div className="mb-6">
          {step === 0 && (
            <BusinessStepComponent initial={snapshot.business} onSave={(d) => saveStep('business', d)} />
          )}
          {step === 1 && (
            <ProductsStep data={snapshot.sells} onSave={(d) => saveStep('sells', d)} />
          )}
          {step === 2 && (
            <FiscalStep data={snapshot.fiscal} onSave={(d) => saveStep('fiscal', d)} />
          )}
          {step === 3 && (
            <TaxStep data={snapshot.tax} onSave={(d) => saveStep('tax', d)} />
          )}
          {step === 4 && (
            <BrandingStep data={snapshot.branding} onSave={(d) => saveStep('branding', d)} />
          )}
          {step === 5 && (
            <BankingStep data={snapshot.banking} onSave={(d) => saveStep('banking', d)} />
          )}
          {step === 6 && (
            <OpeningBalancesStep data={snapshot.openingBalances} onSave={(d) => saveStep('openingBalances', d)} />
          )}
          {step === 7 && (
            <ReviewStep snapshot={snapshot} onEdit={(idx) => setStep(idx)} />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded border" disabled={step===0} onClick={() => setStep((s) => Math.max(0, s-1))}>Back</button>
            {step < STEPS.length-1 && (
              <button className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setStep((s) => Math.min(STEPS.length-1, s+1))}>Next</button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="px-3 py-2 rounded border text-sm" onClick={skipOnboarding}>Skip for now</button>
            {step === STEPS.length - 1 ? (
              <button className="px-4 py-2 rounded bg-emerald-600 text-white" disabled={loading} onClick={completeOnboarding}>{loading ? 'Completing…' : 'Finish onboarding'}</button>
            ) : (
              <button className="px-4 py-2 rounded bg-indigo-600 text-white" disabled={loading} onClick={() => { setStep((s) => Math.min(STEPS.length-1, s+1)) }}>Save & Continue</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Business step extracted to components/Onboarding/BusinessStep.tsx

function ProductsStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [state, setState] = useState({ sellsProducts: false, inventory: false, sellsServices: true, both: false })
  useEffect(()=>{ if (data) setState({ ...state, ...data }) }, [])
  return (
    <div>
      <div className="flex gap-3 items-center mb-3">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={state.sellsServices} onChange={(e)=>setState({...state, sellsServices: e.target.checked})} /> Services</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={state.sellsProducts} onChange={(e)=>setState({...state, sellsProducts: e.target.checked})} /> Products</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={state.inventory} onChange={(e)=>setState({...state, inventory: e.target.checked})} /> Uses inventory</label>
      </div>
      <div className="flex justify-end"><button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={()=>onSave(state)}>Save step</button></div>
    </div>
  )
}

function FiscalStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ fiscalStart: 'Jan', accountingMethod: 'accrual', currency: 'USD' })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select aria-label="Fiscal year start" value={form.fiscalStart} onChange={(e)=>setForm({...form, fiscalStart: e.target.value})} className="p-2 border rounded">
          <option>Jan</option>
          <option>Apr</option>
          <option>Jul</option>
          <option>Oct</option>
        </select>
        <select aria-label="Accounting method" value={form.accountingMethod} onChange={(e)=>setForm({...form, accountingMethod: e.target.value})} className="p-2 border rounded">
          <option value="accrual">Accrual</option>
          <option value="cash">Cash</option>
        </select>
        <select aria-label="Default currency" value={form.currency} onChange={(e)=>setForm({...form, currency: e.target.value})} className="p-2 border rounded">
          <option>USD</option>
          <option>PHP</option>
          <option>EUR</option>
        </select>
      </div>
      <div className="flex justify-end"><button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={()=>onSave(form)}>Save step</button></div>
    </div>
  )
}

function TaxStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ taxType: 'VAT', taxRate: 12, inclusive: false })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select aria-label="Tax type" value={form.taxType} onChange={(e)=>setForm({...form, taxType: e.target.value})} className="p-2 border rounded">
          <option>VAT</option>
          <option>GST</option>
          <option>No tax</option>
        </select>
        <input value={String(form.taxRate)} onChange={(e)=>setForm({...form, taxRate: Number(e.target.value)})} className="p-2 border rounded" placeholder="Default tax rate" />
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.inclusive} onChange={(e)=>setForm({...form, inclusive: e.target.checked})} /> Inclusive</label>
      </div>
      <div className="flex justify-end"><button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={()=>onSave(form)}>Save step</button></div>
    </div>
  )
}

function BrandingStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ logo: '', invoicePrefix: 'HYP-', paymentTerms: 'Net 30' })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input value={form.logo} onChange={(e)=>setForm({...form, logo: e.target.value})} placeholder="Logo URL (dev only)" className="p-2 border rounded" />
        <input value={form.invoicePrefix} onChange={(e)=>setForm({...form, invoicePrefix: e.target.value})} placeholder="Invoice prefix" className="p-2 border rounded" />
        <input value={form.paymentTerms} onChange={(e)=>setForm({...form, paymentTerms: e.target.value})} placeholder="Default payment terms" className="p-2 border rounded" />
      </div>
      <div className="flex justify-end"><button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={()=>onSave(form)}>Save step</button></div>
    </div>
  )
}

function BankingStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ acceptsBank: true, acceptsCash: true, accounts: [] as any[] })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div>
      <div className="flex gap-4 items-center mb-4">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.acceptsBank} onChange={(e)=>setForm({...form, acceptsBank: e.target.checked})} /> Accept bank payments</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.acceptsCash} onChange={(e)=>setForm({...form, acceptsCash: e.target.checked})} /> Accept cash</label>
      </div>
      <div className="flex justify-end"><button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={()=>onSave(form)}>Save step</button></div>
    </div>
  )
}

function OpeningBalancesStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ cash: 0, bank: 0, ar: 0, ap: 0, equity: 0 })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div>
      <div className="grid md:grid-cols-5 gap-3 mb-4">
        <input value={String(form.cash)} onChange={(e)=>setForm({...form, cash: Number(e.target.value)})} className="p-2 border rounded" placeholder="Starting cash" />
        <input value={String(form.bank)} onChange={(e)=>setForm({...form, bank: Number(e.target.value)})} className="p-2 border rounded" placeholder="Starting bank" />
        <input value={String(form.ar)} onChange={(e)=>setForm({...form, ar: Number(e.target.value)})} className="p-2 border rounded" placeholder="Accounts receivable" />
        <input value={String(form.ap)} onChange={(e)=>setForm({...form, ap: Number(e.target.value)})} className="p-2 border rounded" placeholder="Accounts payable" />
        <input value={String(form.equity)} onChange={(e)=>setForm({...form, equity: Number(e.target.value)})} className="p-2 border rounded" placeholder="Owner's equity" />
      </div>
      <div className="flex justify-end"><button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={()=>onSave(form)}>Save step</button></div>
    </div>
  )
}

function ReviewStep({ snapshot, onEdit }: { snapshot: any, onEdit: (idx:number) => void }) {
  return (
    <div>
      <h2 className="font-semibold mb-2">Review your settings</h2>
      <pre className="bg-slate-100 p-4 rounded max-h-56 overflow-auto mb-4 text-xs">{JSON.stringify(snapshot, null, 2)}</pre>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded border" onClick={() => onEdit(0)}>Edit Business</button>
        <button className="px-3 py-2 rounded border" onClick={() => onEdit(1)}>Edit Products</button>
        <button className="px-3 py-2 rounded border" onClick={() => onEdit(7)}>Final step</button>
      </div>
    </div>
  )
}
