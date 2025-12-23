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
        const res = await apiClient.post('/api/onboarding/complete', { type: 'full', hub: 'OWNER' })
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
        const res = await apiClient.post('/api/onboarding/complete', { type: 'quick', hub: 'OWNER' })
        if (!(res.status >= 200 && res.status < 300)) throw new Error('complete failed')
      }
      // After marking onboarding complete (quick), navigate to Central Hub
      router.push('/hub/companies')
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
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-4xl w-full mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10 animate-slide-up">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Company Setup</h1>
              <p className="text-sm text-slate-600 mt-1">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <div 
              key={s} 
              className={`px-2 py-1 rounded-xl text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                i === step 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105' 
                  : i < step
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {i < step && (
                <svg className="w-2.5 h-2.5 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {s}
            </div>
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

        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="flex gap-3">
            <button 
              className="px-6 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={step===0} 
              onClick={() => setStep((s) => Math.max(0, s-1))}
            >
              <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            {step < STEPS.length-1 && (
              <button 
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" 
                onClick={() => setStep((s) => Math.min(STEPS.length-1, s+1))}
              >
                Next
                <svg className="w-4 h-4 inline ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-600 font-medium hover:bg-slate-50 transition-all" 
              onClick={skipOnboarding}
            >
              Skip for now
            </button>
            {step === STEPS.length - 1 ? (
              <button 
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]" 
                disabled={loading} 
                onClick={completeOnboarding}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Completing…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Finish onboarding
                  </span>
                )}
              </button>
            ) : (
              <button 
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98]" 
                disabled={loading} 
                onClick={() => { setStep((s) => Math.min(STEPS.length-1, s+1)) }}
              >
                {loading ? 'Saving…' : 'Save & Continue'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(-5deg); }
          66% { transform: translate(20px, -20px) rotate(5deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  )
}

// Business step extracted to components/Onboarding/BusinessStep.tsx

function ProductsStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [state, setState] = useState({ sellsProducts: false, inventory: false, sellsServices: true, both: false })
  useEffect(()=>{ if (data) setState({ ...state, ...data }) }, [])
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">What does your business sell?</h3>
      <div className="flex flex-wrap gap-4 mb-6">
        <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-300 hover:border-emerald-500 cursor-pointer transition-all bg-white">
          <input type="checkbox" checked={state.sellsServices} onChange={(e)=>setState({...state, sellsServices: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
          <span className="font-medium text-slate-700">Services</span>
        </label>
        <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-300 hover:border-emerald-500 cursor-pointer transition-all bg-white">
          <input type="checkbox" checked={state.sellsProducts} onChange={(e)=>setState({...state, sellsProducts: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
          <span className="font-medium text-slate-700">Products</span>
        </label>
        <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-300 hover:border-emerald-500 cursor-pointer transition-all bg-white">
          <input type="checkbox" checked={state.inventory} onChange={(e)=>setState({...state, inventory: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
          <span className="font-medium text-slate-700">Track inventory</span>
        </label>
      </div>
      <div className="flex justify-end">
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" onClick={()=>onSave(state)}>
          Save step
        </button>
      </div>
    </div>
  )
}

function FiscalStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ fiscalStart: 'Jan', accountingMethod: 'accrual', currency: 'USD' })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Fiscal & Accounting Setup</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Fiscal year starts</label>
          <select aria-label="Fiscal year start" value={form.fiscalStart} onChange={(e)=>setForm({...form, fiscalStart: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
            <option>Jan</option>
            <option>Apr</option>
            <option>Jul</option>
            <option>Oct</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Accounting method</label>
          <select aria-label="Accounting method" value={form.accountingMethod} onChange={(e)=>setForm({...form, accountingMethod: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
            <option value="accrual">Accrual</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
          <select aria-label="Default currency" value={form.currency} onChange={(e)=>setForm({...form, currency: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
            <option>USD</option>
            <option>PHP</option>
            <option>EUR</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" onClick={()=>onSave(form)}>
          Save step
        </button>
      </div>
    </div>
  )
}

function TaxStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ taxType: 'VAT', taxRate: 12, inclusive: false })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Tax Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tax type</label>
          <select aria-label="Tax type" value={form.taxType} onChange={(e)=>setForm({...form, taxType: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
            <option>VAT</option>
            <option>GST</option>
            <option>No tax</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Default tax rate (%)</label>
          <input value={String(form.taxRate)} onChange={(e)=>setForm({...form, taxRate: Number(e.target.value)})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="Default tax rate" />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-300 hover:border-emerald-500 cursor-pointer transition-all bg-white">
            <input type="checkbox" checked={form.inclusive} onChange={(e)=>setForm({...form, inclusive: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
            <span className="font-medium text-slate-700">Tax inclusive</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" onClick={()=>onSave(form)}>
          Save step
        </button>
      </div>
    </div>
  )
}

function BrandingStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ logo: '', invoicePrefix: 'HYP-', paymentTerms: 'Net 30' })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Branding & Defaults</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL (optional)</label>
          <input value={form.logo} onChange={(e)=>setForm({...form, logo: e.target.value})} placeholder="https://example.com/logo.png" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Invoice prefix</label>
          <input value={form.invoicePrefix} onChange={(e)=>setForm({...form, invoicePrefix: e.target.value})} placeholder="INV-" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment terms</label>
          <input value={form.paymentTerms} onChange={(e)=>setForm({...form, paymentTerms: e.target.value})} placeholder="Net 30" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" />
        </div>
      </div>
      <div className="flex justify-end">
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" onClick={()=>onSave(form)}>
          Save step
        </button>
      </div>
    </div>
  )
}

function BankingStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ acceptsBank: true, acceptsCash: true, accounts: [] as any[] })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Methods</h3>
      <div className="flex flex-wrap gap-4 mb-6">
        <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-300 hover:border-emerald-500 cursor-pointer transition-all bg-white">
          <input type="checkbox" checked={form.acceptsBank} onChange={(e)=>setForm({...form, acceptsBank: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
          <span className="font-medium text-slate-700">Bank payments</span>
        </label>
        <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-300 hover:border-emerald-500 cursor-pointer transition-all bg-white">
          <input type="checkbox" checked={form.acceptsCash} onChange={(e)=>setForm({...form, acceptsCash: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
          <span className="font-medium text-slate-700">Cash payments</span>
        </label>
      </div>
      <div className="flex justify-end">
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" onClick={()=>onSave(form)}>
          Save step
        </button>
      </div>
    </div>
  )
}

function OpeningBalancesStep({ data, onSave }: { data?: any, onSave: (d: any) => void }) {
  const [form, setForm] = useState({ cash: 0, bank: 0, ar: 0, ap: 0, equity: 0 })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Opening Balances</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Cash</label>
          <input value={String(form.cash)} onChange={(e)=>setForm({...form, cash: Number(e.target.value)})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Bank</label>
          <input value={String(form.bank)} onChange={(e)=>setForm({...form, bank: Number(e.target.value)})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">A/R</label>
          <input value={String(form.ar)} onChange={(e)=>setForm({...form, ar: Number(e.target.value)})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">A/P</label>
          <input value={String(form.ap)} onChange={(e)=>setForm({...form, ap: Number(e.target.value)})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Equity</label>
          <input value={String(form.equity)} onChange={(e)=>setForm({...form, equity: Number(e.target.value)})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="0.00" />
        </div>
      </div>
      <div className="flex justify-end">
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" onClick={()=>onSave(form)}>
          Save step
        </button>
      </div>
    </div>
  )
}

function ReviewStep({ snapshot, onEdit }: { snapshot: any, onEdit: (idx:number) => void }) {
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Review your settings
      </h3>
      <pre className="bg-slate-100 p-4 rounded-xl max-h-80 overflow-auto mb-6 text-xs font-mono border border-slate-200">{JSON.stringify(snapshot, null, 2)}</pre>
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 rounded-xl border-2 border-emerald-300 text-emerald-700 font-medium hover:bg-emerald-50 transition-all" onClick={() => onEdit(0)}>Edit Business</button>
        <button className="px-4 py-2 rounded-xl border-2 border-emerald-300 text-emerald-700 font-medium hover:bg-emerald-50 transition-all" onClick={() => onEdit(1)}>Edit Products</button>
        <button className="px-4 py-2 rounded-xl border-2 border-emerald-300 text-emerald-700 font-medium hover:bg-emerald-50 transition-all" onClick={() => onEdit(2)}>Edit Fiscal</button>
        <button className="px-4 py-2 rounded-xl border-2 border-emerald-300 text-emerald-700 font-medium hover:bg-emerald-50 transition-all" onClick={() => onEdit(3)}>Edit Tax</button>
      </div>
    </div>
  )
}
