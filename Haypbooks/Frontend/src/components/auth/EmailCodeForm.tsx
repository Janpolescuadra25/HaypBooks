"use client"

import React, { useRef, useState } from 'react'
import VerificationService from '@/services/verification.service'

function maskEmail(email?: string | null) {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!domain) return email
  if (local.length <= 2) return '*'.repeat(local.length) + '@' + domain
  const head = local[0]
  const tail = local[local.length - 1]
  return `${head}${'*'.repeat(Math.max(0, local.length - 2))}${tail}@${domain}`
}

export default function EmailCodeForm({ email, onSuccess, onBack, enableAutoSubmit = false, verificationService }: { email: string, onSuccess: () => void, onBack?: () => void, enableAutoSubmit?: boolean, verificationService?: any }) {
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
      await svc.sendEmailCode(email)
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
      await svc.verifyEmailCode(email, code)
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

  return (
    <div className="w-full">
      <p className="lead text-center mb-4"><strong>Enter the 6‑digit code we sent to</strong><br /><span className="email"><strong>{maskEmail(email)}</strong></span></p>

      <form onSubmit={submit} aria-label="Verification code form" className="max-w-xs mx-auto">
        <label htmlFor="otp-1" className="sr-only">Verification code</label>
        <div className="otp-group grid gap-1 sm:gap-2 md:gap-3" role="group" aria-describedby="otp-hint" style={{ gridTemplateColumns: `repeat(6, minmax(0, 1fr))` }}>
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
              ref={(el) => { inputsRef.current[i] = el }}
              aria-label={`Verification code digit ${i + 1}`}
              value={d}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, '').slice(-1)
                const next = [...digits]
                next[i] = v
                setDigits(next)
                if (v && i < length - 1) focusNext(i + 1)
              }}
              onKeyDown={(e) => handleKey(e, i)}
              onPaste={(e) => handlePaste(e, i)}
              className="w-full h-11 sm:h-11 md:h-14 text-center rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg md:text-xl font-semibold transition-transform bg-white"
            />
          ))}
        </div>

        <p id="otp-hint" className="sr-only">Enter the 6-digit code sent to your email address</p>

        {error && <div className="text-red-600 mt-3" role="alert">{error}</div>}

        <div className="actions mt-6">
          <button type="button" className="secondary" onClick={() => { if (onBack) onBack(); else window.history.back() }}>Change method</button>
          <button type="submit" className="primary" disabled={loading}>Verify code</button>
        </div>
      </form>

      <div className="resend mt-4 text-center text-sm">
        Didn’t receive the code? <button type="button" onClick={async () => { await send() }} className="text-emerald-600 hover:underline">Resend</button>
      </div>
      {info && <div className="text-slate-600 mt-2 text-center" role="status" aria-live="polite">{info}</div>} 
    </div>
  )
}
