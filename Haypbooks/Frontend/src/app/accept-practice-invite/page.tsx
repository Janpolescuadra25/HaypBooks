'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/services/auth.service'
import apiClient from '@/lib/api-client'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

interface InviteDetails {
  practiceName: string
  companyName?: string | null
  engagementName: string
  engagementType: string
  startDate: string
  email: string
}

interface Company {
  id: string
  name: string
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export default function AcceptPracticeInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams?.get('code') || ''

  const [invite, setInvite] = useState<InviteDetails | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadInvite = async () => {
      if (!code) {
        setError('No invite code found in the URL.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await apiClient.get<InviteDetails>(`/api/public/practice-invites/${encodeURIComponent(code)}`)
        if (!mounted) return
        setInvite(res.data)
      } catch (err: any) {
        if (!mounted) return
        setError(err?.response?.data?.message || err?.message || 'Failed to validate invitation.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadInvite()

    return () => {
      mounted = false
    }
  }, [code])

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      setAuthLoading(true)
      try {
        const currentUser = await authService.getCurrentUser()
        if (!mounted) return
        setUser(currentUser)
      } catch {
        if (!mounted) return
        setUser(null)
      } finally {
        if (mounted) setAuthLoading(false)
      }
    }

    loadUser()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    if (!user || !invite) return

    const loadCompanies = async () => {
      setCompanyLoading(true)
      try {
        const res = await apiClient.get<Company[]>('/api/companies?filter=owned')
        if (!mounted) return
        setCompanies(res.data)
        if (res.data.length > 0) {
          setSelectedCompanyId(res.data[0].id)
        }
      } catch (err: any) {
        if (!mounted) return
        console.error('[AcceptPracticeInvitePage] failed to load companies', err)
      } finally {
        if (mounted) setCompanyLoading(false)
      }
    }

    loadCompanies()

    return () => {
      mounted = false
    }
  }, [invite, user])

  const inviteValid = useMemo(() => !!invite && !error && !loading, [invite, error, loading])
  const nextUrl = `/accept-practice-invite?code=${encodeURIComponent(code)}`

  const handleLogin = () => {
    router.push(`/login?next=${encodeURIComponent(nextUrl)}`)
  }

  const handleAccept = async () => {
    if (!selectedCompanyId) {
      setError('Please select a company to accept this invitation.')
      return
    }

    setError(null)
    setAcceptLoading(true)

    try {
      await apiClient.post(`/api/practice-hub/invites/${encodeURIComponent(code)}/accept`, {
        companyId: selectedCompanyId,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to accept invitation.')
    } finally {
      setAcceptLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-600 text-white">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Accept Practice Hub Invitation</h1>
          <p className="mt-2 text-sm text-slate-500">
            Connect with the practice and activate the invited engagement.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading invitation details…</div>
        ) : error ? (
          <div className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            <p className="font-semibold">Unable to validate invitation</p>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
            >
              Go to Home
            </button>
          </div>
        ) : success ? (
          <div className="space-y-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-lg font-semibold">You're now connected!</p>
                <p className="text-sm text-slate-700">The engagement is active and your practice is connected.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/practice-hub')}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          invite && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Practice</p>
                    <p className="text-base font-semibold text-slate-900">{invite.practiceName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Engagement</p>
                    <p className="text-base font-semibold text-slate-900">{invite.engagementName}</p>
                    <p className="text-sm text-slate-600">{typeLabel(invite.engagementType)} • starts {formatDate(invite.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Email invited</p>
                    <p className="text-sm text-slate-700">{invite.email}</p>
                  </div>
                </div>
              </div>

              {authLoading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Checking your sign-in status…</div>
              ) : user ? (
                <div className="space-y-4">
                  {companies.length > 0 ? (
                    <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <label className="block text-sm font-medium text-slate-700">Select a company</label>
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      >
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                      <p className="font-semibold">No companies available</p>
                      <p className="mt-2">You need to create a company first to accept this invitation.</p>
                      <button
                        type="button"
                        onClick={() => router.push('/companies/new')}
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 transition"
                      >
                        Create a company
                      </button>
                    </div>
                  )}

                  {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={acceptLoading || companies.length === 0}
                    className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {acceptLoading ? 'Accepting…' : 'Accept Invitation'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-700">Please sign in to accept this invitation.</p>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Sign in to continue
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Go to Home
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}
