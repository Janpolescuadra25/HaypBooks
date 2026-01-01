"use client"

import React, { useState } from 'react'
import { normalizePhoneOrThrow, maskPhoneForDisplay } from '@/utils/phone.util'
import VerificationService from '@/services/verification.service'

export default function AddPhoneForm({ onSaved }: { onSaved: (phone: string) => void }) {
  const [phone, setPhone] = useState('')
  const [phoneCountry, setPhoneCountry] = useState('PH')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const svc = new VerificationService()

  async function handleSaveAndSend() {
    setError(null)
    try {
      setLoading(true)
      const normalized = normalizePhoneOrThrow(phone, phoneCountry)
      // Persist phone on server for current user
      const res = await fetch('/api/users/phone', { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone: normalized }) })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || 'Failed to save phone')
      }
      // Send verification code to the newly saved phone
      await svc.sendPhoneCode(normalized)
      onSaved(normalized)
    } catch (err: any) {
      setError(err?.message || 'Failed to save phone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-emerald-50/20">
      <label className="block text-sm font-medium text-slate-700 mb-2">Phone number</label>
      <div className="flex gap-2">
        <select value={phoneCountry} onChange={(e) => setPhoneCountry(e.target.value)} className="w-20 px-2 pr-6 py-2 border border-slate-700 rounded-md bg-white text-sm text-slate-900 text-left" title="+63 Philippines">
          <option value="PH">+63 Philippines</option>
          <option value="US">+1 United States</option>
          <option value="GB">+44 United Kingdom</option>
          <option value="AU">+61 Australia</option>
          <option value="IN">+91 India</option>
          <option value="SG">+65 Singapore</option>
        </select>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0916 123 4567 or +63 916 123 4567" className="flex-1 min-w-0 px-3 py-2 border border-slate-700 rounded-md placeholder-slate-400 text-sm text-slate-900" />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-md" onClick={async () => await handleSaveAndSend()} disabled={loading}>{loading ? 'Saving...' : 'Save & Send'}</button>
      </div>
      {error ? <div className="text-red-600 mt-2">{error}</div> : null}
      <div className="text-xs text-gray-500 mt-2">We'll send a 6-digit code to this number to verify it.</div>
    </div>
  )
}
