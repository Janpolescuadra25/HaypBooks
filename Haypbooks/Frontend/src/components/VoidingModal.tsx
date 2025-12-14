"use client"
import { useEffect, useRef, useState } from 'react'

interface Props {
  entity: 'invoice' | 'bill'
  id: string
  onClose(): void
  onDone(updated: any): void
}

export default function VoidingModal({ entity, id, onClose, onDone }: Props) {
  const [reason, setReason] = useState('')
  const [createReversing, setCreateReversing] = useState(true)
  const [reversalDate, setReversalDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const reasonRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    // Focus the first control when the modal opens
    reasonRef.current?.focus()
  }, [])

  function validate(): string | null {
    if (!reason.trim()) return 'Reason is required'
    if (createReversing && !reversalDate) return 'Reversal date is required when creating a reversing entry'
    return null
  }

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const v = validate()
      if (v) {
        setError(v)
        setLoading(false)
        return
      }
      setAnnouncement(`Voiding ${entity}…`)
      const body = { reason: reason || undefined, createReversing, reversalDate: reversalDate || undefined }
      const res = await fetch(`/api/${entity === 'invoice' ? 'invoices' : 'bills'}/${id}/void`, { method: 'POST', body: JSON.stringify(body) })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const json = await res.json()
      setAnnouncement(`${entity === 'invoice' ? 'Invoice' : 'Bill'} voided successfully`)
      onDone(json.invoice || json.bill)
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voiding-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <form
        className="w-full max-w-lg rounded-md shadow-lg bg-white p-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        aria-describedby={error ? 'voiding-error' : undefined}
      >
        <h2 id="voiding-title" className="text-lg font-semibold">Void {entity}</h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="void-reason">Reason<span className="text-rose-600">*</span></label>
          <textarea
            id="void-reason"
            ref={reasonRef}
            className="w-full border rounded p-2 text-sm"
            rows={3}
            value={reason}
            onChange={e=>setReason(e.target.value)}
            placeholder="Duplicate, entered in error, etc."
            required
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={createReversing}
              onChange={e=>setCreateReversing(e.target.checked)}
              aria-describedby="reversing-help"
            />
            Create reversing entry
          </label>
          <div className="flex flex-col text-sm gap-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="void-reversal-date">Reversal Date{createReversing ? <span className="text-rose-600">*</span> : ' (optional)'}</label>
            <input
              id="void-reversal-date"
              aria-label="Reversal Date"
              type="date"
              className="border rounded p-1"
              value={reversalDate}
              onChange={e=>setReversalDate(e.target.value)}
              required={createReversing}
            />
            <span id="reversing-help" className="sr-only">When selected, a reversing journal will be created on the reversal date.</span>
          </div>
        </div>
        {error && <div id="voiding-error" className="text-sm text-red-600">{error}</div>}
        <div className="sr-only" aria-live="polite">{announcement}</div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Voiding…' : 'Void'}</button>
        </div>
      </form>
    </div>
  )
}
