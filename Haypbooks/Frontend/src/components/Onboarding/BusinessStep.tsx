"use client"
import { useEffect, useState } from 'react'

export default function BusinessStepComponent({ initial, onSave }:{ initial?: any, onSave:(d:any)=>void }) {
  const [form, setForm] = useState<any>({ companyName: '', businessType: '', industry: '', address: '', phone: '', businessEmail: '' })
  useEffect(() => { if (initial) setForm({ ...form, ...initial }) }, [])

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Business Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Company name</label>
          <input value={form.companyName} onChange={(e)=>setForm({...form, companyName: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="ACME Corporation" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business type</label>
          <select aria-label="Business type" value={form.businessType} onChange={(e)=>setForm({...form, businessType: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
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
          <input value={form.industry} onChange={(e)=>setForm({...form, industry: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="Technology, Retail, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business email</label>
          <input value={form.businessEmail} onChange={(e)=>setForm({...form, businessEmail: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="contact@company.com" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Business address</label>
          <input value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="123 Main Street, City, Country" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Phone number (optional)</label>
          <input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white" placeholder="+1 (555) 123-4567" />
        </div>
      </div>
      <div className="flex justify-end">
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" onClick={() => onSave(form)}>
          Save step
        </button>
      </div>
    </div>
  )
}
