'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/services/auth.service'

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams?.get('code') || ''

  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let mounted = true
    authService
      .getCurrentUser()
      .then((u) => {
        if (!mounted) return
        setUser(u)
      })
      .catch(() => {
        if (!mounted) return
        setUser(null)
      })

    return () => {
      mounted = false
    }
  }, [])

  const handleAccept = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/companies/invites/${encodeURIComponent(code)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 403) {
          setError(
            data.message ||
              'This invitation was sent to a different email address. Please sign in using the invited email and try again.',
          )
          return
        }
        if (res.status === 404) {
          setError(data.message || 'Invite not found or expired. Please request a new invitation.')
          return
        }
        throw new Error(data.message || 'Failed to accept invite')
      }

      setSuccess(true)
      setTimeout(() => router.push('/practice-hub'), 1200)
    } catch (err: any) {
      setError(err?.message || 'Failed to accept invite')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const isCodeValid = useMemo(() => code && code.length > 0, [code])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-3">Accept Invite</h1>
        <p className="text-sm text-slate-600 mb-6">
          {user
            ? 'Click the button below to accept the invite and connect to the workspace.'
            : 'Please sign in to accept the invite.'}
        </p>

        {!isCodeValid ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800">
            No invite code found in the URL.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-700 mb-4">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 mb-4">
            Invite accepted! Redirecting…
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {user ? (
            <button
              type="button"
              onClick={handleAccept}
              disabled={!isCodeValid || loading || success}
              className="w-full rounded-lg bg-emerald-600 text-white py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Accepting…' : 'Accept Invite'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700"
            >
              Sign in to continue
            </button>
          )}

          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full rounded-lg bg-slate-100 text-slate-700 py-2 text-sm font-semibold hover:bg-slate-200"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
