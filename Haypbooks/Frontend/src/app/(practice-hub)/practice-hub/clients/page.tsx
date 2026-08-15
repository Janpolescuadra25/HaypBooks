'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ArrowRight, Users, Briefcase, Scale, BookOpen, Plus, X, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import PracticeHubPageTemplate from '@/components/practice-hub/PracticeHubPageTemplate'

interface ClientEngagement {
  id: string
  companyId: string
  companyName: string
  engagementName: string
  type: 'AUDIT' | 'TAX' | 'ADVISORY' | 'BOOKKEEPING'
  startDate: string
  endDate: string | null
}

interface PracticeInviteRecord {
  id: string
  email: string
  companyName?: string | null
  engagementName: string
  engagementType: 'AUDIT' | 'TAX' | 'ADVISORY' | 'BOOKKEEPING'
  createdAt: string
  status: string
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })

const typeLabel = (type: string) => {
  switch (type) {
    case 'BOOKKEEPING':
      return 'Bookkeeping'
    case 'AUDIT':
      return 'Audit'
    case 'TAX':
      return 'Tax'
    case 'ADVISORY':
      return 'Advisory'
    default:
      return type
  }
}

const typeBadgeColor = (type: string) => {
  switch (type) {
    case 'BOOKKEEPING':
      return 'bg-emerald-100 text-emerald-700'
    case 'AUDIT':
      return 'bg-sky-100 text-sky-700'
    case 'TAX':
      return 'bg-amber-100 text-amber-700'
    case 'ADVISORY':
      return 'bg-violet-100 text-violet-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const statusBadgeColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800'
    case 'EXPIRED':
      return 'bg-rose-100 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ClientListPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientEngagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'clients' | 'invitations'>('clients')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [invites, setInvites] = useState<PracticeInviteRecord[]>([])
  const [invitesLoading, setInvitesLoading] = useState(false)
  const [invitesError, setInvitesError] = useState('')
  const [formValues, setFormValues] = useState({
    email: '',
    companyName: '',
    engagementName: '',
    engagementType: 'AUDIT',
    startDate: '',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let mounted = true

    const loadClients = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await apiClient.get<ClientEngagement[]>('/api/practice-hub/clients')
        if (!mounted) return
        setClients(res.data)
      } catch (err: any) {
        if (!mounted) return
        setError(err?.response?.data?.message || err?.message || 'Failed to load clients')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadClients()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'invitations' || invites.length > 0 || invitesLoading) return

    let mounted = true
    const loadInvites = async () => {
      setInvitesLoading(true)
      setInvitesError('')
      try {
        const res = await apiClient.get<PracticeInviteRecord[]>('/api/practice-hub/invites')
        if (!mounted) return
        setInvites(res.data)
      } catch (err: any) {
        if (!mounted) return
        setInvitesError(err?.response?.data?.message || err?.message || 'Failed to load invitations')
      } finally {
        if (mounted) setInvitesLoading(false)
      }
    }

    loadInvites()
    return () => {
      mounted = false
    }
  }, [activeTab, invites.length, invitesLoading])

  const totalClients = useMemo(() => clients.length, [clients])
  const byType = useMemo(() => {
    const counts = {
      BOOKKEEPING: 0,
      AUDIT: 0,
      TAX: 0,
      ADVISORY: 0,
    }
    clients.forEach((client) => {
      if (client.type === 'BOOKKEEPING') counts.BOOKKEEPING += 1
      if (client.type === 'AUDIT') counts.AUDIT += 1
      if (client.type === 'TAX') counts.TAX += 1
      if (client.type === 'ADVISORY') counts.ADVISORY += 1
    })
    return counts
  }, [clients])

  const columns = useMemo(
    () => [
      {
        key: 'companyName',
        label: 'Company',
        sortable: true,
        render: (value: string) => <span className="font-semibold text-slate-900">{value}</span>,
      },
      {
        key: 'engagementName',
        label: 'Engagement',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        render: (value: string) => (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${typeBadgeColor(value)}`}>
            {typeLabel(value)}
          </span>
        ),
      },
      {
        key: 'startDate',
        label: 'Start Date',
        sortable: true,
        render: (value: string) => <span>{formatDate(value)}</span>,
      },
      {
        key: 'endDate',
        label: 'End Date',
        sortable: true,
        render: (value: string | null) => <span>{value ? formatDate(value) : 'Ongoing'}</span>,
      },
    ],
    []
  )

  const filters = useMemo(
    () => [
      {
        key: 'type',
        label: 'Type',
        type: 'select' as const,
        options: [
          { label: 'All', value: '' },
          { label: 'Bookkeeping', value: 'BOOKKEEPING' },
          { label: 'Audit', value: 'AUDIT' },
          { label: 'Tax', value: 'TAX' },
          { label: 'Advisory', value: 'ADVISORY' },
        ],
      },
    ],
    []
  )

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Clients',
        value: totalClients,
        icon: <Users size={18} />,
        bg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      },
      {
        label: 'Bookkeeping',
        value: byType.BOOKKEEPING,
        icon: <BookOpen size={18} />,
        bg: 'bg-slate-100',
        iconColor: 'text-emerald-600',
      },
      {
        label: 'Audit & Tax',
        value: byType.AUDIT + byType.TAX,
        icon: <Briefcase size={18} />,
        bg: 'bg-sky-100',
        iconColor: 'text-sky-600',
      },
      {
        label: 'Advisory',
        value: byType.ADVISORY,
        icon: <Scale size={18} />,
        bg: 'bg-violet-100',
        iconColor: 'text-violet-600',
      },
    ], [byType, totalClients]
  )

  const refreshInvites = async () => {
    setInvitesLoading(true)
    setInvitesError('')
    try {
      const res = await apiClient.get<PracticeInviteRecord[]>('/api/practice-hub/invites')
      setInvites(res.data)
    } catch (err: any) {
      setInvitesError(err?.response?.data?.message || err?.message || 'Failed to load invitations')
    } finally {
      setInvitesLoading(false)
    }
  }

  const openInviteModal = () => {
    setFormValues({
      email: '',
      companyName: '',
      engagementName: '',
      engagementType: 'AUDIT',
      startDate: '',
    })
    setFormError('')
    setShowInviteModal(true)
  }

  const handleSendInvite = async () => {
    setFormError('')

    if (!formValues.email || !emailRegex.test(formValues.email.trim())) {
      setFormError('Please enter a valid email address.')
      return
    }
    if (!formValues.engagementName.trim()) {
      setFormError('Engagement name is required.')
      return
    }
    if (!formValues.startDate) {
      setFormError('Start date is required.')
      return
    }

    setFormLoading(true)
    try {
      await apiClient.post('/api/practice-hub/invites', {
        email: formValues.email.trim(),
        companyName: formValues.companyName.trim() || undefined,
        engagementName: formValues.engagementName.trim(),
        engagementType: formValues.engagementType,
        startDate: formValues.startDate,
      })
      setShowInviteModal(false)
      setActiveTab('invitations')
      setSuccessMessage('Invitation sent successfully.')
      await refreshInvites()
      window.setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Unable to send invitation.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleRetryClients = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await apiClient.get<ClientEngagement[]>('/api/practice-hub/clients')
      setClients(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Practice Hub</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-950">Clients</h1>
              <p className="mt-2 text-sm text-slate-500">Invite new clients and manage pending invitations from your practice.</p>
            </div>
            <button
              type="button"
              onClick={openInviteModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              <Plus size={16} /> Invite Client
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex divide-x divide-slate-200 overflow-hidden rounded-full border border-slate-200 bg-white">
              {['clients', 'invitations'].map((tab) => {
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab as 'clients' | 'invitations')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'
                    } ${tab === 'clients' ? 'rounded-l-full' : 'rounded-r-full'}`}
                  >
                    {tab === 'clients' ? <Users size={16} /> : <Mail size={16} />}
                    {tab === 'clients' ? 'Clients' : 'Invitations'}
                  </button>
                )
              })}
            </div>
            {successMessage && <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{successMessage}</div>}
          </div>
        </div>

        {activeTab === 'clients' ? (
          <PracticeHubPageTemplate
            title="Practice Clients"
            description="Manage client engagements, filter by service type, and review active engagements from the Practice Hub."
            section="Practice Hub"
            icon={<Users size={20} />}
            columns={columns}
            data={clients}
            loading={loading}
            searchable
            searchableFields={['companyName', 'engagementName']}
            searchablePlaceholder="Search clients..."
            filters={filters}
            summaryCards={summaryCards}
            showExport={false}
            showCreate={false}
            dataLoading={loading}
            emptyTitle="No clients found"
            emptyDescription="Adjust your search or filters to find active client engagements."
            emptyAction={{ label: 'Retry', onClick: handleRetryClients }}
            onRowClick={(row) => router.push(`/home/performance?company=${row.companyId}`)}
            rowInlineActions={(row) => [
              {
                icon: <ArrowRight size={16} />,
                title: 'View performance',
                onClick: () => router.push(`/home/performance?company=${row.companyId}`),
                colorClass: 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100',
              },
            ]}
          />
        ) : (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Pending Invitations</h2>
                <p className="text-sm text-slate-500">Review and manage pending practice invites.</p>
              </div>
              <button
                type="button"
                onClick={openInviteModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                <Plus size={16} /> New Invitation
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              {invitesLoading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading invitations…</div>
              ) : invitesError ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{invitesError}</div>
              ) : invites.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
                  <p className="text-lg font-semibold">No pending invitations</p>
                  <p className="mt-2 text-sm">Send an invitation to get started with client onboarding.</p>
                </div>
              ) : (
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">Email</th>
                      <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">Company</th>
                      <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">Engagement</th>
                      <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">Type</th>
                      <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">Sent Date</th>
                      <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 text-slate-700">{invite.email}</td>
                        <td className="px-4 py-4 text-slate-700">{invite.companyName || 'Not specified'}</td>
                        <td className="px-4 py-4 text-slate-700">{invite.engagementName}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${typeBadgeColor(invite.engagementType)}`}>
                            {typeLabel(invite.engagementType)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{formatDate(invite.createdAt)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadgeColor(invite.status)}`}>
                            {invite.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Invite Client</h2>
                <p className="text-sm text-slate-500">Send an email invitation to add a client engagement to your practice.</p>
              </div>
              <button type="button" onClick={() => setShowInviteModal(false)} className="text-slate-500 hover:text-slate-800">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Client Email</label>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Company Name (optional)</label>
                <input
                  type="text"
                  value={formValues.companyName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Engagement Name</label>
                <input
                  type="text"
                  value={formValues.engagementName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, engagementName: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="2024 Year-End Audit"
                />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Engagement Type</label>
                  <select
                    value={formValues.engagementType}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, engagementType: e.target.value as any }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="AUDIT">Audit</option>
                    <option value="TAX">Tax</option>
                    <option value="ADVISORY">Advisory</option>
                    <option value="BOOKKEEPING">Bookkeeping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={formValues.startDate}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
              {formError && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendInvite}
                disabled={formLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {formLoading ? 'Sending…' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
