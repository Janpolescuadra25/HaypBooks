"use client"

import React from 'react'

// PIN Setup removed — keep a small stub to avoid import errors and to communicate removal to devs
export default function PinSetupForm({ onDone }: { onDone?: (res?: any) => void }) {
  return (
    <div className="p-4 border rounded-md bg-yellow-50">
      <strong>PIN feature removed</strong>
      <p className="mt-2">The PIN-based setup flow has been removed. Use email verification instead.</p>
      <div className="mt-3">
        {onDone && <button className="px-3 py-2 bg-emerald-600 text-white" onClick={() => onDone({ success: true })}>Continue</button>}
      </div>
    </div>
  )
}
