'use client'

import { useEffect, useState } from 'react'
import HaypModal from './HaypModal'

interface RejectionReasonModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  title: string
  description?: string
}

export default function RejectionReasonModal({ open, onClose, onConfirm, title, description }: RejectionReasonModalProps) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('')
      setTouched(false)
    }
  }, [open])

  const isValid = reason.trim().length > 0

  return (
    <HaypModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={description}
      size="sm"
      closeOnOverlayClick={true}
    >
      <div className="space-y-4">
        <div className="space-y-2 text-sm text-slate-700">
          <label htmlFor="rejection-reason" className="block font-semibold text-slate-900">Rejection Reason</label>
          <textarea
            id="rejection-reason"
            rows={5}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            onBlur={() => setTouched(true)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:ring-emerald-200 focus:outline-none focus:ring"
            placeholder="Enter a short reason for rejection"
          />
          {touched && !isValid ? (
            <p className="text-sm text-rose-600">Please provide a reason before confirming.</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setTouched(true)
              if (!isValid) return
              onConfirm(reason.trim())
            }}
            disabled={!isValid}
            className="h-11 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </HaypModal>
  )
}
