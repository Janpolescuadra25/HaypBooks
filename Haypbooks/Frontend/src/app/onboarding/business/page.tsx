"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import apiClient from '@/lib/api-client'
import {
  Building2, ShieldCheck, Sparkles, Landmark, FileText,
  CheckCircle2, ArrowRight, ArrowLeft, Upload, Plus, X,
  Briefcase, Calendar, DollarSign,
} from 'lucide-react'

// ─── Types & Data ─────────────────────────────────────────────────────────────

type Step = 'business' | 'products' | 'fiscal_tax' | 'branding' | 'banking' | 'review' | 'success'

const TAX_DEFAULTS: Record<string, { rate: number; type: string; frequency: string; currency: string }> = {
  Philippines: { rate: 12, type: 'VAT', frequency: 'Quarterly', currency: 'PHP' },
  Australia: { rate: 10, type: 'GST', frequency: 'Quarterly', currency: 'AUD' },
  'United Kingdom': { rate: 20, type: 'VAT', frequency: 'Quarterly', currency: 'GBP' },
  Canada: { rate: 5, type: 'GST/HST', frequency: 'Quarterly', currency: 'CAD' },
  'United States': { rate: 0, type: 'Sales Tax', frequency: 'Monthly', currency: 'USD' },
  Other: { rate: 0, type: 'Tax', frequency: 'Quarterly', currency: 'USD' },
}

const INDUSTRY_OPTIONS = [
  'Retail',
  'SaaS / Software',
  'Professional Services',
  'Manufacturing',
  'Construction',
  'Hospitality',
  'Healthcare',
  'Non-profit',
  'Other',
]


const STEPS: { id: Step; label: string }[] = [
  { id: 'business', label: 'Business' },
  { id: 'products', label: 'Offerings' },
  { id: 'fiscal_tax', label: 'Fiscal & Tax' },
  { id: 'branding', label: 'Branding' },
  { id: 'banking', label: 'Banking' },
  { id: 'review', label: 'Review' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputGroup({ label, placeholder, type = 'text', value, onChange, required }: {
  label: string; placeholder?: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-700 ml-1">
        {label} {required && <span className="text-emerald-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
      />
    </div>
  )
}

function SelectGroup({ label, options, value, onChange, required }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-700 ml-1">
        {label} {required && <span className="text-emerald-500">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
      >
        <option value="" disabled>Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  )
}

function ToggleButton({ active, onClick, variant = 'light' }: { active: boolean; onClick: () => void; variant?: 'light' | 'dark' }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full relative transition-all flex-shrink-0 ${active ? (variant === 'light' ? 'bg-emerald-500' : 'bg-emerald-400') : 'bg-slate-200'}`}
    >
      <motion.div
        animate={{ x: active ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${variant === 'light' ? 'bg-white' : active ? 'bg-slate-900' : 'bg-white'}`}
      />
    </button>
  )
}

function ReviewItem({ title, icon, onEdit, details }: {
  title: string; icon: React.ReactNode; onEdit: () => void; details: { label: string; value: any }[]
}) {
  return (
    <div className="p-6 bg-white border border-slate-100 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-900">
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">{icon}</div>
          <h4 className="font-bold">{title}</h4>
        </div>
        <button onClick={onEdit} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">Edit</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {details.map((d, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{d.label}</p>
            <p className="text-xs font-medium text-slate-700 truncate">{d.value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState<Step>('business')
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [coaTemplates, setCoaTemplates] = React.useState<Array<{ id: string; name: string; description: string; exampleAccounts: string[] }>>([])
  const [selectedTemplate, setSelectedTemplate] = React.useState<{ id: string; name: string; description: string } | null>(null)
  const [formData, setFormData] = React.useState({
    businessName: '',
    legalName: '',
    businessType: '',
    industry: '',
    industryOther: '',
    country: 'Philippines',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactName: '',
    sellProducts: false,
    hasInventory: false,
    sellServices: true,
    runPayroll: false,
    fiscalYearStart: 'January',
    currency: 'PHP',
    accountingMethod: 'Accrual',
    tin: '',
    taxFrequency: 'Quarterly',
    collectVat: true,
    taxRate: 12,
    taxType: 'VAT',
    taxInclusive: false,
    logoUrl: '',
    invoicePrefix: 'INV-',
    paymentTerms: 'Net 30',
    bankAccounts: [] as { name: string; type: string; number: string }[],
    automatedFeeds: true,
  })

  const stepIndex = STEPS.findIndex(s => s.id === currentStep)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const refreshCoaTemplates = async (industry: string | null) => {
    try {
      const res = await apiClient.get('/api/accounting/coa-templates', { params: { industry } })
      const data = res.data as { templates: Array<{ id: string; name: string; description: string; exampleAccounts: string[] }>; selectedTemplate: { id: string; name: string; description: string } }
      setCoaTemplates(data.templates)
      setSelectedTemplate(data.selectedTemplate)
    } catch {
      // ignore failures — preview is optional
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const next: any = { ...prev, [field]: value }

      if (field === 'country' && TAX_DEFAULTS[value]) {
        Object.assign(next, TAX_DEFAULTS[value])
        next.collectVat = value !== 'United States'
      }

      // If user selects "Other" industry, clear the custom field to allow truthy input
      if (field === 'industry' && value === 'Other') {
        next.industryOther = ''
      }

      return next
    })

    if (field === 'industry') {
      refreshCoaTemplates(value)
    }
  }

  React.useEffect(() => {
    // Load COA template list on mount and populate preview for current industry
    refreshCoaTemplates(formData.industry)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nextStep = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      // Determine what to save based on the current step
      let stepName = ''
      let payload = {}

      if (currentStep === 'business') {
        stepName = 'business'
        const industryValue = formData.industry === 'Other' ? formData.industryOther.trim() : formData.industry
        payload = {
          businessName: formData.businessName,
          legalBusinessName: formData.legalName,
          businessType: formData.businessType,
          industry: industryValue,
          country: formData.country,
          address: formData.address,
        }
      } else if (currentStep === 'products') {
        stepName = 'features'
        payload = {
          sellProducts: formData.sellProducts,
          hasInventory: formData.hasInventory,
          sellServices: formData.sellServices,
          runPayroll: formData.runPayroll,
        }
      } else if (currentStep === 'fiscal_tax') {
        stepName = 'fiscal'
        payload = {
          fiscalStart: formData.fiscalYearStart,
          currency: formData.currency,
          accountingMethod: formData.accountingMethod,
        }
        await apiClient.post('/api/onboarding/save', {
          step: 'tax', data: {
            taxId: formData.tin,
            collectTax: formData.collectVat,
            taxRate: formData.taxRate,
            taxFrequency: formData.taxFrequency,
            pricesInclusive: formData.taxInclusive,
          }
        })
      } else if (currentStep === 'branding') {
        stepName = 'branding'
        payload = {
          logo: formData.logoUrl,
          invoicePrefix: formData.invoicePrefix,
          paymentTerms: formData.paymentTerms,
        }
      } else if (currentStep === 'banking') {
        stepName = 'banking'
        payload = {
          automatedFeeds: formData.automatedFeeds,
        }
      }

      if (stepName) {
        await apiClient.post('/api/onboarding/save', { step: stepName, data: payload })
      }

      if (currentStep === 'review') {
        // Complete the onboarding flow and create company
        await apiClient.post('/api/onboarding/complete', { hub: 'OWNER', type: 'full' })
        setCurrentStep('success')
      } else {
        if (stepIndex < STEPS.length - 1) {
          setCurrentStep(STEPS[stepIndex + 1].id)
        }
      }
    } catch (error: any) {
      console.error('Failed to save step:', error)
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to save. Please try again.'
      setSaveError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const prevStep = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1].id)
  }

  // ── Success screen ──
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-emerald-400 rounded-full blur-xl -z-10"
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">
              {formData.businessName || formData.legalName || 'Your company'} was created
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Your business profile has been set up. We're now preparing your personalized ledger and dashboard.
            </p>
          </div>
          <button
            onClick={() => router.push('/hub/companies')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group"
          >
            Enter Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Main layout ──
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-100 z-50">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          className="h-full bg-emerald-600"
        />
      </div>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="lg:w-1/3 bg-slate-900 p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-900/20">
              <Building2 className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Business Setup</h1>
            <p className="text-slate-400 leading-relaxed">
              Let's get your company profile ready for professional bookkeeping and automated ledgers.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            {STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 transition-all duration-500 ${stepIndex >= idx ? 'opacity-100 translate-x-2' : 'opacity-30'}`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stepIndex >= idx ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`} />
                <span className={`text-sm font-bold tracking-wide ${stepIndex >= idx ? 'text-white' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Haypbooks Company Onboarding</p>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="lg:w-2/3 p-8 lg:p-24 flex flex-col items-center bg-slate-50/30 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* ── Step 1: Business Profile ── */}
                {currentStep === 'business' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">Business Profile</h2>
                      <p className="text-slate-500">Core information used for reports, invoices, and legal identity.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputGroup label="Business Name" placeholder="Acme Services" value={formData.businessName} onChange={v => updateFormData('businessName', v)} required />
                      <SelectGroup label="Business Type" options={['Sole Proprietor', 'Corporation', 'Partnership', 'Non-profit', 'Other']} value={formData.businessType} onChange={v => updateFormData('businessType', v)} required />
                      <SelectGroup label="Industry" options={INDUSTRY_OPTIONS} value={formData.industry} onChange={v => updateFormData('industry', v)} required />
                      {formData.industry === 'Other' && (
                        <InputGroup label="Industry (Other)" placeholder="Describe your industry" value={formData.industryOther} onChange={v => updateFormData('industryOther', v)} required />
                      )}

                      {/* COA Preview */}
                      {selectedTemplate && (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chart of Accounts Preview</p>
                              <p className="text-sm text-slate-700 mt-1">This is a sample of accounts that will be created for your business type ({selectedTemplate.name}).</p>
                            </div>
                            <div className="text-xs text-slate-500 italic">{selectedTemplate.description}</div>
                          </div>
                          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(coaTemplates.find(t => t.id === selectedTemplate.id)?.exampleAccounts ?? []).map((line) => (
                              <li key={line} className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <SelectGroup label="Country" options={['Philippines', 'United States', 'Australia', 'United Kingdom', 'Canada', 'Other']} value={formData.country} onChange={v => updateFormData('country', v)} required />
                      <InputGroup label="Legal Business Name" placeholder="Acme Corp LLC" value={formData.legalName} onChange={v => updateFormData('legalName', v)} />
                      <InputGroup label="Contact Name" placeholder="Juan Dela Cruz" value={formData.contactName} onChange={v => updateFormData('contactName', v)} required />
                    </div>
                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <label className="text-sm font-bold text-slate-700 ml-1">Business Address</label>
                      <InputGroup label="Street Address" placeholder="123 Business St, Suite 100" value={formData.address} onChange={v => updateFormData('address', v)} />
                      <div className="grid md:grid-cols-3 gap-4">
                        <InputGroup label="City" placeholder="City" value={formData.city} onChange={v => updateFormData('city', v)} />
                        <InputGroup label="State" placeholder="State" value={formData.state} onChange={v => updateFormData('state', v)} />
                        <InputGroup label="Zip Code" placeholder="Zip" value={formData.zipCode} onChange={v => updateFormData('zipCode', v)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: What Do You Sell ── */}
                {currentStep === 'products' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">What Do You Sell?</h2>
                      <p className="text-slate-500">Configures which features are enabled in your workspace.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">Sell Products</h4>
                          <p className="text-xs text-slate-500">Enables inventory module for physical or digital goods.</p>
                        </div>
                        <ToggleButton active={formData.sellProducts} onClick={() => updateFormData('sellProducts', !formData.sellProducts)} />
                      </div>
                      <AnimatePresence>
                        {formData.sellProducts && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl ml-4"
                          >
                            <div className="space-y-1">
                              <h4 className="font-bold text-emerald-900">Track Inventory</h4>
                              <p className="text-xs text-emerald-600">Track stock levels and Cost of Goods Sold (COGS).</p>
                            </div>
                            <ToggleButton active={formData.hasInventory} onClick={() => updateFormData('hasInventory', !formData.hasInventory)} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">Sell Services</h4>
                          <p className="text-xs text-slate-500">Enables service items in your invoices.</p>
                        </div>
                        <ToggleButton active={formData.sellServices} onClick={() => updateFormData('sellServices', !formData.sellServices)} />
                      </div>
                      <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">Run Payroll?</h4>
                          <p className="text-xs text-slate-500">Enables payroll module (Coming soon).</p>
                        </div>
                        <ToggleButton active={formData.runPayroll} onClick={() => updateFormData('runPayroll', !formData.runPayroll)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Fiscal & Tax ── */}
                {currentStep === 'fiscal_tax' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">Fiscal & Tax</h2>
                      <p className="text-slate-500">The most critical configuration — determines how books are kept and taxes are calculated.</p>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Calendar size={20} className="text-emerald-600" />
                          Fiscal Section
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <SelectGroup label="Fiscal Year Start" options={['January', 'April', 'July', 'October']} value={formData.fiscalYearStart} onChange={v => updateFormData('fiscalYearStart', v)} required />
                          <SelectGroup label="Currency" options={['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD']} value={formData.currency} onChange={v => updateFormData('currency', v)} required />
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Accounting Method</label>
                            <div className="flex gap-4">
                              {['Cash', 'Accrual'].map(method => (
                                <button
                                  key={method}
                                  onClick={() => updateFormData('accountingMethod', method)}
                                  className={`flex-grow py-3 rounded-xl border font-bold text-sm transition-all ${formData.accountingMethod === method ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'}`}
                                >
                                  {method}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <ShieldCheck size={20} className="text-emerald-600" />
                          Tax Section
                        </h3>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 bg-white border border-emerald-100 rounded-xl">
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900">Collect {formData.taxType}?</h4>
                              <p className="text-xs text-slate-500">Auto-calculates on all invoices.</p>
                            </div>
                            <ToggleButton active={formData.collectVat} onClick={() => updateFormData('collectVat', !formData.collectVat)} />
                          </div>
                          {formData.collectVat && (
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-1.5">
                                <label className="text-sm font-bold text-emerald-900 ml-1">Tax Rate (%)</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={formData.taxRate}
                                    onChange={e => updateFormData('taxRate', parseFloat(e.target.value))}
                                    className="w-full bg-white border border-emerald-200 rounded-xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                  />
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 uppercase">{formData.taxType}</div>
                                </div>
                                <p className="text-[10px] text-emerald-600 font-medium mt-1">Pre-filled based on {formData.country} — you can adjust this.</p>
                              </div>
                              <SelectGroup label="Filing Frequency" options={['Monthly', 'Quarterly']} value={formData.taxFrequency} onChange={v => updateFormData('taxFrequency', v)} required />
                            </div>
                          )}
                          <div className="grid md:grid-cols-2 gap-6">
                            <InputGroup label="TIN / Tax ID" placeholder="Optional — can add later" value={formData.tin} onChange={v => updateFormData('tin', v)} />
                            <div className="flex items-center gap-3 pt-6">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={formData.taxInclusive}
                                  onChange={e => updateFormData('taxInclusive', e.target.checked)}
                                  className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Prices include tax?</span>
                              </label>
                            </div>
                          </div>
                          {formData.country === 'United States' && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                              <div className="text-amber-600"><Sparkles size={18} /></div>
                              <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>USA exception:</strong> Sales tax varies by state. Check your state's rate before invoicing.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 4: Branding ── */}
                {currentStep === 'branding' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">Branding</h2>
                      <p className="text-slate-500">Personalize your invoices and client communications.</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 ml-1">Company Logo</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer group">
                          {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Logo" className="h-20 object-contain" />
                          ) : (
                            <>
                              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                                <Upload size={32} />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-bold text-slate-900">Click to upload logo</p>
                                <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <InputGroup label="Invoice Prefix" placeholder="INV-" value={formData.invoicePrefix} onChange={v => updateFormData('invoicePrefix', v)} />
                        <SelectGroup label="Default Payment Terms" options={['Due on Receipt', 'Net 15', 'Net 30', 'Net 60']} value={formData.paymentTerms} onChange={v => updateFormData('paymentTerms', v)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 5: Banking ── */}
                {currentStep === 'banking' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">Banking</h2>
                      <p className="text-slate-500">Connect your accounts for automated transaction feeds.</p>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {['BPI', 'BDO', 'Metrobank', 'UnionBank', 'GCash', 'Maya'].map(bank => (
                          <button
                            key={bank}
                            className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                          >
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all">{bank}</div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{bank}</span>
                          </button>
                        ))}
                        <button className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl hover:bg-white hover:border-emerald-500 transition-all flex flex-col items-center justify-center gap-2 group">
                          <Plus size={20} className="text-slate-400 group-hover:text-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Add Manual</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl text-white">
                        <div className="space-y-1">
                          <h4 className="font-bold">Automated Bank Feeds</h4>
                          <p className="text-xs text-slate-400">Securely sync transactions daily.</p>
                        </div>
                        <ToggleButton active={formData.automatedFeeds} onClick={() => updateFormData('automatedFeeds', !formData.automatedFeeds)} variant="dark" />
                      </div>
                      {formData.bankAccounts.length > 0 && (
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700">Connected Accounts</label>
                          <div className="space-y-2">
                            {formData.bankAccounts.map((acc, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <Landmark size={18} className="text-slate-400" />
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{acc.name}</p>
                                    <p className="text-[10px] text-slate-500">{acc.type} • {acc.number}</p>
                                  </div>
                                </div>
                                <button className="text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Step 6: Review ── */}
                {currentStep === 'review' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">Review</h2>
                      <p className="text-slate-500">Verify your information before finalizing.</p>
                    </div>
                    <div className="grid gap-4">
                      <ReviewItem title="Company Identity" icon={<Building2 size={18} />} onEdit={() => setCurrentStep('business')}
                        details={[
                          { label: 'Name', value: formData.businessName },
                          { label: 'Legal Name', value: formData.legalName },
                          { label: 'Type', value: formData.businessType },
                          { label: 'Contact', value: formData.contactName },
                        ]}
                      />
                      <ReviewItem title="Offerings" icon={<Briefcase size={18} />} onEdit={() => setCurrentStep('products')}
                        details={[
                          { label: 'Products', value: formData.sellProducts ? 'Yes' : 'No' },
                          { label: 'Services', value: formData.sellServices ? 'Yes' : 'No' },
                          { label: 'Payroll', value: formData.runPayroll ? 'Yes' : 'No' },
                        ]}
                      />
                      <ReviewItem title="Fiscal & Tax" icon={<ShieldCheck size={18} />} onEdit={() => setCurrentStep('fiscal_tax')}
                        details={[
                          { label: 'Fiscal Start', value: formData.fiscalYearStart },
                          { label: 'Currency', value: formData.currency },
                          { label: 'Tax Rate', value: `${formData.taxRate}% (${formData.taxType})` },
                          { label: 'Filing', value: formData.taxFrequency },
                        ]}
                      />
                      <ReviewItem title="Branding" icon={<Sparkles size={18} />} onEdit={() => setCurrentStep('branding')}
                        details={[
                          { label: 'Prefix', value: formData.invoicePrefix },
                          { label: 'Terms', value: formData.paymentTerms },
                        ]}
                      />
                      <ReviewItem title="Banking" icon={<Landmark size={18} />} onEdit={() => setCurrentStep('banking')}
                        details={[
                          { label: 'Automated Feeds', value: formData.automatedFeeds ? 'Enabled' : 'Disabled' },
                          { label: 'Accounts', value: `${formData.bankAccounts.length} connected` },
                        ]}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col gap-4">
              {saveError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                  ⚠️ {saveError}
                </div>
              )}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  className={`flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors ${currentStep === 'business' ? 'invisible' : ''}`}
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={isSaving}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group"
                >
                  {isSaving ? 'Saving...' : currentStep === 'review' ? 'Complete Setup' : 'Continue'}
                  {!isSaving && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
