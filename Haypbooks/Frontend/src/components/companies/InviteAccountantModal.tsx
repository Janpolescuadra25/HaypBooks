'use client'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  tenantId?: string
  onClose: () => void
  onSuccess: () => void
  // Optional role name to use when creating an invite (e.g. "Client" or "Accountant").
  roleName?: string
}

export default function InviteAccountantModal({ tenantId, onClose, onSuccess, roleName = 'Accountant' }: Props) {
  const [mode, setMode] = useState<'email' | 'link'>('email')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [pendingLinkInviteId, setPendingLinkInviteId] = useState<string | null>(null)
  const [pendingLinkLoading, setPendingLinkLoading] = useState(false)
  const [error, setError] = useState('')

  const roleLabel = roleName || 'Accountant'
  const roleLabelLower = roleLabel.toLowerCase()

  const portalRoot = useMemo(() => document.createElement('div'), [])

  useEffect(() => {
    portalRoot.className = 'invite-accountant-modal-portal'
    document.body.appendChild(portalRoot)
    return () => {
      document.body.removeChild(portalRoot)
    }
  }, [portalRoot])

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
      const body: Record<string, any> = {
        email: email.trim().toLowerCase(),
        isLinkInvite: false,
        message: message.trim() || undefined,
      }
      if (roleName) body.roleName = roleName

      const res = await fetch(`/api/tenants/${tenantId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  const handleGenerateLink = async () => {
    setError('')

    if (!tenantId) {
      setError('No tenant found - please create your first company first')
      return
    }

    setIsGenerating(true)
    setGeneratedLink(null)

    try {
      const body: Record<string, any> = {
        isLinkInvite: true,
        message: message.trim() || undefined,
      }
      if (roleName) body.roleName = roleName

      const res = await fetch(`/api/tenants/${tenantId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to generate invite link')
      }

      const data = await res.json()
      const link = `${window.location.origin}/accept-invite?code=${data.id}`
      setGeneratedLink(link)
      setPendingLinkInviteId(data.id)
    } catch (err: any) {
      setError(err.message || 'Failed to generate invite link')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRevokeLink = async () => {
    if (!tenantId || !pendingLinkInviteId) return
    setPendingLinkLoading(true)

    try {
      const res = await fetch(`/api/tenants/${tenantId}/invites/${pendingLinkInviteId}/cancel`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to cancel invite link')
      }
      setPendingLinkInviteId(null)
      setGeneratedLink(null)
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invite link')
    } finally {
      setPendingLinkLoading(false)
    }
  }

  const handleRegenerateLink = async () => {
    if (!tenantId) return

    // Cancel existing link first (if any)
    if (pendingLinkInviteId) {
      await handleRevokeLink()
    }

    // Generate a new link after cancellation
    await handleGenerateLink()
  }

  useEffect(() => {
    if (mode !== 'link' || !tenantId) return
    let mounted = true

    const loadPendingLink = async () => {
      setPendingLinkLoading(true)
      try {
        const res = await fetch('/api/tenants/invites/pending', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted || !Array.isArray(data)) return

        const pendingLink = data.find((invite: any) => invite.isLinkInvite && invite.status === 'PENDING')
        if (pendingLink && pendingLink.id) {
          setPendingLinkInviteId(pendingLink.id)
          setGeneratedLink(`${window.location.origin}/accept-invite?code=${pendingLink.id}`)
        } else {
          setPendingLinkInviteId(null)
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setPendingLinkLoading(false)
      }
    }

    loadPendingLink()

    return () => {
      mounted = false
    }
  }, [mode, tenantId])

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{roleName === 'Client' ? 'Add Client' : `Invite ${roleLabel}`}</h2>

        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('email')
              setError('')
              setGeneratedLink(null)
              setMessage('')
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'email' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            By Email
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('link')
              setError('')
              setGeneratedLink(null)
              setMessage('')
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'link' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Invite Link
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          {mode === 'email'
            ? (roleName === 'Client'
                ? 'Send an invitation to a client requesting access to their books.'
                : `Send an invitation to a ${roleLabelLower} so they can access your workspace.`)
            : (roleName === 'Client'
                ? `Generate a unique invite link that you can share with a client. They can use it to grant you access to their books.`
                : `Generate a unique invite link that you can share with an accountant. They can use it to request access to your books.`)}
        </p>

        {mode === 'email' ? (
          <form onSubmit={handleSubmit}>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {roleName === 'Accountant' ? 'Accountant Email' : 'Email Address'} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={roleName === 'Accountant' ? 'accountant@example.com' : 'john@company.com'}
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Personal Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Add a personal message to the invitation..."
                rows={3}
                disabled={loading}
              />
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
        ) : (
          <div>
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGenerateLink}
                className="w-full px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating…' : 'Generate Invite Link'}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Personal Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Add a personal message to the invitation..."
                rows={3}
                disabled={isGenerating}
              />
            </div>

            {generatedLink && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(generatedLink)}
                    className="px-3 py-2 text-sm font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Copy
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    This link expires in 7 days. Share it only with the intended person.
                  </p>
                  {pendingLinkInviteId ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleRevokeLink}
                        className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors"
                        disabled={pendingLinkLoading}
                      >
                        {pendingLinkLoading ? 'Revoking…' : 'Revoke link'}
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateLink}
                        className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                        disabled={pendingLinkLoading}
                      >
                        {pendingLinkLoading ? 'Working…' : 'Regenerate'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

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
                disabled={isGenerating}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modal, portalRoot)
}
