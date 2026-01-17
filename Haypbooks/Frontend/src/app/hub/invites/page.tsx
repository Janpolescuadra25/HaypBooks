'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import UserMenu from '@/components/UserMenu'

type Invite = {
  id: string
  tenantId: string
  email: string
  status: string
  invitedAt: string
  expiresAt: string
  tenant: {
    id: string
    name: string
  }
  invitedByUser: {
    email: string
    name?: string
  }
  role?: {
    id: string
    name: string
  }
}

export default function PendingInvitesPage() {
  const router = useRouter()
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  useEffect(() => {
    loadInvites()
  }, [])

  const loadInvites = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tenants/invites/pending', { cache: 'no-store' })
      if (res.ok) {
        setInvites(await res.json())
      }
    } catch (e) {
      console.error('Failed to load invites', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (inviteId: string) => {
    setAccepting(inviteId)
    try {
      const res = await fetch(`/api/companies/invites/${inviteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setIsAccountant: true }),
      })

      if (res.ok) {
        // Refresh invites list
        await loadInvites()
        // Optionally redirect to accountant hub
        setTimeout(() => router.push('/hub/accountant'), 1000)
      } else {
        alert('Failed to accept invitation')
      }
    } catch (e) {
      alert('Failed to accept invitation')
    } finally {
      setAccepting(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pending Invitations</h1>
            <p className="text-sm text-slate-600">Client invitations waiting for your acceptance</p>
          </div>
          <UserMenu />
        </header>

        {loading ? (
          <div className="text-slate-500 text-center py-12">Loading…</div>
        ) : invites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-slate-500 mb-2">No pending invitations</div>
            <p className="text-sm text-slate-400">
              When clients invite you to access their books, invitations will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <div key={invite.id} className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {invite.tenant.name}
                    </h3>
                    <div className="mt-3 space-y-1 text-sm text-slate-500">
                      <p>
                        <span className="font-medium">Invited by:</span> {invite.invitedByUser.name || invite.invitedByUser.email}
                      </p>
                      <p>
                        <span className="font-medium">Role:</span> {invite.role?.name || 'Accountant'}
                      </p>
                      <p>
                        <span className="font-medium">Invited:</span> {new Date(invite.invitedAt).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Expires:</span> {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleAccept(invite.id)}
                      disabled={accepting === invite.id}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {accepting === invite.id ? 'Accepting...' : 'Accept Invitation'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/hub/accountant')}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Accountant Hub
          </button>
        </div>
      </div>
    </div>
  )
}
