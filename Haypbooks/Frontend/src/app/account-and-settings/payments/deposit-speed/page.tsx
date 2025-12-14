"use client"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DepositSpeedSetupPage() {
  const router = useRouter()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(()=>{
    try { const raw = localStorage.getItem('hb.payments'); if (raw) { const obj = JSON.parse(raw); setEnabled(!!obj.sameDayEnabled) } } catch {}
  }, [])

  function toggle() {
    setLoading(true)
    setTimeout(()=>{
      try {
        const raw = localStorage.getItem('hb.payments')
        const base = raw ? JSON.parse(raw) : {}
        const next = { ...base, sameDayEnabled: !enabled }
        localStorage.setItem('hb.payments', JSON.stringify(next))
        setEnabled(!enabled)
      } catch {}
      setLoading(false)
    }, 600)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Same‑day deposit speed</h1>
        <button onClick={()=>router.back()} className="text-sm px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50">Back</button>
      </div>
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-sm">
        <p className="text-slate-600">Enable accelerated payout review for eligible card transactions so funds arrive the same business day. Requirements include stable processing history and low dispute ratios.</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>No extra cost when deposits go to Haypbooks Checking.</li>
          <li>Applies to card transactions processed before daily cutoff (5 PM local time).</li>
          <li>Bank transfers still follow standard 1–5 business day timeline.</li>
          <li>We monitor risk signals continuously and may pause the feature if needed.</li>
        </ul>
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="font-medium text-slate-800">Status: {enabled ? 'Enabled' : 'Disabled'}</div>
            <div className="text-xs text-slate-600">{enabled ? 'Same‑day speed is active for eligible card payouts.' : 'Turn this on to accelerate eligible card payouts.'}</div>
          </div>
          <button onClick={toggle} disabled={loading} className={"rounded-full px-4 py-2 text-sm font-medium shadow " + (enabled ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50')}>{loading ? 'Saving…' : enabled ? 'Disable' : 'Enable'}</button>
        </div>
        <div className="text-xs text-slate-500">Cutoff times, availability, and eligibility factors may change. This feature is provided as-is and may be discontinued.</div>
      </div>
    </div>
  )
}