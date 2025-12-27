"use client"

import React, { useState } from 'react'

export default function DevPinDebugPage() {
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
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Dev Pin Debug (pages)</h2>
      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 12 }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dev.test" style={{ padding: 8, width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 12 }}>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" style={{ padding: 8, width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 12 }}>PIN (6 digits)</label>
          <input value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} maxLength={6} style={{ padding: 8, width: 120 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSignup}>Signup</button>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleMe}>/api/users/me</button>
          <button onClick={handleSetupPin} disabled>Set PIN (removed)</button>
          <button onClick={handleVerifyPin} disabled>Verify PIN (removed)</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, height: 300, overflow: 'auto' }}>
        <h4 style={{ marginTop: 0 }}>Logs</h4>
        <ul style={{ fontSize: 12 }}>
          {logs.map((l, i) => <li key={i} style={{ marginBottom: 6 }}>{l}</li>)}
        </ul>
      </div>
    </div>
  )
}
