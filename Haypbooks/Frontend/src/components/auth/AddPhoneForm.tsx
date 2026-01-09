"use client"

import React, { useState } from 'react'
import { normalizePhoneOrThrow, maskPhoneForDisplay } from '@/utils/phone.util'
import VerificationService from '@/services/verification.service'

export default function AddPhoneForm({ onSaved, onCancel }: { onSaved: (phone: string) => void, onCancel?: () => void }) {
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

      <div className="flex gap-0 items-stretch">
        <select aria-label="Country" value={phoneCountry} onChange={(e) => setPhoneCountry(e.target.value)} className="w-28 px-2 pr-6 py-2 border border-slate-300 rounded-md bg-white text-sm text-slate-900 text-left" title={phoneCountry === 'PH' ? '+63 Philippines' : phoneCountry === 'US' ? '+1 United States' : phoneCountry === 'GB' ? '+44 United Kingdom' : phoneCountry === 'AU' ? '+61 Australia' : phoneCountry === 'IN' ? '+91 India' : '+65 Singapore'}>
          <option value="PH" title="+63 Philippines">+63</option>
          <option value="US" title="+1 United States">+1</option>
          <option value="GB" title="+44 United Kingdom">+44</option>
          <option value="AU" title="+61 Australia">+61</option>
          <option value="IN" title="+91 India">+91</option>
          <option value="SG" title="+65 Singapore">+65</option>
        </select>

        <input aria-label="Phone number input" inputMode="tel" autoComplete="tel" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0916 123 4567" className="flex-1 min-w-0 h-10 px-3 py-2 border border-slate-700 rounded-r-lg placeholder-slate-400 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      {error ? <div className="text-red-600 mt-2">{error}</div> : null}

      <div className="mt-3 flex flex-col gap-2">
        <button data-testid="add-phone-other" type="button" onClick={() => { if (onCancel) onCancel() }} className="w-full text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2 text-sm hover:bg-slate-50">Use another verification method</button>

        <button data-testid="add-phone-save" onClick={async () => await handleSaveAndSend()} disabled={loading} className="w-full inline-flex justify-center items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60">{loading ? 'Saving…' : 'Save & Send'}</button>

        <div className="text-xs text-gray-500 mt-1">We'll send a 6-digit code to this number to verify it.</div>
      </div>
    </div>
  )
}
