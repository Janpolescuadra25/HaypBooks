'use client'
import { useState } from 'react'

type Props = {
  workspaceId?: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddPracticeModal({ workspaceId, onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [servicesOffered, setServicesOffered] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Practice name is required')
      return
    }

    if (!workspaceId) {
      setError('No workspace found - please complete onboarding first')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/tenants/practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: name.trim(),
          servicesOffered: servicesOffered.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to create practice')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create practice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Add New Practice</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Practice Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter practice name"
              disabled={loading}
              maxLength={140}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Services Offered <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={servicesOffered}
              onChange={(e) => setServicesOffered(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. Tax preparation, Bookkeeping, Payroll"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Practice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
