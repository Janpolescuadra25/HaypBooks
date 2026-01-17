'use client'
import { useState } from 'react'

type Props = {
  tenantId?: string
  onClose: () => void
  onSuccess: () => void
}

export default function InviteAccountantModal({ tenantId, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!tenantId) {
      setError('No tenant found - please create your first company first')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/tenants/${tenantId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to send invitation')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Invite Accountant</h2>
        <p className="text-sm text-slate-600 mb-6">
          Send an invitation to an accountant to give them access to your company's books.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Accountant Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="accountant@example.com"
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">
              They will receive an email with instructions to access your account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
