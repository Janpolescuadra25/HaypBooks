"use client"
import React, { useRef, useState, useEffect } from 'react'

type Props = {
  length?: number
  value?: string
  onChange?: (val: string) => void
  ariaLabel?: string
}

export default function OtpInput({ length = 6, value = '', onChange, ariaLabel }: Props) {
  const [vals, setVals] = useState<string[]>(() => Array(length).fill(''))
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (value) {
      const chars = value.split('').slice(0, length)
      const next = Array(length).fill('')
      for (let i = 0; i < chars.length; i++) next[i] = chars[i]
      setVals(next)
    }
  }, [value, length])

  useEffect(() => {
    onChange && onChange(vals.join(''))
  }, [vals, onChange])

  function focusIndex(i: number) {
    const el = inputsRef.current[i]
    if (el) el.focus()
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\s+/g, '')
    const chars = pasted.split('').slice(0, length)
    if (!chars.length) return
    const next = Array(length).fill('')
    for (let i = 0; i < chars.length; i++) next[i] = chars[i]
    setVals(next)
  }

  function handleChange(idx: number, ch: string) {
    if (!ch) {
      setVals(prev => {
        const copy = [...prev]
        copy[idx] = ''
        return copy
      })
      return
    }
    const c = ch.replace(/[^0-9a-zA-Z]/g, '')[0]
    if (!c) return
    setVals(prev => {
      const copy = [...prev]
      copy[idx] = c
      return copy
    })
    // focus next
    if (idx + 1 < length) focusIndex(idx + 1)
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (vals[idx]) {
        setVals(prev => {
          const copy = [...prev]
          copy[idx] = ''
          return copy
        })
      } else if (idx > 0) {
        focusIndex(idx - 1)
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) focusIndex(idx - 1)
    else if (e.key === 'ArrowRight' && idx + 1 < length) focusIndex(idx + 1)
  }

  return (
    <div role="group" aria-label={ariaLabel || 'OTP input'} className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el }}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={vals[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold transition-all bg-white/50 hover:bg-white hover:border-emerald-300"
          aria-label={`Digit ${i + 1}`}
        />
      ))}

      <style>{`
        input:focus {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}
