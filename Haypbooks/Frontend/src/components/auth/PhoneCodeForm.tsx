"use client"

import React, { useRef, useState } from 'react'
import VerificationService from '@/services/verification.service'

export default function PhoneCodeForm({ phone, onSuccess, onBack, enableAutoSubmit = false, verificationService }: { phone: string, onSuccess: () => void, onBack?: () => void, enableAutoSubmit?: boolean, verificationService?: any }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const svc = verificationService ?? new VerificationService()
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [info, setInfo] = useState<string | null>(null)

  React.useEffect(() => {
    const first = inputsRef.current[0]
    if (first) first.focus()
  }, [])

  async function send() {
    try {
      await svc.sendPhoneCode(phone)
      setError(null)
      setInfo('Code resent')
      return true
    } catch (err) {
      setError('Failed to send code')
      return false
    }
  }

  function setDigit(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return
    setDigits((d) => {
      const copy = [...d]
      copy[index] = value
      return copy
    })
  }

  function focusNext(index: number) {
    const next = inputsRef.current[index + 1]
    if (next) next.focus()
  }
  function focusPrev(index: number) {
    const prev = inputsRef.current[index - 1]
    if (prev) prev.focus()
  }
  function handleKey(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    const el = e.currentTarget
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[idx]) {
        setDigit(idx, '')
        if (idx > 0) focusPrev(idx)
      } else {
        if (idx > 0) {
          setDigit(idx - 1, '')
          focusPrev(idx)
        }
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault(); focusPrev(idx)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault(); focusNext(idx)
    }
  }

  async function doVerifyCode(code: string) {
    setLoading(true)
    setError(null)
    try {
      await svc.verifyPhoneCode(phone, code)
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>, startIdx = 0) {
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '')
    if (!pasted) return
    const arr = pasted.split('')
    const copy = [...digits]
    for (let i = 0; i < arr.length && startIdx + i < 6; i++) {
      copy[startIdx + i] = arr[i]
    }
    setDigits(copy)
    const finalIdx = Math.min(5, startIdx + arr.length - 1)
    const last = inputsRef.current[finalIdx]
    if (last) last.focus()
    if (copy.every((c) => c !== '') && enableAutoSubmit) {
      doVerifyCode(copy.join(''))
    }
  }

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const code = digits.join('')
    await doVerifyCode(code)
  }

  const { maskPhoneForDisplay } = (require('@/utils/phone.util') as any)
  const masked = maskPhoneForDisplay(phone)

  return (
    <main role="main">
      <style>{`
        :root{--brand:#0a9b63;--bg:#eef7f3;--text:#0f172a;--muted:#64748b;--border:#d1d5db;--radius:16px}
        .vh-card{width:100%;max-width:420px;background:#fff;padding:2.5rem;border-radius:var(--radius);box-shadow:0 20px 40px rgba(0,0,0,0.08);color:var(--text)}
        .logo{width:56px;height:56px;border-radius:16px;background:var(--brand);color:#fff;display:grid;place-items:center;font-size:1.25rem;font-weight:700;margin:0 auto 1rem}
        h1{font-size:1.5rem;margin:0 0 .5rem;text-align:center}
        p.lead{margin:0 0 1.25rem;color:var(--muted);line-height:1.5;text-align:center}
        .email{font-weight:500;color:var(--text);word-break:break-all;display:block;margin-top:.25rem}
        .otp-group{display:flex;justify-content:center;gap:.5rem;margin-bottom:1.25rem}
        .otp-group input{width:48px;height:56px;text-align:center;font-size:1.25rem;border-radius:12px;border:1px solid var(--border)}
        .otp-group input:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px rgba(10,155,99,0.2)}
        .actions{display:flex;gap:.75rem}
        .secondary{flex:1;padding:.75rem 1rem;border-radius:12px;background:#f1f5f9;color:var(--text);border:none;font-weight:600;cursor:pointer}
        .primary{flex:1;padding:.75rem 1rem;border-radius:12px;background:var(--brand);color:#fff;border:none;font-weight:600;cursor:pointer}
        .resend{margin-top:1.25rem;text-align:center;font-size:.875rem}
        .resend button{background:none;border:none;color:var(--brand);font-weight:600;cursor:pointer;padding:0}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      `}</style>

      <div className="vh-card" aria-live="polite">
        <p className="lead"><strong>Enter the 6‑digit code we sent to</strong><br /><span className="email"><strong>{masked || phone}</strong></span></p>

        <form onSubmit={submit} aria-label="Verification code form">
          <label htmlFor="otp-1" className="sr-only">Verification code</label>
          <div className="otp-group" role="group" aria-describedby="otp-hint">
            {digits.map((d, i) => (
              <input
                key={i}
                id={i === 0 ? 'otp-1' : undefined}
                name={`otp[${i}]`}
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                autoComplete={i === 0 ? 'one-time-code' : undefined}
                required
                ref={(el) => { inputsRef.current[i] = el; /* return void for typing */ }}
                aria-label={`Verification code digit ${i + 1}`}
                value={d}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '').slice(-1)
                  const next = [...digits]
                  next[i] = v
                  setDigits(next)
                  if (v) {
                    if (i < 5) focusNext(i)
                    else {
                      if (next.every((c) => c !== '') && enableAutoSubmit) submit(undefined)
                    }
                  }
                }}
                onKeyDown={(e) => handleKey(e, i)}
                onPaste={(e) => handlePaste(e, i)}
              />
            ))}
          </div>

          <p id="otp-hint" className="sr-only">Enter the 6-digit code sent to your phone number</p>

          {error && <div className="text-red-600" role="alert">{error}</div>}

          <div className="actions">
            <button type="button" className="secondary" onClick={() => { if (onBack) onBack(); else window.history.back() }}>Change method</button>
            <button type="submit" className="primary" disabled={loading}>Verify code</button>
          </div>
        </form>

        <div className="resend">
          Didn’t receive the code? <button type="button" onClick={async () => { await send() }}>Resend</button>
        </div>
        {info && <div className="text-slate-600 mt-2" role="status" aria-live="polite">{info}</div>} 
      </div>
    </main>
  )
}
