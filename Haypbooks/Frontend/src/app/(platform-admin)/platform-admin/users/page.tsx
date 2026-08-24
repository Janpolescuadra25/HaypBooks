'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Users,
  Search,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  Mail,
  Building2,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'

interface CompanyMembership {
  companyId: string
  companyName: string
  role: string
}

interface UserRecord {
  id: string
  email: string
  name: string
  suspended: boolean
  createdAt: string
  lastLogin: string | null
  companies: CompanyMembership[]
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PaginationResponse {
  data: UserRecord[]
  pagination: PaginationInfo
}

const formatDate = (value: string | null) => {
  if (!value) return 'Never'
  const date = new Date(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getBadgeClass = (role: string) => {
  return role === 'Owner' || role === 'Admin'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-sky-50 text-sky-700'
}

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [pageSize] = useState(20)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get<PaginationResponse>(
        `/api/owner/users?query=${encodeURIComponent(search)}&page=${page}&limit=${pageSize}`,
      )
      setUsers(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, page])

  const activeCount = useMemo(() => users.filter((user) => !user.suspended).length, [users])
  const suspendedCount = useMemo(() => users.filter((user) => user.suspended).length, [users])
  const companyCount = useMemo(() => {
    return new Set(users.flatMap((user) => user.companies.map((company) => company.companyId))).size
  }, [users])
  const totalCount = useMemo(() => users.length, [users])

  const openModal = (user: UserRecord) => {
    setSelectedUser(user)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedUser(null)
  }

  const confirmAction = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      await apiClient.patch(`/api/owner/users/${selectedUser.id}/status`, {
        suspend: !selectedUser.suspended,
      })

      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id ? { ...user, suspended: !user.suspended } : user,
        ),
      )
      closeModal()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to update user status')
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (row: UserRecord) => (
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-950 truncate">{row.name || 'Unnamed User'}</div>
          <div className="text-xs text-slate-500 truncate">{row.email}</div>
        </div>
      ),
    },
  ]

  return (
    <OwnerPageTemplate
      title="User Management"
      description="Search users, view company membership, and suspend or reactivate accounts."
      section="Owner"
      icon={<Users size={20} />}
      columns={[]}
      data={[]}
      loading={loading}
      searchable={false}
      searchableFields={[]}
      searchPlaceholder=""
      summaryCards={[]}
    >
      <div className="p-6 space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Owner Users</p>
            <h1 className="text-3xl font-bold text-slate-950">All Users</h1>
            <p className="mt-2 text-sm text-slate-500">Browse users, review their company memberships, and manage activation status.</p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search users by name or email..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </header>

        {error && (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} />
              <div>
                <p className="font-semibold">Unable to load users</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -4 }} className="rounded-[20px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Users size={20} /></div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Users</span>
            </div>
            <p className="mt-6 text-4xl font-bold text-slate-950">{totalCount}</p>
            <p className="mt-2 text-sm text-slate-500">Users on this page</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="rounded-[20px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><CheckCircle2 size={20} /></div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Active Users</span>
            </div>
            <p className="mt-6 text-4xl font-bold text-slate-950">{activeCount}</p>
            <p className="mt-2 text-sm text-slate-500">Current active users</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="rounded-[20px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><ShieldOff size={20} /></div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Suspended</span>
            </div>
            <p className="mt-6 text-4xl font-bold text-slate-950">{suspendedCount}</p>
            <p className="mt-2 text-sm text-slate-500">Users requiring review</p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="rounded-[20px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Building2 size={20} /></div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Companies</span>
            </div>
            <p className="mt-6 text-4xl font-bold text-slate-950">{companyCount}</p>
            <p className="mt-2 text-sm text-slate-500">Unique company memberships</p>
          </motion.div>
        </div>

        <div className="overflow-x-auto rounded-[24px] border border-emerald-100 bg-white p-6 shadow-sm">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Companies</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last Login</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="animate-pulse border-b border-slate-100">
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-4 h-10 bg-slate-100" />
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No users found for this search.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-950 truncate">{user.name || 'No name'}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.companies.map((company) => (
                          <span key={`${user.id}-${company.companyId}`} className={`${getBadgeClass(company.role)} rounded-full px-2.5 py-1 text-[11px] font-semibold`}> 
                            {company.companyName} • {company.role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${user.suspended ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {user.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4">{formatDate(user.lastLogin)}</td>
                    <td className="px-4 py-4">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => openModal(user)}
                        className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition ${user.suspended ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                      >
                        {user.suspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Confirm Action</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">{selectedUser.suspended ? 'Reactivate user' : 'Suspend user'}</h2>
                </div>
                <button onClick={closeModal} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><Mail size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedUser.name}</p>
                    <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1 border border-slate-200">Status: {selectedUser.suspended ? 'Suspended' : 'Active'}</span>
                  <span className="rounded-full bg-white px-3 py-1 border border-slate-200">Memberships: {selectedUser.companies.length}</span>
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-600">
                Are you sure you want to {selectedUser.suspended ? 'reactivate' : 'suspend'} this user? This will {selectedUser.suspended ? 'restore' : 'prevent'} their access to the platform.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={actionLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selectedUser.suspended ? 'Reactivate user' : 'Suspend user'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </OwnerPageTemplate>
  )
}
