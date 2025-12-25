"use client"

import React, { useRef, useState } from 'react'
import VerificationService from '@/services/verification.service'

export default function EmailCodeForm({ email, onSuccess, onBack, enableAutoSubmit = true, verificationService }: { email: string, onSuccess: () => void, onBack?: () => void, enableAutoSubmit?: boolean, verificationService?: any }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const svc = verificationService ?? new VerificationService()
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  async function send() {
    try {
      await svc.sendEmailCode(email)
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
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-600">We will send a 6-digit code to <strong>{email}</strong></p>
        <div className="mt-2">
          <button className="bg-white border rounded-md px-4 py-2" onClick={async () => { await send() }}>Send code</button>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Enter verification code</label>
          <div className="mt-2 flex gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                aria-label={`Verification code digit ${i + 1}`}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={d}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '').slice(-1)
                  const next = [...digits]
                  next[i] = v
                  setDigits(next)
                  if (v) {
                    if (i < 5) focusNext(i)
                    else {
                      if (next.every((c) => c !== '')) submit(undefined)
                    }
                  }
                }}
                onKeyDown={(e) => handleKey(e, i)}
                onPaste={(e) => handlePaste(e, i)}
                className="w-12 h-12 text-center rounded-md border border-slate-200"
              />
            ))}
          </div>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-3">
          <button type="button" className="border px-4 py-2 rounded-md" onClick={() => { if (onBack) onBack(); else window.history.back() }}>Back</button>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md" disabled={loading}>Verify code</button>
        </div>
      </form>
    </div>
  )
}
