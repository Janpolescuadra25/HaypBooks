"use client"
import { useEffect, useState } from 'react'

export default function BusinessStepComponent({ initial, onSave }:{ initial?: any, onSave:(d:any)=>void }) {
  const [form, setForm] = useState<any>({ companyName: '', businessType: '', industry: '', address: '', phone: '', businessEmail: '' })
  useEffect(() => { if (initial) setForm({ ...form, ...initial }) }, [])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input value={form.companyName} onChange={(e)=>setForm({...form, companyName: e.target.value})} className="p-2 border rounded" placeholder="Company name" />
        <select aria-label="Business type" value={form.businessType} onChange={(e)=>setForm({...form, businessType: e.target.value})} className="p-2 border rounded">
          <option value="">Business type</option>
          <option>Sole Proprietor</option>
          <option>Corporation</option>
          <option>Partnership</option>
          <option>Non-profit</option>
          <option>Other</option>
        </select>
        <input value={form.industry} onChange={(e)=>setForm({...form, industry: e.target.value})} className="p-2 border rounded" placeholder="Industry" />
        <input value={form.businessEmail} onChange={(e)=>setForm({...form, businessEmail: e.target.value})} className="p-2 border rounded" placeholder="Business email" />
        <input value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} className="p-2 border rounded col-span-2" placeholder="Business address" />
        <input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} className="p-2 border rounded" placeholder="Phone number (optional)" />
      </div>
      <div className="flex justify-end">
        <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => onSave(form)}>Save step</button>
      </div>
    </div>
  )
}
