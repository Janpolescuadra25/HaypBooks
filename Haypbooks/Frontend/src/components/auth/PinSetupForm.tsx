"use client"

import React, { useRef, useState } from 'react'
import VerificationService from '@/services/verification.service'

function useSixInputs() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const refs = useRef<Array<HTMLInputElement | null>>([])
  function setDigit(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return
    setDigits((d) => {
      const copy = [...d]
      copy[index] = value
      return copy
    })
  }
  function focusNext(index: number) {
    const next = refs.current[index + 1]
    if (next) next.focus()
  }
  function focusPrev(index: number) {
    const prev = refs.current[index - 1]
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
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>, startIdx = 0) {
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '')
    if (!pasted) return
    const arr = pasted.split('')
    setDigits((d) => {
      const copy = [...d]
      for (let i = 0; i < arr.length && startIdx + i < 6; i++) {
        copy[startIdx + i] = arr[i]
      }
      return copy
    })
    const finalIdx = Math.min(5, startIdx + arr.length - 1)
    const last = refs.current[finalIdx]
    if (last) last.focus()
  }
  return { digits, setDigit, refs, handlePaste, handleKey, focusNext }
}

export default function PinSetupForm({ onDone, enableAutoSubmit = true, verificationService }: { onDone: () => void, enableAutoSubmit?: boolean, verificationService?: any }) { 
  const create = useSixInputs()
  const confirm = useSixInputs()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const svc = verificationService ?? new VerificationService()

  async function submit(e?: React.FormEvent, pinArg?: string) {
    if (e) e.preventDefault()
    setError(null)
    let pin = ''
    if (pinArg) {
      pin = pinArg
      // compute create pin from current input DOM (to avoid stale state)
      const createPin = create.refs.current.map((el) => el?.value || '').join('')
      if (pin.length !== 6 || !/^[0-9]{6}$/.test(pin)) return setError('PIN must be 6 digits')
      if (pin !== createPin) return setError('PINs do not match')
    } else {
      pin = create.digits.join('')
      const pinConfirm = confirm.digits.join('')
      if (pin.length !== 6 || !/^[0-9]{6}$/.test(pin)) return setError('PIN must be 6 digits')
      if (pin !== pinConfirm) return setError('PINs do not match')
    }
    setLoading(true)
    try {
      await svc.setupPin(pin)
      onDone()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to set PIN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Create a 6-digit PIN</label>
        <div className="mt-2 flex gap-2">
          {create.digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (create.refs.current[i] = el)}
              aria-label={`Create PIN digit ${i + 1}`}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, '').slice(-1)
                const next = [...create.digits]
                next[i] = v
                create.setDigit(i, v)
                if (v) {
                  if (i < 5) create.focusNext(i)
                }
              }}
              onKeyDown={(e) => create.handleKey?.(e, i)}
              onPaste={(e) => create.handlePaste(e, i)}
              className="w-12 h-12 text-center rounded-md border border-slate-200"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Confirm PIN</label>
        <div className="mt-2 flex gap-2">
          {confirm.digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (confirm.refs.current[i] = el)}
              aria-label={`Confirm PIN digit ${i + 1}`}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, '').slice(-1)
                const next = [...confirm.digits]
                next[i] = v
                confirm.setDigit(i, v)
                if (v) {
                  if (i < 5) confirm.focusNext(i)
                  else {
                    // if confirm completed and matches create, auto submit
                    const createPin = create.refs.current.map((el) => el?.value || '').join('')
                    const confirmPin = next.join('')
                    if (createPin.length === 6 && confirmPin.length === 6 && createPin === confirmPin && enableAutoSubmit) {
                      // pass the pin directly to avoid reading stale state
                      submit(undefined, confirmPin)
                    }
                  }
                }
              }}
              onKeyDown={(e) => confirm.handleKey?.(e, i)}
              onPaste={(e) => confirm.handlePaste(e, i)}
              className="w-12 h-12 text-center rounded-md border border-slate-200"
            />
          ))}
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}
      <div className="flex gap-3">
        <button type="button" className="border px-4 py-2 rounded-md" onClick={() => { if (typeof (window as any) !== 'undefined') window.history.back() }}>Back</button>
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md" disabled={loading}>Set PIN</button>
        <button type="button" className="border px-4 py-2 rounded-md" onClick={() => { setError(null); for (let i = 0; i < 6; i++) { create.setDigit(i, ''); confirm.setDigit(i, '') } }}>Reset</button>
      </div>
    </form>
  )
}
