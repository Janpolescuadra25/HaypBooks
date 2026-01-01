"use client"

import React from 'react'

// PIN feature removed. This component is kept as a harmless stub to avoid import-time errors
// and to make it explicit that the feature has been removed.
export default function PinEntryForm({ onSuccess, onBack, verificationService, enableAutoSubmit }: { onSuccess?: () => void, onBack?: () => void, verificationService?: any, enableAutoSubmit?: boolean }) {
  return (
    <div className="p-4 border rounded-md bg-yellow-50">
      <strong>PIN feature removed</strong>
      <p className="mt-2">The PIN-based verification flow has been removed. Use the email verification flow instead.</p>
      <div className="mt-3 flex gap-2">
        {onBack && <button className="px-3 py-2 border" onClick={onBack}>Back</button>}
        {onSuccess && <button className="px-3 py-2 bg-emerald-600 text-white" onClick={onSuccess}>Continue</button>}
      </div>
    </div>
  )
}
