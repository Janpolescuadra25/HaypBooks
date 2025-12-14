"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BusinessStepComponent from '@/components/Onboarding/BusinessStep'
import apiClient from '@/lib/api-client'

export default function QuickBusinessOnboarding() {
  const [loading, setLoading] = useState(false)
  const [initial, setInitial] = useState<any>(null)
  const router = useRouter()
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
  const API_BASE = USE_MOCK ? '' : (process.env.NEXT_PUBLIC_API_BASE || '')

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK) {
          const r = await fetch('/api/onboarding/save')
          if (!r.ok) return
          const json = await r.json()
          setInitial(json.business || null)
        } else {
          const r = await apiClient.get('/api/onboarding/save')
          setInitial(r.data?.steps?.business || null)
        }
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  async function handleSave(d: any) {
    setLoading(true)
    try {
      if (USE_MOCK) {
        const r = await fetch('/api/onboarding/save', { method: 'POST', body: JSON.stringify({ step: 'business', data: d }), headers: { 'Content-Type': 'application/json' } })
        if (!r.ok) throw new Error('save failed')
      } else {
        const r = await apiClient.post('/api/onboarding/save', { step: 'business', data: d })
        if (!(r.status >= 200 && r.status < 300)) throw new Error('save failed')
      }
      alert('Business details saved')
    } catch (err) {
      console.error(err)
      alert('Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDone() {
    setLoading(true)
    try {
      // best-effort: we could attempt to save here if needed
      if (USE_MOCK) {
        const r = await fetch('/api/onboarding/complete', { method: 'POST', body: JSON.stringify({ type: 'quick' }), headers: { 'Content-Type': 'application/json' } })
        if (!r.ok) throw new Error('complete failed')
      } else {
        const r = await apiClient.post('/api/onboarding/complete', { type: 'quick' })
        if (!(r.status >= 200 && r.status < 300)) throw new Error('complete failed')
      }
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-1">Quick onboarding — Business</h1>
        <p className="text-sm text-slate-600 mb-6">A focused one-step onboarding path for quickly setting your company details.</p>

        <BusinessStepComponent initial={initial} onSave={handleSave} />

        <div className="mt-4 flex justify-between">
          <a className="text-sm text-slate-500 hover:underline" href="/onboarding">Full onboarding</a>
          <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={handleDone} disabled={loading}>{loading ? 'Saving…' : 'Done (Go to Dashboard)'}</button>
        </div>
      </div>
    </div>
  )
}
