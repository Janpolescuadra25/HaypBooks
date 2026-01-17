"use client"

import React, { useEffect, useState, useRef, useImperativeHandle } from 'react'
import BusinessStepComponent from '@/components/Onboarding/BusinessStep'
import ProductsServicesPage from '@/components/CompanySetup/ProductsServicesPage'
import apiClient from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'

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
  'Review',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot>({})
  const stepRef = useRef<any>(null)
  const [savingStep, setSavingStep] = useState(false)
  const [canProceed, setCanProceed] = useState(true)
  const STEP_KEYS = ['business','sells','fiscal','tax','branding','banking']

  // Check if current step has required data
  useEffect(() => {
    const checkValidity = () => {
      if (step === 0 && stepRef.current && typeof stepRef.current.hasRequiredData === 'function') {
        setCanProceed(stepRef.current.hasRequiredData())
      } else {
        setCanProceed(true)
      }
    }
    // Check initially and set up interval to check while user types
    checkValidity()
    const interval = setInterval(checkValidity, 200)
    return () => clearInterval(interval)
  }, [step, stepRef.current])

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

  const { push } = useToast()

  async function completeOnboarding() {
    setLoading(true)
    try {
      // We'll capture the server response payload so we can use the created company (if any)
      let resJson: any = null
      if (USE_MOCK) {
        const r = await fetch('/api/onboarding/complete', { method: 'POST', body: JSON.stringify({ type: 'full' }), headers: { 'Content-Type': 'application/json' } })
        if (!r.ok) throw new Error('complete failed')
        resJson = await r.json().catch(() => null)
      } else {
        const r = await apiClient.post('/api/onboarding/complete', { type: 'full', hub: 'OWNER' })
        if (!(r.status >= 200 && r.status < 300)) throw new Error('complete failed')
        resJson = r.data || null
      }

      // Show a short success toast indicating the company was created (use snapshot data if available)
      try {
        const companyName = resJson?.company?.name || (snapshot as any)?.business?.companyName
        if (companyName) {
          push({ type: 'success', message: `Your company ${companyName} was created` })
          // Give users a short moment to see the toast before navigating away
          await new Promise((res) => setTimeout(res, 450))
        }
      } catch (e) {
        // non-fatal
      }

      // If the backend returned the created company, poll the Owner Workspace until it appears (for determinism in E2E/local runs)
      try {
        const created = resJson?.company
        const targetName = created?.name || (snapshot as any)?.business?.companyName

        if (targetName) {
          const found = await waitForCompanyInHub(targetName, 5000)
          if (!found) {
            // Non-fatal: warn that the company wasn't visible within timeout
            push({ type: 'warning', message: `Created ${targetName} but it didn't show in your Owner Workspace right away — you can refresh the Owner Workspace.` })
          }
        }
      } catch (e) {
        // ignore polling errors
      }

      // Navigate to the Owner Workspace so the user sees their company card
      router.push('/hub/companies')
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

  // Poll /api/companies?filter=owned until a matching company name appears or timeout
  async function waitForCompanyInHub(name: string, timeoutMs: number = 5000) {
    if (!name) return false
    const start = Date.now()
    const lower = name.toLowerCase()
    while (Date.now() - start < timeoutMs) {
      try {
        const r = await apiClient.get('/api/companies?filter=owned')
        const list = Array.isArray(r.data) ? r.data : (r.data && r.data.companies) ? r.data.companies : []
        const found = list.find((c: any) => (c.name || '').toLowerCase() === lower || (c.name || '').toLowerCase().includes(lower))
        if (found) return true
      } catch (e) {
        // ignore and retry
      }
      await new Promise((res) => setTimeout(res, 300))
    }
    return false
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
            <BusinessStepComponent ref={stepRef} initial={snapshot.business} onSave={(d) => saveStep('business', d)} />
          )}
          {step === 1 && (
            <ProductsServicesPage ref={stepRef} initial={snapshot.sells} />
          )}
          {step === 2 && (
            <FiscalStep ref={stepRef} data={snapshot.fiscal} onSave={(d) => saveStep('fiscal', d)} />
          )}
          {step === 3 && (
            <TaxStep ref={stepRef} data={snapshot.tax} fiscal={snapshot.fiscal} onSave={(d) => saveStep('tax', d)} />
          )}
          {step === 4 && (
            <BrandingStep ref={stepRef} data={snapshot.branding} onSave={(d) => saveStep('branding', d)} />
          )}
          {step === 5 && (
            <BankingStep ref={stepRef} data={snapshot.banking} onSave={(d) => saveStep('banking', d)} />
          )}
          {step === 6 && (
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
          </div>

          <div className="flex items-center gap-3">
            {step < STEPS.length - 1 ? (
              <button 
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  // Validate current step before saving
                  if (stepRef.current && typeof stepRef.current.hasRequiredData === 'function') {
                    if (!stepRef.current.hasRequiredData()) {
                      // Show validation errors
                      if (typeof stepRef.current.validate === 'function') {
                        stepRef.current.validate()
                      }
                      return
                    }
                  }
                  // Save current step then advance
                  setSavingStep(true)
                  try {
                    const key = STEP_KEYS[step]
                    let data: any = null
                    if (stepRef.current && typeof stepRef.current.getData === 'function') {
                      data = stepRef.current.getData()
                    } else {
                      // fallback to snapshot value
                      data = (step === 0 ? snapshot.business : step === 1 ? snapshot.sells : step === 2 ? snapshot.fiscal : step === 3 ? snapshot.tax : step === 4 ? snapshot.branding : step === 5 ? snapshot.banking : {})
                    }
                    await saveStep(key, data)
                    setStep((s) => Math.min(STEPS.length - 1, s + 1))
                  } catch (err) {
                    console.error(err)
                    alert('Failed to save this step')
                  } finally {
                    setSavingStep(false)
                  }
                }}
                disabled={savingStep || !canProceed}
              >
                {savingStep ? 'Saving…' : 'Save and continue'}
              </button>
            ) : null}
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
            ) : null}
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



const FiscalStep = React.forwardRef(function FiscalStep({ data, onSave }: { data?: any, onSave: (d: any) => void }, ref) {
  const [form, setForm] = useState({ fiscalStart: 'Apr', accountingMethod: 'accrual', currency: 'USD' })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])

  React.useImperativeHandle(ref, () => ({ getData: () => ({ ...form }) }))

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Fiscal & Accounting Setup</h3>
      <p className="text-sm text-slate-500 mb-4">Define your financial period and accounting methodology. These settings are foundational for your <strong>Tax Compliance</strong> and <strong>Financial Reporting</strong>.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-start">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Fiscal Year Start Month</label>
          <select aria-label="Fiscal year start" value={form.fiscalStart} onChange={(e)=>setForm({...form, fiscalStart: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
            <option>Jan</option>
            <option>Apr</option>
            <option>Jul</option>
            <option>Oct</option>
          </select>
          <div className="text-xs text-slate-400 mt-2">Most businesses follow the calendar year (January), but some industries use non-calendar years.</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Default Currency</label>
          <select aria-label="Default currency" value={form.currency} onChange={(e)=>setForm({...form, currency: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
            <option>USD</option>
            <option>PHP</option>
            <option>EUR</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-3 text-sm font-medium text-slate-700">Primary Accounting Method</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={()=>setForm({...form, accountingMethod: 'accrual'})} aria-pressed={form.accountingMethod === 'accrual'} className={`relative text-left p-6 rounded-2xl border ${form.accountingMethod === 'accrual' ? 'border-emerald-400 bg-emerald-50 shadow-lg' : 'border-slate-100 bg-white'} transition-all` }>
            {form.accountingMethod === 'accrual' && (
              <span className="absolute -top-3 -right-3 bg-white rounded-full p-1 border border-emerald-200 shadow">
                <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </span>
            )}
            <div className="font-semibold text-lg">Accrual Basis</div>
            <div className="text-sm text-slate-500 mt-2">Record income when earned and expenses when incurred, regardless of cash flow. <span className="underline">Recommended for most businesses.</span></div>
          </button>

          <button onClick={()=>setForm({...form, accountingMethod: 'cash'})} aria-pressed={form.accountingMethod === 'cash'} className={`relative text-left p-6 rounded-2xl border ${form.accountingMethod === 'cash' ? 'border-emerald-400 bg-emerald-50 shadow-lg' : 'border-slate-100 bg-white'} transition-all` }>
            {form.accountingMethod === 'cash' && (
              <span className="absolute -top-3 -right-3 bg-white rounded-full p-1 border border-emerald-200 shadow">
                <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </span>
            )}
            <div className="font-semibold text-lg">Cash Basis</div>
            <div className="text-sm text-slate-500 mt-2">Record income when cash is received and expenses when they are paid. Simpler for very small businesses with no inventory.</div>
          </button>
        </div>
      </div>
    </div>
  )
})

const TaxStep = React.forwardRef(function TaxStep({ data, fiscal, onSave }: { data?: any, fiscal?: any, onSave: (d: any) => void }, ref) {
  // PH-friendly defaults: Collect VAT ON by default, Quarterly filing when collecting VAT, default VAT rate 12%
  const initial = {
    tin: '',
    filingFrequency: 'quarterly',
    collectTax: true,
    taxExempt: false,
    taxRate: 12,
    inclusive: false,
  }

  const [form, setForm] = useState(initial)

  useEffect(()=>{
    // merge incoming saved data
    if (data) setForm((f) => ({ ...f, ...data }))

    // auto-detect from fiscal/currency if available (e.g., PHP -> PH defaults)
    if (fiscal && typeof fiscal.currency === 'string') {
      if (fiscal.currency === 'PHP') {
        setForm((f) => ({ ...f, collectTax: true, filingFrequency: 'quarterly', taxRate: 12 }))
      }
    }

    // try best-effort by locale detection (client-side)
    try {
      const lang = navigator?.language || ''
      if (lang.toLowerCase().includes('ph')) {
        setForm((f) => ({ ...f, collectTax: true, filingFrequency: 'quarterly', taxRate: 12 }))
      }
    } catch (e) {
      // ignore in server / test env
    }
  }, [])

  React.useImperativeHandle(ref, () => ({ getData: () => ({ ...form }) }))

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Tax Setup</h3>
      <p className="text-sm text-slate-500 mb-4">Quickly set up sales tax or VAT so Haypbooks calculates, tracks, and reminds you about filing deadlines.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tax Identification Number (TIN)</label>
          <input aria-label="Tax Identification Number" placeholder="e.g. 123-456-789-000" value={form.tin} onChange={(e)=>setForm({...form, tin: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" />
          <div className="text-xs text-slate-400 mt-2">Your primary tax registration identifier for government filings. <span className="font-medium">Required for VAT-registered businesses — you can add it later if starting small.</span></div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Sales Tax Filing Frequency</label>
          <select aria-label="Sales tax filing frequency" value={form.filingFrequency} onChange={(e)=>setForm({...form, filingFrequency: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <div className="text-xs text-slate-400 mt-2">Default is <span className="font-medium">Quarterly</span> when collecting VAT (common for VAT-registered businesses in the Philippines).</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`rounded-2xl p-5 border ${form.collectTax ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold flex items-center gap-2">Collect Sales Tax / VAT <span className="text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">Recommended</span></div>
              <div className="text-sm text-slate-500 mt-2">Automatically calculate and track tax on your invoices. Recommended for registered businesses.</div>
              {form.collectTax && (
                <div className="text-xs text-slate-500 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">Default VAT rate:</div>
                    <div className="text-sm text-slate-700">{form.taxRate ?? 12}%</div>
                    <label className="ml-4 inline-flex items-center gap-2 text-sm text-slate-500">
                      <input type="checkbox" aria-label="Tax inclusive pricing" checked={form.inclusive} onChange={(e)=>setForm({...form, inclusive: e.target.checked})} className="w-4 h-4" />
                      <span>Prices include tax</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" aria-label="Collect Sales Tax" checked={form.collectTax} onChange={(e)=>setForm({...form, collectTax: e.target.checked, filingFrequency: e.target.checked ? 'quarterly' : 'monthly'})} className="sr-only" />
                <span className={`w-11 h-6 rounded-full inline-flex items-center p-0.5 ${form.collectTax ? 'bg-emerald-600' : 'bg-slate-200'}`} aria-hidden>
                  <span className={`${form.collectTax ? 'ml-auto' : 'ml-0'} w-5 h-5 bg-white rounded-full shadow transition-all`} />
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-5 border ${form.taxExempt ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">Tax Exempt Status</div>
              <div className="text-sm text-slate-500 mt-2">For non-profits or specific industry categories that are not required to pay or collect standard taxes.</div>
              <div className="text-xs text-slate-400 mt-2">Keep this OFF unless your business is legally tax-exempt.</div>
            </div>
            <div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" aria-label="Tax Exempt Status" checked={form.taxExempt} onChange={(e)=>setForm({...form, taxExempt: e.target.checked})} className="sr-only" />
                <span className={`w-11 h-6 rounded-full inline-flex items-center p-0.5 ${form.taxExempt ? 'bg-emerald-600' : 'bg-slate-200'}`} aria-hidden>
                  <span className={`${form.taxExempt ? 'ml-auto' : 'ml-0'} w-5 h-5 bg-white rounded-full shadow transition-all`} />
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m0-4h.01"/></svg>
          </div>
          <div className="text-sm text-slate-700">
            <div className="font-semibold mb-2">Why this matters</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500">
              <div>
                <div className="font-medium">Automatic Reports</div>
                <div className="text-xs text-slate-400 mt-1">Haypbooks generates quarterly VAT/Sales tax reports so you don't have to calculate them manually.</div>
              </div>
              <div>
                <div className="font-medium">Compliance Guard</div>
                <div className="text-xs text-slate-400 mt-1">We'll alert you <span title="Reminders 5 days before BIR deadlines">5 days before your filing deadline</span> based on your country's fiscal calendar.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export { FiscalStep, TaxStep, BankingStep }

const BrandingStep = React.forwardRef(function BrandingStep({ data, onSave }: { data?: any, onSave: (d: any) => void }, ref) {
  const [form, setForm] = useState({ logo: '', invoicePrefix: 'HYP-', paymentTerms: 'Net 30' })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])

  React.useImperativeHandle(ref, () => ({ getData: () => ({ ...form }) }))

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
    </div>
  )
})

const BankingStep = React.forwardRef(function BankingStep({ data, onSave }: { data?: any, onSave: (d: any) => void }, ref) {
  const [form, setForm] = useState({ acceptsBank: true, acceptsCash: true, accounts: (data?.accounts ?? []) as any[] , automatedFeeds: true })
  useEffect(()=>{ if(data) setForm({...form, ...data}) }, [])

  React.useImperativeHandle(ref, () => ({ getData: () => ({ ...form }) }))

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Banking & Bank Feeds</h3>
      <p className="text-sm text-slate-500 mb-6">Securely connect your bank accounts to automate transaction fetching. This eliminates manual data entry and keeps your books up-to-date.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button aria-label="Connect Bank Account" onClick={()=>{/* placeholder for connect flow */}} className="text-left p-6 rounded-2xl border-2 border-emerald-300 bg-white shadow-sm hover:shadow-lg transition-all">
            <div className="inline-flex items-center justify-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18"/></svg>
              </div>
              <div>
                <div className="font-semibold text-slate-900">Connect Bank Account</div>
                <div className="text-xs text-slate-500 mt-1">Link via secure portal (BPI, BDO, Metrobank, etc.) for automated daily sync.</div>
                <div className="text-xs text-emerald-600 mt-2 font-medium">SECURED BY BANK-GRADE ENCRYPTION</div>
              </div>
            </div>
          </button>

          <button aria-label="Add Account Manually" onClick={()=>setForm((f)=>({ ...f, accounts: [...f.accounts, { id: Date.now(), name: 'Manual Account', type: 'Checking', last4: '0000', live: false }] }))} className="text-left p-6 rounded-2xl border-2 border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="inline-flex items-center justify-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14"/></svg>
              </div>
              <div>
                <div className="font-semibold text-slate-900">Add Manually</div>
                <div className="text-xs text-slate-500 mt-1">Enter account details manually for accounts that don't support bank feeds. Ideal for petty cash or private banks.</div>
              </div>
            </div>
          </button>

          <div className="md:col-span-2 mt-2 rounded-2xl bg-slate-900 text-white p-6 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657 0-3 4-3s4 1.343 4 3v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3c0-1.657 0-3 4-3s4 1.343 4 3z"/></svg>
            </div>
            <div>
              <div className="font-semibold">Your data is safe with us</div>
              <div className="text-xs text-slate-200 mt-1">AccuHub uses read-only access to your transactions. We never store your login credentials or have permission to move money.</div>
            </div>
          </div>
        </div>

        <aside className="p-4 rounded-2xl border border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-slate-700">Added accounts <span className="text-xs text-slate-400">{form.accounts.length} Total</span></div>
            <div className="text-xs text-slate-400">&nbsp;</div>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            {form.accounts.length === 0 ? (
              <div className="text-xs text-slate-400">No accounts added yet.</div>
            ) : (
              form.accounts.map((a:any) => (
                <div key={a.id} className="p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-700">🏦</div>
                    <div>
                      <div className="font-medium text-slate-700">{a.name} <span className="text-xs text-slate-400">{a.type}</span></div>
                      <div className="text-xs text-slate-400">**** {a.last4}</div>
                    </div>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">{a.live ? 'LIVE' : 'MANUAL'}</div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">Automated Feeds</div>
            <label className="inline-flex items-center gap-2">
              <input aria-label="Automated Feeds" type="checkbox" checked={form.automatedFeeds} onChange={(e)=>setForm({...form, automatedFeeds: e.target.checked})} className="sr-only" />
              <span className={`w-11 h-6 rounded-full inline-flex items-center p-0.5 ${form.automatedFeeds ? 'bg-emerald-600' : 'bg-slate-200'}`} aria-hidden>
                <span className={`${form.automatedFeeds ? 'ml-auto' : 'ml-0'} w-5 h-5 bg-white rounded-full shadow transition-all`} />
              </span>
            </label>
          </div>
        </aside>
      </div>
    </div>
  )
})



export function ReviewStep({ snapshot, onEdit }: { snapshot: any, onEdit: (idx:number) => void }) {
  const safe = (v: any, fallback = 'Not specified') => (v === undefined || v === null || v === '' ? fallback : v)
  const mask = (v: any) => {
    if (!v) return 'Not specified'
    const s = String(v)
    if (s.includes('@')) {
      const [local, domain] = s.split('@')
      return `${local[0]}***@${domain}`
    }
    if (/^[0-9+\s()-]{6,}$/.test(s)) {
      return s.replace(/.(?=.{4})/g, '*')
    }
    return s
  }

  const Biz = snapshot?.business || {}
  const Fiscal = snapshot?.fiscal || {}
  const Tax = snapshot?.tax || {}
  const Banking = snapshot?.banking || {}
  const Sells = snapshot?.sells || {}
  const Branding = snapshot?.branding || {}

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configuration Complete</h2>
          <p className="text-sm text-slate-500 mt-1">Please verify your details before we launch your workspace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Identity */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm relative">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <svg aria-label="Company Identity icon" role="img" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V8a1 1 0 011-1h3V3h8v4h3a1 1 0 011 1v13M7 21h10"/></svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Company Identity</h3>
                <button aria-label="edit-company" className="text-slate-400 hover:text-slate-700" onClick={() => onEdit(0)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M16.5 3.75l3.75 3.75M4 13.5V18h4.5L20.25 6.75 15.75 2.25 4 13.5z"/></svg>
                </button>
              </div>
              <div className="text-sm text-slate-500 mt-2 grid grid-cols-2 gap-2">
                <div className="text-xs text-slate-400">Type</div><div>{safe(Biz.businessType)}</div>
                <div className="text-xs text-slate-400">Industry</div><div>{safe(Biz.industry)}</div>
                <div className="text-xs text-slate-400">Location</div><div>{safe(Biz.address, 'Philippines')}</div>
                <div className="text-xs text-slate-400">Contact</div><div>{mask(Biz.businessEmail || Biz.phone)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products & Services */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm relative">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <svg aria-label="Products & Services icon" role="img" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Products & Services</h3>
                <button aria-label="edit-products" className="text-slate-400 hover:text-slate-700" onClick={() => onEdit(1)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M16.5 3.75l3.75 3.75M4 13.5V18h4.5L20.25 6.75 15.75 2.25 4 13.5z"/></svg>
                </button>
              </div>
              <div className="text-sm text-slate-500 mt-2">
                {Sells.sellsProducts ? 'You have products/services configured.' : 'No products added — add products to start invoicing.'}
              </div> 
            </div>
          </div>
        </div>

        {/* Accounting Profile */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm relative">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <svg aria-label="Accounting Profile icon" role="img" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h5"/></svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Accounting Profile</h3>
                <button aria-label="edit-fiscal" className="text-slate-400 hover:text-slate-700" onClick={() => onEdit(2)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M16.5 3.75l3.75 3.75M4 13.5V18h4.5L20.25 6.75 15.75 2.25 4 13.5z"/></svg>
                </button>
              </div>
              <div className="text-sm text-slate-500 mt-2 grid grid-cols-2 gap-2">
                <div className="text-xs text-slate-400">Method</div><div>{safe(Fiscal.accountingMethod, 'Accrual')}</div>
                <div className="text-xs text-slate-400">Fiscal Start</div><div>{safe(Fiscal.fiscalStart, 'January')}</div>
                <div className="text-xs text-slate-400">Reconciliation</div><div>{safe(Fiscal.reconciliation || 'Monthly')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Compliance */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm relative">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-700">
              <svg aria-label="Tax Compliance icon" role="img" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6a8 8 0 01-7 8 8 8 0 01-7-8V6l7-4z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 10l4 4M14 10l-4 4"/></svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Tax Compliance</h3>
                <button aria-label="edit-tax" className="text-slate-400 hover:text-slate-700" onClick={() => onEdit(3)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M16.5 3.75l3.75 3.75M4 13.5V18h4.5L20.25 6.75 15.75 2.25 4 13.5z"/></svg>
                </button>
              </div>
              <div className="text-sm text-slate-500 mt-2 grid grid-cols-2 gap-2">
                <div className="text-xs text-slate-400">TIN</div><div>{safe(Tax.tin, 'Pending')}</div>
                <div className="text-xs text-slate-400">Filing</div><div className="capitalize">{safe(Tax.filingFrequency, 'Quarterly')}</div>
                <div className="text-xs text-slate-400">VAT/TAX RATE</div><div>{Tax.taxRate ? `${Tax.taxRate}%` : '12%'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm relative">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
              <svg aria-label="Branding icon" role="img" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M21 18l-5-5-4 4-3-3-5 5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Branding</h3>
                <button aria-label="edit-branding" className="text-slate-400 hover:text-slate-700" onClick={() => onEdit(4)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M16.5 3.75l3.75 3.75M4 13.5V18h4.5L20.25 6.75 15.75 2.25 4 13.5z"/></svg>
                </button>
              </div>
              <div className="text-sm text-slate-500 mt-2">
                {Branding.logo ? 'Logo uploaded' : 'No logo uploaded — shown on invoices and receipts.'}
              </div>
            </div>
          </div>
        </div>

        {/* Banking Feeds */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm relative">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <svg aria-label="Banking Feeds icon" role="img" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-6 9 6M5 10v6a2 2 0 002 2h10a2 2 0 002-2v-6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8"/></svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Banking Feeds</h3>
                <button aria-label="edit-banking" className="text-slate-400 hover:text-slate-700" onClick={() => onEdit(5)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M16.5 3.75l3.75 3.75M4 13.5V18h4.5L20.25 6.75 15.75 2.25 4 13.5z"/></svg>
                </button>
              </div>
              <div className="text-sm text-slate-500 mt-2 grid grid-cols-2 gap-2">
                <div className="text-xs text-slate-400">Bank Feeds</div><div>{Banking.accounts && Banking.accounts.length > 0 ? 'Active' : 'Inactive'}</div>
                <div className="text-xs text-slate-400">Linked Accounts</div>
                <div className="flex items-center gap-2">{Banking.accounts ? Banking.accounts.length : 0} Connected
                </div> 
                <div className="text-xs text-slate-400">Auto-sync</div><div>Daily at 2:00 AM</div>
              </div>
              <div className="text-xs text-slate-400 mt-3">Connect your bank feeds to keep transactions up to date. This enables automatic reconciliation and matching suggestions.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
