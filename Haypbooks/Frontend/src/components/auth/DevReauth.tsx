"use client"

import React, { useState } from 'react'

export default function DevReauth({ email: initialEmail, onSuccess, backend = 'http://127.0.0.1:4000' }: { email?: string, onSuccess: () => void, backend?: string }) {
  const [email, setEmail] = useState(initialEmail || '')
  const [password, setPassword] = useState('Password!23')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function doLogin() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${backend}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        setError(`Login failed: ${res.status} ${txt}`)
        return
      }
      onSuccess()
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 p-3 border rounded bg-white">
      <div className="text-sm text-slate-700 mb-2">Dev re-authentication required to continue. Enter credentials and click <strong>Sign in & Retry</strong>.</div>
      <div className="flex gap-2 mb-2">
        <input className="border p-2 flex-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input className="border p-2 w-44" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 border" onClick={doLogin} disabled={loading}>{loading ? 'Signing in…' : 'Sign in & Retry'}</button>
        <button className="px-3 py-1 border" onClick={() => { setError(null); setEmail(''); setPassword('') }} disabled={loading}>Clear</button>
      </div>
      {error ? <div className="text-sm text-red-600 mt-2">{error}</div> : null}
    </div>
  )
}
