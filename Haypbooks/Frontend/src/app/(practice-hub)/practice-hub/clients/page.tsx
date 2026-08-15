'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { Users, Briefcase, Scale, BookOpen } from 'lucide-react'
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

export default function ClientListPage() {
  const [clients, setClients] = useState<ClientEngagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
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
        emptyAction={{ label: 'Retry', onClick: () => setError('') }}
      />
      {error && (
        <div className="mx-auto mt-6 max-w-7xl rounded-3xl border border-rose-100 bg-rose-50 px-6 py-5 text-sm text-rose-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Unable to load client list</p>
              <p className="mt-1 text-slate-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setError('')
                setLoading(true)
                apiClient.get<ClientEngagement[]>('/api/practice-hub/clients')
                  .then((res) => setClients(res.data))
                  .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load clients'))
                  .finally(() => setLoading(false))
              }}
              className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
