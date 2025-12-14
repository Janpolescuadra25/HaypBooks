'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Profile = { id: string; name: string; email: string; company: { id: string; name: string; currency: string } }

export function ProfileCard() {
  const [data, setData] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    api<Profile>('/api/user/profile')
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])
  return (
    <div className="glass-card">
      <h2 className="text-lg font-semibold mb-2">Profile</h2>
  {error && <p className="text-red-600">{error}</p>}
      {data ? (
        <div className="text-slate-900 space-y-1">
          <p>{data.name}</p>
          <p className="text-slate-600 text-sm">{data.email}</p>
          <p className="text-slate-600 text-sm">{data.company.name} · {data.company.currency}</p>
        </div>
      ) : (
        <p className="text-slate-600">Loading…</p>
      )}
    </div>
  )
}
