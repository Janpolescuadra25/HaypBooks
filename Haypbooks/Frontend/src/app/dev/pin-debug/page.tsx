"use client"

import React, { useState } from 'react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('Password!23')
  const [pin, setPin] = useState('123456')
  const [logs, setLogs] = useState<string[]>([])

  function log(msg: string) {
    setLogs((l) => [msg, ...l].slice(0, 200))
    // eslint-disable-next-line no-console
    console.log('[pin-debug]', msg)
  }

  async function apiPost(path: string, body: any) {
    log(`POST ${path} ${JSON.stringify(body)}`)
    try {
      const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' })
      const text = await res.text().catch(() => '')
      let parsed: any = text
      try { parsed = JSON.parse(text) } catch (e) {}
      log(`=> ${res.status} ${JSON.stringify(parsed)}`)
      return { status: res.status, body: parsed, ok: res.ok }
    } catch (e: any) {
      log(`=> ERR ${e?.message || e}`)
      return { status: 0, body: null, ok: false }
    }
  }

  async function handleSignup() {
    if (!email) return log('Set email first')
    const r = await apiPost('/api/auth/signup', { email, password, name: 'Debug User' })
    if (r.ok) log('Signup completed; server set cookies (if any)')
  }

  async function handleLogin() {
    if (!email) return log('Set email first')
    const r = await apiPost('/api/auth/login', { email, password })
    if (r.ok) log('Login completed')
  }

  async function handleSetupPin() {
    log('PIN feature has been removed from the application')
  }

  async function handleVerifyPin() {
    log('PIN feature has been removed from the application')
  }

  async function handleMe() {
    try {
      const res = await fetch('/api/users/me', { credentials: 'include' })
      const json = await res.json().catch(() => null)
      log(`/api/users/me => ${res.status} ${JSON.stringify(json)}`)
    } catch (e: any) {
      log(`me err ${e?.message || e}`)
    }
  }

  async function handleLogout() {
    await apiPost('/api/auth/logout', {})
    log('logged out (cookies should be cleared)')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Dev Pin Debug</h2>
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm">Email</label>
          <input className="border p-2 w-full" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dev.test" />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input className="border p-2 w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">PIN (6 digits)</label>
          <input className="border p-2 w-32" value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} maxLength={6} />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border" onClick={handleSignup}>Signup (sets cookies)</button>
          <button className="px-3 py-2 border" onClick={handleLogin}>Login (sets cookies)</button>
          <button className="px-3 py-2 border" onClick={handleMe}>/api/users/me</button>
          <button className="px-3 py-2 border" onClick={handleSetupPin} disabled>Set PIN (removed)</button>
          <button className="px-3 py-2 border" onClick={handleVerifyPin} disabled>Verify PIN (removed)</button>
          <button className="px-3 py-2 border" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded h-64 overflow-auto">
        <h4 className="font-semibold">Logs</h4>
        <ul className="text-sm">
          {logs.map((l, i) => <li key={i} className="mb-1">{l}</li>)}
        </ul>
      </div>
    </div>
  )
}
