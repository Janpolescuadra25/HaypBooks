import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ── Reusable scrollable dropdown ─────────────────────────────────────────────
type SelectOption = { value: string; label: string }

function ScrollSelect({
  id, ariaLabel, value, onChange, options, placeholder = 'Select…', hasError = false,
}: {
  id?: string
  ariaLabel?: string
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  hasError?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`w-full h-10 px-3 pr-8 border rounded-md text-sm text-left bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all flex items-center justify-between ${hasError ? 'border-red-500' : 'border-slate-200'}`}
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>{selected ? selected.label : placeholder}</span>
        <svg className={`w-4 h-4 text-slate-400 absolute right-2 top-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-48 overflow-y-auto text-sm py-1 ring-0 focus:outline-none"
        >
          {options.map(o => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={() => { onChange(o.value); setOpen(false) }}
              className={`px-3 py-2 cursor-pointer hover:bg-emerald-50 ${o.value === value ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-slate-700'}`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  initial?: any
  currentStep?: number
  onSave?: (d: any) => Promise<void>
  onNext?: (d: any) => Promise<void>
  onBack?: () => void
  onFinish?: (d: any) => Promise<void>
}

export default function PracticeProfile({
  initial = {},
  currentStep = 1,
  onNext,
  onBack,
  onFinish,
}: Props) {
  // currentStep is 1-based; caller controls when to advance
  const step = currentStep
  const PRACTICE_TYPES = ['Sole Practitioner', 'Partnership', 'Small Firm', 'Mid-size Firm', 'Large Firm', 'Corporate Accounting Department', 'Bookkeeping Service', 'Tax Advisory Practice', 'Audit Firm', 'Consulting / Advisory Practice', 'Other']
  const INDUSTRIES = ['General Practice', 'Retail & Wholesale', 'Manufacturing', 'Healthcare', 'Nonprofit / NGO', 'Real Estate', 'Professional Services', 'Agriculture', 'Technology / IT', 'Hospitality & Tourism', 'Construction', 'Education', 'Other']
  const FIRM_SIZES = ['1–5 staff', '6–20 staff', '21–50 staff', '51–200 staff', '200+ staff']

  // Small, common currency list used in onboarding practice profile
  const CURRENCIES = [
    { value: 'PHP', label: 'PHP - Philippine Peso' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
  ]
  const COUNTRY_TO_CURRENCY: Record<string, string> = { 'Philippines': 'PHP', 'United States': 'USD', 'United Kingdom': 'GBP', 'Australia': 'AUD' }

  // Expanded IANA time zone list (present as a dropdown)
  const TIMEZONES = [
    'UTC', 'Pacific/Midway', 'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'America/Caracas', 'America/Sao_Paulo', 'America/Buenos_Aires', 'Atlantic/Azores', 'Europe/London', 'Europe/Dublin', 'Europe/Amsterdam', 'Europe/Paris', 'Europe/Madrid', 'Europe/Berlin', 'Europe/Rome', 'Europe/Istanbul', 'Europe/Moscow', 'Africa/Cairo', 'Africa/Johannesburg', 'Asia/Jerusalem', 'Asia/Baghdad', 'Asia/Dubai', 'Asia/Kuwait', 'Asia/Tehran', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Kathmandu', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Ho_Chi_Minh', 'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Taipei', 'Asia/Manila', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Yakutsk', 'Australia/Perth', 'Australia/Adelaide', 'Australia/Sydney', 'Pacific/Guam', 'Pacific/Auckland', 'Pacific/Fiji'
  ].map(t => ({ value: t, label: t }))

  // Philippine provinces + Metro Manila (used when country = Philippines)
  const PH_PROVINCES = [
    'Metro Manila', 'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique', 'Apayao', 'Aurora',
    'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon', 'Bulacan',
    'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz', 'Catanduanes', 'Cavite', 'Cebu',
    'Compostela Valley', 'Cotabato', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental',
    'Dinagat Islands', 'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo', 'Isabela',
    'Kalinga', 'La Union', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte', 'Maguindanao', 'Marinduque',
    'Masbate', 'Misamis Occidental', 'Misamis Oriental', 'Mountain Province', 'Negros Occidental',
    'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro',
    'Oriental Mindoro', 'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon',
    'Samar', 'Sarangani', 'Shariff Kabunsuan', 'Siquijor', 'Sorsogon', 'South Cotabato', 'Southern Leyte',
    'Sultan Kudarat', 'Sulu', 'Surigao del Norte', 'Surigao del Sur', 'Tarlac', 'Tawi-Tawi',
    'Zambales', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay',
  ]

  // Address is stored as a structured object
  const initAddr = (typeof initial.address === 'object' && initial.address !== null) ? initial.address : {}
  const hasInitialAddress = !!(initAddr.line1 || initAddr.city || initAddr.zip)

  const [form, setForm] = useState({
    name: initial.name ?? '',
    type: initial.type ?? '',
    industry: initial.industry ?? '',
    firmSize: initial.firmSize ?? '',
    country: initial.country ?? 'Philippines',
    address: {
      line1: initAddr.line1 ?? '',
      line2: initAddr.line2 ?? '',
      city: initAddr.city ?? '',
      province: initAddr.province ?? '',
      zip: initAddr.zip ?? '',
      country: initAddr.country ?? (initial.country ?? 'Philippines'),
    },
    currency: initial.currency ?? COUNTRY_TO_CURRENCY[(initial.country || '')] ?? (initial.country === 'Philippines' ? 'PHP' : 'USD'),
    timezone: initial.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAddress, setShowAddress] = useState<boolean>(hasInitialAddress)
  const router = useRouter()

  function validate() {
    const e: Record<string, string> = {}
    // basic required fields are checked on every step so user can't advance without them
    if (!form.name || form.name.trim().length < 2) e.name = 'Practice Name is required'
    if (!form.type) e.type = 'Practice type is required'
    if (!form.industry) e.industry = 'Industry focus is required'
    if (!form.currency) e.currency = 'Currency is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleNext() {
    if (!validate()) return
    if (typeof onNext === 'function') {
      setSaving(true)
      try {
        await onNext(form)
      } finally {
        setSaving(false)
      }
    }
  }

  async function handleFinishStep() {
    if (!validate()) return
    try {
      window.dispatchEvent(new CustomEvent('openPlansModal', { detail: form }))
    } catch (e) {
      // ignore in test env
    }
    setSaving(true)
    try {
      if (typeof onFinish === 'function') {
        await onFinish(form)
      }
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="max-w-xl mx-auto text-left">
      {/* step 1: basic profile information */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="practice-name" className="block text-sm font-medium text-slate-700 mb-2">Practice Name <span className="text-emerald-600">*</span></label>
            <input id="practice-name" className={`w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-sm ${errors.name ? 'border-red-500' : 'border-slate-200'}`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rivera CPA" />
            {errors.name && <div role="alert" className="mt-1 text-xs text-red-600">{errors.name}</div>}
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 mb-2">Time zone</label>
            <ScrollSelect
              id="timezone"
              ariaLabel="Time Zone"
              value={form.timezone}
              onChange={v => setForm({ ...form, timezone: v })}
              options={TIMEZONES}
              placeholder="Select time zone"
            />
          </div>

          <div>
            <label htmlFor="practice-type" className="block text-sm font-medium text-slate-700 mb-2">Practice type <span className="text-emerald-600">*</span></label>
            <ScrollSelect
              id="practice-type"
              ariaLabel="Practice type"
              value={form.type}
              onChange={v => setForm({ ...form, type: v })}
              options={PRACTICE_TYPES.map(t => ({ value: t, label: t }))}
              placeholder="Select practice type"
              hasError={!!errors.type}
            />
            {errors.type && <div role="alert" className="mt-1 text-xs text-red-600">{errors.type}</div>}
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-2">Industry focus <span className="text-emerald-600">*</span></label>
            <ScrollSelect
              id="industry"
              ariaLabel="Industry focus"
              value={form.industry}
              onChange={v => setForm({ ...form, industry: v })}
              options={INDUSTRIES.map(i => ({ value: i, label: i }))}
              placeholder="Select industry"
              hasError={!!errors.industry}
            />
            {errors.industry && <div role="alert" className="mt-1 text-xs text-red-600">{errors.industry}</div>}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">Country</label>
            <ScrollSelect
              id="country"
              ariaLabel="Country"
              value={form.country}
              onChange={(val) => {
                const mapped = COUNTRY_TO_CURRENCY[val] ?? form.currency
                setForm({ ...form, country: val, currency: mapped })
              }}
              options={["Philippines", "United States", "United Kingdom", "Australia", "Other"].map(c => ({ value: c, label: c }))}
              placeholder="Select country"
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-2">Currency <span className="text-emerald-600">*</span></label>
            <ScrollSelect
              id="currency"
              ariaLabel="Currency"
              value={form.currency}
              onChange={(val) => setForm({ ...form, currency: val })}
              options={CURRENCIES}
              placeholder="Select currency"
              hasError={!!errors.currency}
            />
            {errors.currency && <div role="alert" className="mt-1 text-xs text-red-600">{errors.currency}</div>}
          </div>
        </div>
      )}

      {/* step 2: operational details / address */}
      {step === 2 && (
        <>
          {/* country & base currency grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">Country</label>
              <ScrollSelect
                id="country"
                ariaLabel="Country"
                value={form.country}
                onChange={(val) => {
                  const mapped = COUNTRY_TO_CURRENCY[val] ?? form.currency
                  setForm({ ...form, country: val, currency: mapped })
                }}
                options={["Philippines", "United States", "United Kingdom", "Australia", "Other"].map(c => ({ value: c, label: c }))}
                placeholder="Select country"
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-2">Base Currency <span className="text-emerald-600">*</span></label>
              <ScrollSelect
                id="currency"
                ariaLabel="Currency"
                value={form.currency}
                onChange={(val) => setForm({ ...form, currency: val })}
                options={CURRENCIES}
                placeholder="Select currency"
                hasError={!!errors.currency}
              />
              {errors.currency && <div role="alert" className="mt-1 text-xs text-red-600">{errors.currency}</div>}
            </div>
          </div>

          <div className="mb-6">
            <button
              type="button"
              aria-expanded={showAddress}
              aria-controls="organization-address"
              onClick={() => setShowAddress(s => !s)}
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-emerald-600 transition-transform ${showAddress ? 'rotate-45' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </span>
              Practice Address <span className="text-xs font-normal text-slate-400 ml-1">(optional)</span>
            </button>

            {showAddress && (
              <div id="organization-address" className="mt-4 border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-4">
                {/* Address Line 1 & 2 */}
                <div className="space-y-3">
                  <div>
                    <label htmlFor="addr-line1" className="block text-xs font-medium text-slate-600 mb-1">Address Line 1 <span className="text-slate-400">(Street, Building)</span></label>
                    <input
                      id="addr-line1"
                      aria-label="Address Line 1"
                      placeholder="e.g. 123 Rizal Ave, Tower 2"
                      className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      value={form.address.line1}
                      onChange={e => setForm({ ...form, address: { ...form.address, line1: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label htmlFor="addr-line2" className="block text-xs font-medium text-slate-600 mb-1">Address Line 2 <span className="text-slate-400">(Barangay, Unit, Floor)</span></label>
                    <input
                      id="addr-line2"
                      aria-label="Address Line 2"
                      placeholder="e.g. Barangay San Lorenzo"
                      className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      value={form.address.line2}
                      onChange={e => setForm({ ...form, address: { ...form.address, line2: e.target.value } })}
                    />
                  </div>
                </div>

                {/* City / Municipality & Province */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="addr-city" className="block text-xs font-medium text-slate-600 mb-1">City / Municipality</label>
                    <input
                      id="addr-city"
                      aria-label="City / Municipality"
                      placeholder="e.g. Makati City"
                      className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      value={form.address.city}
                      onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label htmlFor="addr-province" className="block text-xs font-medium text-slate-600 mb-1">Province</label>
                    {form.country === 'Philippines' ? (
                      <ScrollSelect
                        id="addr-province"
                        ariaLabel="Province"
                        value={form.address.province}
                        onChange={v => setForm({ ...form, address: { ...form.address, province: v } })}
                        options={PH_PROVINCES.map(p => ({ value: p, label: p }))}
                        placeholder="Select province"
                      />
                    ) : (
                      <input
                        id="addr-province"
                        aria-label="Province"
                        placeholder="State / Province / Region"
                        className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        value={form.address.province}
                        onChange={e => setForm({ ...form, address: { ...form.address, province: e.target.value } })}
                      />
                    )}
                  </div>
                </div>

                {/* ZIP / Postal Code & Country */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="addr-zip" className="block text-xs font-medium text-slate-600 mb-1">ZIP / Postal Code</label>
                    <input
                      id="addr-zip"
                      aria-label="ZIP / Postal Code"
                      placeholder="e.g. 1226"
                      className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      value={form.address.zip}
                      onChange={e => setForm({ ...form, address: { ...form.address, zip: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label htmlFor="addr-country" className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                    <ScrollSelect
                      id="addr-country"
                      ariaLabel="Address Country"
                      value={form.address.country}
                      onChange={v => setForm({ ...form, address: { ...form.address, country: v } })}
                      options={["Philippines", "United States", "United Kingdom", "Australia", "Other"].map(c => ({ value: c, label: c }))}
                      placeholder="Select country"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>
        </>
      )}

      {/* step 3: team & finalize */}
      {step === 3 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-4">
            <div>
              <label htmlFor="firmSize" className="block text-sm font-medium text-slate-700 mb-1">How many team members do you have?</label>
              <ScrollSelect
                id="firmSize"
                ariaLabel="Firm size"
                value={form.firmSize}
                onChange={v => setForm({ ...form, firmSize: v })}
                options={FIRM_SIZES.map(f => ({ value: f, label: f }))}
                placeholder="Select firm size"
              />
            </div>
          </div>

          <hr className="border-slate-100 my-4" />

          <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-100 text-green-800">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <span className="font-semibold">Ready to launch</span>
            </div>
            <p className="text-sm mt-1">
              Your Practice Hub is being prepared with your firm&apos;s specific settings. You can change these anytime in the Practice Settings.
            </p>
          </div>
        </>
      )}

      <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
        {(step > 1) && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : <span />}

        <button
          data-testid="finish-onboarding-button"
          type="button"
          className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={async () => {
            if (step < 3) {
              await handleNext()
            } else {
              await handleFinishStep()
            }
          }}
          disabled={saving}
        >
          {saving
            ? 'Saving…'
            : step === 1
              ? 'Continue'
              : step === 2
                ? 'Continue'
                : 'Finish Onboarding'}
          {!saving && (
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
