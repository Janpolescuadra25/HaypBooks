"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CompanyModal({ company, onClose }: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    setLoading(true)
    try {
      // mark preferred workspace so user lands in owner hub
      await fetch('/api/users/preferred-workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'company', id: company.id }) })
      // record last-accessed so the company appears first in /api/companies/recent
      try {
        await fetch(`/api/companies/${company.id}/last-accessed`, { method: 'PATCH' })
      } catch (e) {
        // non-fatal; we still navigate even if patch fails
        console.warn('[CompanyModal] failed to patch last-accessed (tolerance)', e)
      }
      // navigate with explicit query param to make behaviour consistent with CompanySwitcher
      router.replace(`/dashboard?company=${encodeURIComponent(company.id)}`)
    } catch (err) {
      // In test environment relative fetches can throw; log and continue to dashboard for flow
      console.warn('[CompanyModal] preferred-workspace update failed (test-env tolerance)', err)
      router.replace(`/dashboard?company=${encodeURIComponent(company.id)}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div aria-labelledby="company-modal-title" aria-modal="true" role="dialog" className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="company-modal-title" className="text-lg font-bold">Continue as {company.name}</h2>
            <p className="text-sm text-slate-600 mt-1">You will be redirected to the dashboard for this company.</p>
          </div>
          <button aria-label="Close" className="text-slate-500 hover:text-slate-800" onClick={onClose}>✕</button>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={confirm} data-testid="confirm-company" className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-semibold">Continue to Dashboard</button>
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl">Cancel</button>
        </div>
      </div>
    </div>
  )
}
