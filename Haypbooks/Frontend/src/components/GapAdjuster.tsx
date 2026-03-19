"use client"

import React, { useEffect, useState } from 'react'

export default function GapAdjuster() {
  const [open, setOpen] = useState(false)
  const [gapPx, setGapPx] = useState<number>(8)

  useEffect(() => {
    // prefer persisted value
    try {
      const persisted = localStorage.getItem('hb-topbar-gap')
      if (persisted) {
        setGapPx(parseInt(persisted, 10) || 8)
        return
      }
    } catch (e) {
      // ignore
    }

    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--hb-topbar-gap').trim()
      if (v.endsWith('px')) {
        setGapPx(parseInt(v.replace('px', ''), 10) || 8)
      } else if (v.endsWith('rem')) {
        const rem = parseFloat(v.replace('rem', '')) || 0.5
        const font = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        setGapPx(Math.round(rem * font))
      } else {
        // fallback assume number in px
        const num = parseInt(v, 10)
        if (!isNaN(num)) setGapPx(num)
      }
    } catch (err) {
      setGapPx(8)
    }
  }, [])

  useEffect(() => {
    // apply in px and persist
    document.documentElement.style.setProperty('--hb-topbar-gap', `${gapPx}px`)
    try { localStorage.setItem('hb-topbar-gap', String(gapPx)) } catch (e) {}
  }, [gapPx])

  return (
    <div className="relative">
      <button
        aria-label="Gap"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
      >
        Gap
        <span className="text-xs text-slate-500">{gapPx}px</span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-lg shadow-md p-3 z-50">
          <label className="text-xs text-slate-500">Topbar gap (px)</label>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="range"
              min={0}
              max={32}
              value={gapPx}
              onChange={(e) => setGapPx(parseInt(e.target.value, 10))}
              className="flex-1"
            />
            <input
              type="number"
              min={0}
              max={64}
              value={gapPx}
              onChange={(e) => setGapPx(Number(e.target.value || 0))}
              className="w-16 px-2 py-1 rounded border border-slate-100 text-sm"
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                setGapPx(8)
                setOpen(false)
              }}
              className="px-3 py-1 rounded bg-slate-50 border border-slate-100 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
