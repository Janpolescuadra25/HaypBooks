"use client"
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'

const BusinessStepComponent = forwardRef(function BusinessStepComponent({ initial, onSave }:{ initial?: any, onSave?: (d:any)=>void }, ref) {
  const [form, setForm] = useState<any>({ businessName: '', legalBusinessName: '', companyName: '', businessType: '', industry: '', startDate: '', country: '', address: '' })
  const [errors, setErrors] = useState<{ businessName?: string }>({})
  useEffect(() => { if (initial) setForm({ ...form, ...initial }) }, [])

  function validate() {
    const errs: any = {}
    // Business name required for setup
    if (!form.businessName || !String(form.businessName).trim()) errs.businessName = 'Business name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  useImperativeHandle(ref, () => ({
    getData: () => ({ 
      ...form,
      // Map businessName to companyName for backend compatibility
      companyName: form.businessName || form.companyName || ''
    }),
    validate: () => validate(),
    hasRequiredData: () => {
      return !!(form.businessName && String(form.businessName).trim())
    }
  }))

  // onSave is still supported for backward compatibility (tests or other callers)
  function handleSave() {
    if (!validate()) return
    if (typeof onSave === 'function') onSave(form)
  }

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-4 rounded-2xl border border-emerald-100">
      <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span>Basic Information</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business name <span className="text-emerald-600">*</span></label>
          <input value={form.businessName} onChange={(e)=>{ setForm({...form, businessName: e.target.value}); setErrors({...errors, businessName: undefined}) }} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-sm ${errors.businessName ? 'border-red-500' : 'border-slate-300'}`} placeholder="e.g. Acme Innovations" />
          {errors.businessName ? <p className="mt-2 text-xs text-red-600">{errors.businessName}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Legal business name</label>
          <input value={form.legalBusinessName} onChange={(e)=>setForm({...form, legalBusinessName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-sm" placeholder="Official Registered Name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business type</label>
          <select aria-label="Business type" value={form.businessType} onChange={(e)=>setForm({...form, businessType: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-sm">
            <option value="">Select type</option>
            <option>Sole Proprietor</option>
            <option>Corporation</option>
            <option>Partnership</option>
            <option>Non-profit</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
          <input value={form.industry} onChange={(e)=>setForm({...form, industry: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-sm" placeholder="e.g. Technology, Retail, Manufacturing" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
          <select aria-label="Country" value={form.country} onChange={(e)=>setForm({...form, country: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-sm">
            <option value="">Select country</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Philippines</option>
            <option>Canada</option>
            <option>Australia</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Business address</label>
          <input value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-sm" placeholder="Address lines, City, State/Province, Postal Code" />
        </div>



      </div>
    </div>
  )
})

export default BusinessStepComponent
