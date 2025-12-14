"use client"
import { useEffect, useRef, useState } from 'react'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import Toaster from '@/components/Toaster'

export default function CompanySettingsPage() {
  const { state, save: rawSave, loaded } = useCompanySettings()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [emailErrors, setEmailErrors] = useState<{company?: boolean; customer?: boolean}>({})
  const [taxIdError, setTaxIdError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const [showSaved, setShowSaved] = useState(false)

  function save(patch: any) {
    rawSave(patch)
    setLastSaved(Date.now())
  }

  useEffect(() => {
    if (lastSaved == null) return
    setShowSaved(true)
    const t = setTimeout(() => setShowSaved(false), 1800)
    return () => clearTimeout(t)
  }, [lastSaved])

  if (!loaded) return (
    <section className="space-y-4 form-dense" aria-busy="true" aria-label="Loading company settings">
      <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="h-10 w-full rounded bg-slate-100 animate-pulse" />
          <div className="h-10 w-full rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
          <div className="h-10 w-full rounded bg-slate-100 animate-pulse" />
          <div className="h-10 w-full rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    </section>
  )

  function onLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1.5 * 1024 * 1024) { setLogoError('Logo must be under 1.5MB'); return }
    const reader = new FileReader()
    reader.onload = () => { 
      save({ logoUrl: reader.result as string }); 
      setLogoError(null)
      try { (window as any).toast?.('Logo updated') } catch {}
    }
    reader.readAsDataURL(file)
  }

  function onlyDigits(s: string) { return (s || '').replace(/\D+/g,'') }
  function formatTaxId(raw: string, type: 'EIN'|'SSN') {
    const d = onlyDigits(raw)
    if (type === 'EIN') {
      const a = d.slice(0,2), b = d.slice(2,9)
      return [a, b].filter(Boolean).join('-')
    } else {
      const a = d.slice(0,3), b = d.slice(3,5), c = d.slice(5,9)
      return [a,b,c].filter(Boolean).join('-')
    }
  }
  function validateTaxId(val: string, type: 'EIN'|'SSN') {
    return type === 'EIN' ? /^\d{2}-\d{7}$/.test(val) : /^\d{3}-\d{2}-\d{4}$/.test(val)
  }
  function isValidEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }
  function formatPhone(raw: string) {
    const d = onlyDigits(raw)
    if (d.length !== 10) return raw
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  }

  function Title({title, subtitle}:{title:string; subtitle?:string}) {
    return (
      <div className="space-y-0.5">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    )
  }

  return (
    <section className="space-y-5 form-dense">
      <Toaster />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-slate-900">Company settings</h1>
        <p className="text-sm text-slate-600">This information appears on your sales forms and certain reports. Changes are saved automatically.</p>
      </div>
      {/* Section navigation removed per request */}

      {/* Row 1: Identity (left) + Contact info (right) */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Identity */}
        <div id="identity" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 w-full md:w-1/2">
          <Title title="Company name" subtitle="Shown on sales forms and purchase orders." />
          <div className="grid gap-3 md:grid-cols-[200px_1fr]">
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-600">Company logo</label>
              <div className="relative h-32 w-32 rounded-md border border-slate-300 bg-slate-100 flex items-center justify-center overflow-hidden">
                {state.logoUrl ? <img src={state.logoUrl} alt="Company logo" className="h-full w-full object-cover" /> : <span className="text-xs text-slate-500">Logo</span>}
                <button onClick={()=>fileRef.current?.click()} className="absolute bottom-1 right-1 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-medium shadow-sm hover:bg-slate-50">+</button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogoSelect} aria-label="Upload company logo" />
              </div>
              {logoError && <div className="text-xs text-red-600">{logoError}</div>}
              <p className="text-xs text-slate-500">Automatically appears on invoices & statements.</p>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-600">Company name
                <input value={state.companyName} onChange={e=>save({ companyName: e.target.value })} className="input w-full" placeholder="Acme LLC" autoComplete="organization" />
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input type="checkbox" checked={state.legalSameAsCompany} onChange={e=>save({ legalSameAsCompany: e.target.checked })} /> Same as company name
              </label>
              {!state.legalSameAsCompany && (
                <label className="block text-xs font-medium text-slate-600">Legal name
                  <input value={state.legalName || ''} onChange={e=>save({ legalName: e.target.value })} className="input w-full" placeholder="Legal registered name" autoComplete="organization" />
                </label>
              )}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-slate-600">EIN / SSN</span>
                <div className="flex items-center gap-4 text-xs">
                  <label className="inline-flex items-center gap-1"><input type="radio" name="taxIdType" checked={state.taxIdType==='EIN'} onChange={()=>{
                    const next = 'EIN' as const
                    const formatted = state.taxId ? formatTaxId(state.taxId, next) : ''
                    save({ taxIdType: next, taxId: formatted })
                    setTaxIdError(formatted && !validateTaxId(formatted, next) ? (next==='EIN'?'Format: 12-3456789':'') : null)
                  }} /> EIN</label>
                  <label className="inline-flex items-center gap-1"><input type="radio" name="taxIdType" checked={state.taxIdType==='SSN'} onChange={()=>{
                    const next = 'SSN' as const
                    const formatted = state.taxId ? formatTaxId(state.taxId, next) : ''
                    save({ taxIdType: next, taxId: formatted })
                    setTaxIdError(formatted && !validateTaxId(formatted, next) ? (next==='SSN'?'Format: 123-45-6789':'') : null)
                  }} /> SSN</label>
                </div>
                <input
                  value={state.taxId || ''}
                  onChange={e=>{
                    const t = (state.taxIdType ?? 'EIN') as 'EIN'|'SSN'
                    const formatted = formatTaxId(e.target.value, t)
                    save({ taxId: formatted })
                    setTaxIdError(formatted && !validateTaxId(formatted, t) ? (t==='EIN'?'Format: 12-3456789':'Format: 123-45-6789') : null)
                  }}
                  className={`input w-full ${taxIdError ? 'border-red-300 focus:border-red-400' : ''}`}
                  placeholder={(state.taxIdType ?? 'EIN')==='EIN' ? '12-3456789' : '123-45-6789'}
                  
                  inputMode="numeric"
                  autoComplete="off"
                  pattern={state.taxIdType==='SSN' ? "\\d{3}-\\d{2}-\\d{4}" : "\\d{2}-\\d{7}"}
                />
                {taxIdError && <div className="text-xs text-red-600">{taxIdError}</div>}
                <p className="text-[11px] text-slate-500">Stored locally for demo purposes only.</p>
              </div>
            </div>
          </div>
        </div>
        {/* Company type (moved to right of Identity) */}
        <div id="type" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 w-full md:w-1/2">
          <Title title="Company type" />
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">Tax form
              <select value={state.taxForm || ''} onChange={e=>{ save({ taxForm: e.target.value || undefined }); try { (window as any).toast?.('Tax form saved') } catch {} }} className="input w-full" aria-label="Tax form">
                <option value="">Choose a method</option>
                <option value="1040">Sole Proprietor (Form 1040)</option>
                <option value="1065">Partnership / LLC (Form 1065)</option>
                <option value="1120S">S Corp (Form 1120S)</option>
                <option value="1120">C Corp (Form 1120)</option>
                <option value="990">Nonprofit (Form 990)</option>
                <option value="other">Not sure / Other / None</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">Industry
              <input value={state.industry || ''} onChange={e=>save({ industry: e.target.value })} className="input w-full" placeholder="e.g. Professional Services" autoComplete="organization" />
            </label>
          </div>
        </div>
      </div>

      {/* Row 2: Address (left) + Company type (right) */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Address */}
        <div id="address" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 w-full md:w-1/2">
          <Title title="Address" />
          <div className="space-y-3 text-xs">
            <div className="space-y-1"><span className="font-medium text-slate-700">Company address</span><p className="text-slate-500">Used for tax calculations and as default on forms.</p></div>
            {renderAddressForm(state.companyAddress, v=>save({ companyAddress: v }))}
            <div className="my-4 border-t border-slate-200"></div>
            <div className="space-y-1"><span className="font-medium text-slate-700">Customer-facing address</span><p className="text-slate-500">Shown on sales forms if different.</p></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={state.publicAddressSameAsCompany} onChange={e=>save({ publicAddressSameAsCompany: e.target.checked })} /> <span className="text-xs">Same as company address</span></label>
            {!state.publicAddressSameAsCompany && renderAddressForm(state.publicAddress, v=>save({ publicAddress: v }))}
            <div className="my-4 border-t border-slate-200"></div>
            <div className="space-y-1"><span className="font-medium text-slate-700">Legal address</span><p className="text-slate-500">Used when filing taxes.</p></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={state.legalAddressSameAsCompany} onChange={e=>save({ legalAddressSameAsCompany: e.target.checked })} /> <span className="text-xs">Same as company address</span></label>
            {!state.legalAddressSameAsCompany && renderAddressForm(state.legalAddress, v=>save({ legalAddress: v }))}
          </div>
        </div>
        {/* Contact info (moved under Address) */}
        <div id="contact" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 w-full md:w-1/2">
          <Title title="Contact info" />
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-600">Company email
              <input
                value={state.companyEmail || ''}
                onChange={e=>{
                  const v = e.target.value
                  save({ companyEmail: v })
                  setEmailErrors((prev)=>({ ...prev, company: !!v && !isValidEmail(v) }))
                }}
                className={`input w-full ${emailErrors.company ? 'border-red-300 focus:border-red-400' : ''}`}
                placeholder="billing@acme.com"
                autoComplete="email"
                
              />
            </label>
            {emailErrors.company && <div className="text-xs text-red-600">Invalid email format</div>}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input type="checkbox" checked={state.customerEmailSameAsCompany} onChange={e=>save({ customerEmailSameAsCompany: e.target.checked })} /> Same as company email
            </label>
            {!state.customerEmailSameAsCompany && (
              <label className="block text-xs font-medium text-slate-600">Customer-facing email
                <input
                  value={state.customerEmail || ''}
                  onChange={e=>{
                    const v = e.target.value
                    save({ customerEmail: v })
                    setEmailErrors((prev)=>({ ...prev, customer: !!v && !isValidEmail(v) }))
                  }}
                  className={`input w-full ${emailErrors.customer ? 'border-red-300 focus:border-red-400' : ''}`}
                  placeholder="support@acme.com"
                  autoComplete="email"
                  
                />
              </label>
            )}
            <label className="block text-xs font-medium text-slate-600">Company phone
              <input
                value={state.phone || ''}
                onChange={e=>save({ phone: formatPhone(e.target.value) })}
                className="input w-full"
                placeholder="(555) 555-5555"
                inputMode="tel"
                autoComplete="tel"
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">Website
              <input value={state.website || ''} onChange={e=>save({ website: e.target.value })} className="input w-full" placeholder="https://www.acme.com" autoComplete="url" />
            </label>
          </div>
        </div>
      </div>

      {/* Saved indicator */}
      {showSaved && (
        <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-[55] -translate-x-1/2">
          <div className="rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-medium shadow-lg">All changes saved</div>
        </div>
      )}
    </section>
  )
}

function renderAddressForm(addr: any, onChange: (a: any)=>void) {
  return (
    <div className="grid gap-2">
      <input value={addr.street||''} onChange={e=>onChange({ ...addr, street: e.target.value })} placeholder="Street" className="input w-full" autoComplete="address-line1" />
      <input value={addr.city||''} onChange={e=>onChange({ ...addr, city: e.target.value })} placeholder="City" className="input w-full" autoComplete="address-level2" />
      <div className="grid grid-cols-3 gap-2">
        <input value={addr.state||''} onChange={e=>onChange({ ...addr, state: e.target.value })} placeholder="State / Region" className="input col-span-2 w-full" autoComplete="address-level1" />
        <input value={addr.postal||''} onChange={e=>onChange({ ...addr, postal: e.target.value })} placeholder="ZIP / Postal code" className="input w-full" autoComplete="postal-code" inputMode="numeric" />
      </div>
      <input value={addr.country||''} onChange={e=>onChange({ ...addr, country: e.target.value })} placeholder="Country" className="input w-full" autoComplete="country-name" />
    </div>
  )
}

 
