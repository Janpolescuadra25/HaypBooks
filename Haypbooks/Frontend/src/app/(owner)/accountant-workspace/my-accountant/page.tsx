'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  RefreshCcw,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  MessageSquare,
  User,
  Star,
} from 'lucide-react'
import InviteAccountantModal from '@/components/companies/InviteAccountantModal'
import { useToast } from '@/components/ToastProvider'
import { useCompanyId } from '@/hooks/useCompanyId'

type CompanyUserRow = {
  user: { id: string; name?: string; email: string }
  role?: { name?: string }
  status?: string
  lastAccessedAt?: string
}

type InviteRow = {
  id: string
  email: string
  status: string
  invitedAt: string
  expiresAt?: string
  invitedBy?: { name?: string; email: string }
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  INACTIVE: { label: 'Inactive', color: 'bg-slate-100 text-slate-700' },
  EXPIRED: { label: 'Expired', color: 'bg-slate-100 text-slate-700' },
}

function formatDate(date?: string) {
  if (!date) return '-' 
  try {
    return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return date
  }
}

export default function Page() {
  const toast = useToast()
  const { companyId, loading: loadingCompany } = useCompanyId()

  const [connected, setConnected] = useState<CompanyUserRow[]>([])
  const [sentInvites, setSentInvites] = useState<InviteRow[]>([])
  const [incomingRequests, setIncomingRequests] = useState<InviteRow[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'connected' | 'incoming'>('connected')
  const [query, setQuery] = useState('')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    ACTIVE: true,
    PENDING: true,
    INACTIVE: true,
    EXPIRED: true,
    ACCEPTED: true,
    DECLINED: true,
  })
  const filterRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!filterOpen) return

    const onClickOutside = (event: MouseEvent) => {
      if (!filterRef.current) return
      if (event.target instanceof Node && !filterRef.current.contains(event.target)) {
        setFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [filterOpen])

  const refresh = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const [usersRes, invitesRes, incomingRes] = await Promise.all([
        fetch(`/api/companies/${encodeURIComponent(companyId)}/users`, { cache: 'no-store' }),
        fetch(`/api/companies/${encodeURIComponent(companyId)}/invites`, { cache: 'no-store' }),
        fetch('/api/tenants/invites/pending', { cache: 'no-store' }),
      ])

      if (usersRes.ok) {
        setConnected(await usersRes.json())
      }
      if (invitesRes.ok) {
        const data = await invitesRes.json()
        setSentInvites(Array.isArray(data) ? data : [])
      }
      if (incomingRes.ok) {
        const data = await incomingRes.json()
        setIncomingRequests(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast.error('Unable to load accountant data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => {
    if (companyId) refresh()
  }, [companyId, refresh])

  const filterByStatus = useCallback(
    (status?: string) => {
      if (!status) return true
      return statusFilters[status] ?? true
    },
    [statusFilters],
  )

  const filteredConnected = useMemo(() => {
    const term = query.trim().toLowerCase()
    return connected.filter((row) => {
      if (!filterByStatus(row.status)) return false
      if (!term) return true
      const name = row.user.name ?? ''
      const email = row.user.email ?? ''
      const firm = row.role?.name ?? ''
      return [name, email, firm].some((v) => v.toLowerCase().includes(term))
    })
  }, [connected, query, filterByStatus])

  const filteredIncoming = useMemo(() => {
    const term = query.trim().toLowerCase()
    return incomingRequests.filter((row) => {
      if (!filterByStatus(row.status)) return false
      if (!term) return true
      return row.email.toLowerCase().includes(term)
    })
  }, [incomingRequests, query, filterByStatus])

  const activeCount = connected.filter((row) => row.status === 'ACTIVE').length
  const pendingInvitesCount = sentInvites.filter((i) => i.status === 'PENDING').length
  const incomingCount = incomingRequests.filter((i) => i.status === 'PENDING').length
  const totalPermissions = connected.length * 3 + pendingInvitesCount // a simple heuristic

  const onInviteSuccess = () => {
    toast.success('Invite sent!')
    setInviteModalOpen(false)
    refresh()
  }

  const onDisconnect = (userId: string) => {
    toast.success('Disconnected accountant (mock).')
    setMenuOpenId(null)
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">My Accountant</h1>
          <p className="text-sm text-slate-500">Manage accountant access, permissions, and invitations</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refresh}
            disabled={loading || loadingCompany}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Invite Accountant
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-slate-800">{activeCount}</div>
              <div className="text-xs text-slate-500">Active Accountants</div>
            </div>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-slate-800">{pendingInvitesCount}</div>
              <div className="text-xs text-slate-500">Pending Invites</div>
            </div>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-slate-800">{incomingCount}</div>
              <div className="text-xs text-slate-500">Incoming Requests</div>
            </div>
            <div className="rounded-full bg-sky-100 p-2 text-sky-600">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-slate-800">{totalPermissions}</div>
              <div className="text-xs text-slate-500">Total Permissions</div>
            </div>
            <div className="rounded-full bg-violet-100 p-2 text-violet-600">
              <Star className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('connected')}
            >
              Connected Accountants ({connected.length})
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'incoming' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('incoming')}
            >
              Incoming Invitations ({incomingRequests.length})
            </button>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or firm..."
                className="w-full max-w-sm border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-700 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setFilterOpen((prev) => !prev)}
              >
                <Filter className="h-4 w-4" />
                Advanced Filter
              </button>

              {filterOpen && (
                <div className="absolute right-0 z-30 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-800">Filter</div>
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-slate-700"
                      onClick={() => setFilterOpen(false)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</div>
                    {Object.entries(STATUS_LABEL).map(([status, { label }]) => (
                      <label key={status} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!statusFilters[status]}
                          onChange={() =>
                            setStatusFilters((prev) => ({
                              ...prev,
                              [status]: !prev[status],
                            }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                        />
                        <span className="text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      className="text-xs font-medium text-slate-600 hover:text-slate-800"
                      onClick={() =>
                        setStatusFilters({
                          ACTIVE: true,
                          PENDING: true,
                          INACTIVE: true,
                          EXPIRED: true,
                          ACCEPTED: true,
                          DECLINED: true,
                        })
                      }
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                      onClick={() => setFilterOpen(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">Accountant</th>
                <th className="px-4 py-3 font-medium text-slate-500">Firm</th>
                <th className="px-4 py-3 font-medium text-slate-500">Permissions</th>
                <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 font-medium text-slate-500">Rating</th>
                <th className="px-4 py-3 font-medium text-slate-500">Last active</th>
                <th className="px-4 py-3 font-medium text-slate-500">Connected</th>
                <th className="px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'connected' ? filteredConnected : filteredIncoming).map((row) => {
                const id = activeTab === 'connected' ? row.user.id : row.id
                const name = activeTab === 'connected' ? row.user.name ?? row.user.email : row.email
                const email = activeTab === 'connected' ? row.user.email : row.email
                const firm = activeTab === 'connected' ? (row.role?.name ?? '') : '—'
                const statusKey = (activeTab === 'connected' ? row.status : row.status) ?? 'PENDING'
                const status = STATUS_LABEL[statusKey] ?? { label: statusKey, color: 'bg-slate-100 text-slate-700' }
                const rating = activeTab === 'connected' ? 4.7 : 0
                const lastActive = activeTab === 'connected' ? row.lastAccessedAt : row.invitedAt
                const connectedAt = activeTab === 'connected' ? row.lastAccessedAt : row.invitedAt

                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
                          {name?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{name}</div>
                          <div className="text-xs text-slate-500">{email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{firm}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">View Books</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">Edit Books</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">View Reports</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">{rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(lastActive)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(connectedAt)}</td>
                    <td className="px-4 py-3 relative">
                      <button
                        type="button"
                        onClick={() => setMenuOpenId((prev) => (prev === id ? null : id))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpenId === id && (
                        <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              toast.info('Manage permissions coming soon')
                              setMenuOpenId(null)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Manage Permissions
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toast.info('Send message coming soon')
                              setMenuOpenId(null)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Send Message
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toast.info('View activity coming soon')
                              setMenuOpenId(null)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            View Activity
                          </button>
                          <div className="border-t border-slate-100" />
                          <button
                            type="button"
                            onClick={() => onDisconnect(id)}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Disconnect
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(!filteredConnected.length && activeTab === 'connected') || (!filteredIncoming.length && activeTab === 'incoming') ? (
            <div className="p-8 text-center text-sm text-slate-500">No results found.</div>
          ) : null}
        </div>
      </div>

      {inviteModalOpen && (
        <InviteAccountantModal onClose={() => setInviteModalOpen(false)} onSuccess={onInviteSuccess} />
      )}
    </div>
  )
}
