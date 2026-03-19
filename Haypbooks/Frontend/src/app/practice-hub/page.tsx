'use client'

import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import {
  LayoutDashboard, HeartPulse, Zap,
  Users, UserPlus, FolderOpen, MessageSquare,
  ListChecks, CalendarDays, BookMarked, RefreshCw,
  FileDiff, ClipboardList, BarChart3,
  Receipt, Settings, Building2, UsersRound,
  CreditCard, LayoutTemplate, ChevronRight,
  BriefcaseBusiness, Bell, Search, HelpCircle,
  TrendingUp, AlertCircle, CheckCircle2, Clock,
  ArrowUpRight, Circle, ChevronDown, Plus,
  LayoutGrid, X, Filter, BarChart, FileSpreadsheet,
  Star, Pin, Trash2, Edit2, Mail, Phone, Globe,
  FileText, Download, Upload, Eye, MoreHorizontal,
  Tag, DollarSign, Hash, Calendar, User, Briefcase,
  ChevronLeft, Check, Send, Inbox, Archive,
  BookOpen, PieChart, Layers, Target, Award,
  ChevronsUpDown, Save, ExternalLink,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import ComingSoon from '@/components/owner/ComingSoon'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useUser } from '@/hooks/use-user'
import { authService } from '@/services/auth.service'
import InviteAccountantModal from '@/components/companies/InviteAccountantModal'

// ── Navigation structure ───────────────────────────────────────────────────────
const NAV = [
  {
    key: 'home', label: 'Home', icon: LayoutDashboard,
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'practice-health', label: 'Practice Health', icon: HeartPulse },
      { key: 'shortcuts', label: 'Shortcuts', icon: Zap },
      { key: 'setup-center', label: 'Setup Center', icon: Layers },
    ],
  },
  {
    key: 'clients', label: 'Clients', icon: Users,
    items: [
      { key: 'client-list', label: 'My Clients', icon: Users },
      { key: 'client-onboarding', label: 'Client Onboarding', icon: UserPlus },
      { key: 'client-documents', label: 'Client Documents', icon: FolderOpen },
      { key: 'client-portal', label: 'Client Portal', icon: Globe },
      { key: 'client-crm', label: 'Client CRM', icon: Filter },
      { key: 'communications', label: 'Communications', icon: MessageSquare },
    ],
  },
  {
    key: 'work', label: 'Work Mgmt', icon: ListChecks,
    items: [
      { key: 'work-queue', label: 'Work Queue', icon: ListChecks },
      { key: 'monthly-close', label: 'Monthly Close', icon: RefreshCw },
      { key: 'annual-engagements', label: 'Annual Engagements', icon: BookMarked },
      { key: 'work-in-progress', label: 'WIP Ledger', icon: BarChart },
      { key: 'calendar', label: 'Calendar', icon: CalendarDays },
    ],
  },
  {
    key: 'accountant', label: 'Workspace', icon: BriefcaseBusiness,
    items: [
      { key: 'books-review', label: 'Books Review', icon: BookMarked },
      { key: 'reconciliation', label: 'Reconciliation Hub', icon: RefreshCw },
      { key: 'adjusting', label: 'Adjusting Entries', icon: FileDiff },
      { key: 'client-requests', label: 'Client Requests', icon: ClipboardList },
      { key: 'expert-help', label: 'Expert Help', icon: HelpCircle },
    ],
  },
  {
    key: 'billing', label: 'Billing', icon: Receipt,
    items: [
      { key: 'invoice-generation', label: 'Generate Invoices', icon: FileText },
      { key: 'invoice-list', label: 'Invoice List', icon: LayoutGrid },
      { key: 'recurring-billing', label: 'Recurring Billing', icon: RefreshCw },
      { key: 'payment-tracking', label: 'Payment Tracking', icon: DollarSign },
      { key: 'rate-cards', label: 'Rate Cards', icon: FileSpreadsheet },
    ],
  },
  {
    key: 'analytics', label: 'Analytics', icon: PieChart,
    items: [
      { key: 'practice-overview', label: 'Practice Overview', icon: BarChart3 },
      { key: 'client-analytics', label: 'Client Analytics', icon: Users },
      { key: 'staff-reports', label: 'Staff Reports', icon: UsersRound },
      { key: 'billing-reports', label: 'Billing Reports', icon: Receipt },
      { key: 'work-reports', label: 'Work Reports', icon: ListChecks },
    ],
  },
  {
    key: 'settings', label: 'Settings', icon: Settings,
    items: [
      { key: 'profile', label: 'Practice Profile', icon: Building2 },
      { key: 'team', label: 'Team Management', icon: UsersRound },
      { key: 'templates', label: 'Templates', icon: LayoutTemplate },
      { key: 'automation', label: 'Automation', icon: Zap },
      { key: 'integrations', label: 'Integrations', icon: Layers },
      { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    ],
  },
]

// ── Stats (used as fallback when API is empty) ────────────────────────────────
const SAMPLE_STATS = [
  { label: 'Active Clients', value: '0', sub: 'No data yet', accent: 'border-l-green-500', light: 'bg-green-50', text: 'text-green-700', icon: Users },
  { label: 'Open Tasks', value: '0', sub: 'No data yet', accent: 'border-l-amber-500', light: 'bg-amber-50', text: 'text-amber-700', icon: ListChecks },
  { label: 'Pending Reviews', value: '0', sub: 'No data yet', accent: 'border-l-rose-500', light: 'bg-rose-50', text: 'text-rose-600', icon: AlertCircle },
  { label: 'Completed MTD', value: '0', sub: 'No data yet', accent: 'border-l-slate-400', light: 'bg-slate-100', text: 'text-slate-600', icon: CheckCircle2 },
]

const SAMPLE_ACTIVITY: { client: string; action: string; time: string; status: string }[] = []
const SAMPLE_DEADLINES: { label: string; date: string; urgent: boolean }[] = []

// ── Shared helpers ─────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

function EmptyState({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-400" />
      </div>
      <p className="text-sm font-bold text-slate-700 mb-1">{title}</p>
      <p className="text-xs text-slate-400 max-w-xs">{body}</p>
    </div>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${color}`}>{label}</span>
}

function PrimaryBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all hover:scale-105 active:scale-95">
      {children}
    </button>
  )
}

// ── 1. Practice Health ─────────────────────────────────────────────────────────
function PracticeHealthPanel() {
  return <ComingSoon title="Practice Health" />
}

// ── 2. Shortcuts ───────────────────────────────────────────────────────────────
function ShortcutsPanel() {
  return <ComingSoon title="Shortcuts" />
}

// ── 3. My Clients ─────────────────────────────────────────────────────────────
function ClientListPanel() {
  const [activeTab, setActiveTab] = useState<'connected' | 'incoming'>('connected')
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<Record<string, boolean>>({
    Active: true,
    Pending: true,
    Expired: true,
    Inactive: true,
  })
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const [clients, setClients] = useState<any[]>([])
  const [incoming, setIncoming] = useState<any[]>([])
  const [ownerTenantId, setOwnerTenantId] = useState<string | null>(null)
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingIncoming, setLoadingIncoming] = useState(true)
  const [loadingTenant, setLoadingTenant] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchClients() {
      setLoadingClients(true)
      try {
        const res = await fetch('/api/tenants/clients', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        if (!Array.isArray(data)) return
        setClients(data)
      } catch (e) {
        console.error('[PracticeHub] Failed to load clients', e)
      } finally {
        if (mounted) setLoadingClients(false)
      }
    }

    async function fetchIncoming() {
      setLoadingIncoming(true)
      try {
        const res = await fetch('/api/tenants/invites/pending', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        if (!Array.isArray(data)) return
        setIncoming(data)
      } catch (e) {
        console.error('[PracticeHub] Failed to load incoming requests', e)
      } finally {
        if (mounted) setLoadingIncoming(false)
      }
    }

    async function fetchTenantInfo() {
      setLoadingTenant(true)
      try {
        const res = await fetch('/api/tenants', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        if (!Array.isArray(data)) return
        const owner = data.find((t: any) => t.isOwner)
        if (owner && owner.id) setOwnerTenantId(owner.id)
      } catch (e) {
        console.error('[PracticeHub] Failed to load tenant info', e)
      } finally {
        if (mounted) setLoadingTenant(false)
      }
    }

    fetchClients()
    fetchIncoming()
    fetchTenantInfo()

    return () => { mounted = false }
  }, [])

  const stats = useMemo(() => {
    const active = clients.length
    const pending = incoming.filter((i) => (i.status || '').toUpperCase() === 'PENDING').length
    const incomingCount = incoming.length
    const revenue = '$0' // TODO: compute real revenue from API
    return { active, pending, incoming: incomingCount, revenue }
  }, [clients, incoming])

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase()

    return clients
      .map((c) => {
        const tenantName = c.tenantName || c.workspaceName || ''
        const companyName = (c.companies && c.companies[0]?.name) || ''
        const lastActive = c.lastAccessedAt ? new Date(c.lastAccessedAt).toLocaleDateString() : ''
        return {
          id: c.workspaceId,
          name: tenantName,
          email: '',
          company: companyName,
          industry: '',
          status: 'Active',
          revenue: '-',
          lastActive,
          tasks: '',
          role: c.role,
        }
      })
      .filter(c => {
        if (!statusFilter[c.status]) return false
        if (!term) return true
        return [c.name, c.email, c.company].some(v => (v || '').toLowerCase().includes(term))
      })
  }, [clients, search, statusFilter])

  const filteredIncoming = useMemo(() => {
    const term = search.trim().toLowerCase()

    return incoming
      .map((i) => {
        const statusRaw = (i.status || '').toUpperCase()
        const status = statusRaw === 'PENDING' ? 'Pending' : statusRaw === 'EXPIRED' ? 'Expired' : statusRaw === 'ACCEPTED' ? 'Accepted' : statusRaw
        const requested = i.invitedAt ? new Date(i.invitedAt).toLocaleDateString() : ''
        const expires = i.expiresAt ? new Date(i.expiresAt).toLocaleDateString() : ''
        const companyName = i.workspace?.workspaceName || ''
        const name = companyName || i.email || 'Unknown'
        const perms = i.role?.name ? [i.role.name] : []
        return {
          id: i.id,
          name,
          email: i.email,
          company: companyName,
          industry: '',
          status,
          requested,
          expires,
          message: i.invitedByUser ? `Invited by ${i.invitedByUser.name || i.invitedByUser.email}` : '',
          permissions: perms,
        }
      })
      .filter(r => {
        if (!statusFilter[r.status]) return false
        if (!term) return true
        return [r.name, r.email, r.company].some(v => (v || '').toLowerCase().includes(term))
      })
  }, [incoming, search, statusFilter])

  const activeFilterCount = useMemo(() => Object.values(statusFilter).filter(Boolean).length, [statusFilter])

  const toggleStatus = (status: string) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }))
  }

  const closeFilter = () => setFilterOpen(false)

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500">Manage client relationships, invitations, and access permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700" onClick={() => setInviteModalOpen(true)}>
            <UserPlus size={14} /> Add clients
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{stats.active}</p>
              <p className="text-xs text-slate-500">Active Clients</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{stats.pending}</p>
              <p className="text-xs text-slate-500">Pending Invites</p>
            </div>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
              <Clock size={20} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{stats.incoming}</p>
              <p className="text-xs text-slate-500">Incoming Requests</p>
            </div>
            <div className="rounded-full bg-sky-100 p-2 text-sky-600">
              <Mail size={20} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{stats.revenue}</p>
              <p className="text-xs text-slate-500">Monthly Revenue</p>
            </div>
            <div className="rounded-full bg-violet-100 p-2 text-violet-600">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('connected')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'connected' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              Connected Clients ({clients.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('incoming')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'incoming' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              Incoming Requests ({incoming.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, or company..."
                className="w-[260px] rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => setFilterOpen(prev => !prev)}
            >
              <Filter size={16} /> Advanced Filter
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-800">Status</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  onClick={() => setStatusFilter({ Active: true, Pending: true, Inactive: true })}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  onClick={() => setFilterOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(statusFilter).map(([status, enabled]) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatus(status)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold ${enabled ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          {activeTab === 'connected' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Client</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Company</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Industry</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Permissions</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Revenue</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Last Active</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Tasks</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                      No clients match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700">
                            {client.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{client.name}</div>
                            <div className="text-xs text-slate-500">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{client.company}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{client.industry}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">View Books</span>
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">View Reports</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={
                          client.status === 'Active'
                            ? 'inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'
                            : client.status === 'Pending'
                              ? 'inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'
                              : 'inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'
                        }>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{client.revenue}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{client.lastActive}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{client.tasks}</td>
                      <td className="px-4 py-3">
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Client</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Permissions Requested</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Est. Revenue</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Requested</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Expires</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncoming.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                      No incoming requests match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredIncoming.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700">{req.name[0]}</div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{req.name}</div>
                            <div className="text-xs text-slate-500">{req.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{req.company}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {req.permissions.map((p: string) => (
                            <span key={p} className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">-</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={
                          req.status === 'Pending'
                            ? 'inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'
                            : req.status === 'Accepted'
                              ? 'inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'
                              : 'inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'
                        }>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{req.requested}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{req.expires}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            <Check size={14} /> 
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {inviteModalOpen && (
        <InviteAccountantModal
          tenantId={ownerTenantId ?? undefined}
          onClose={() => setInviteModalOpen(false)}
          onSuccess={() => setInviteModalOpen(false)}
          roleName="Client"
        />
      )}
    </div>
  )
}

function ClientOnboardingPanel() {
  return <ComingSoon title="Client Onboarding" />
}


// ── 5. Client Documents ────────────────────────────────────────────────────────
function ClientDocumentsPanel() {
  return <ComingSoon title="Client Documents" />
}

// ── 6. Client CRM Leads ────────────────────────────────────────────────────────
function ClientCRMPanel() {
  return <ComingSoon title="Client CRM Leads" />
}

// ── 7. Communications ──────────────────────────────────────────────────────────
function CommunicationsPanel() {
  return <ComingSoon title="Communications" />
}

// ── 8. Work Queue ──────────────────────────────────────────────────────────────
function WorkQueuePanel() {
  return <ComingSoon title="Work Queue" />
}

// ── 9. Monthly Close ───────────────────────────────────────────────────────────
function MonthlyClosePanel() {
  return <ComingSoon title="Monthly Close" />
}

// ── 10. Annual Engagements ─────────────────────────────────────────────────────
function AnnualEngagementsPanel() {
  return <ComingSoon title="Annual Engagements" />
}

// ── 11. WIP Ledger ─────────────────────────────────────────────────────────────
function WIPLedgerPanel() {
  return <ComingSoon title="WIP Ledger" />
}

// ── 12. Calendar ───────────────────────────────────────────────────────────────
function CalendarPanel() {
  return <ComingSoon title="Calendar" />
}

// ── 13. Books Review ───────────────────────────────────────────────────────────
function BooksReviewPanel() {
  return <ComingSoon title="Books Review" />
}

// ── 14. Reconciliation Hub ─────────────────────────────────────────────────────
function ReconciliationHubPanel() {
  return <ComingSoon title="Reconciliation Hub" />
}

// ── 15. Adjusting Entries ──────────────────────────────────────────────────────
function AdjustingEntriesPanel() {
  return <ComingSoon title="Adjusting Entries" />
}

// ── 16. Client Requests ────────────────────────────────────────────────────────
function ClientRequestsPanel() {
  return <ComingSoon title="Client Requests" />
}

// ── 17. Financial Statements ───────────────────────────────────────────────────
function FinancialStatementsPanel() {
  return <ComingSoon title="Financial Statements" />
}

// ── 18. Management Reports ─────────────────────────────────────────────────────
function ManagementReportsPanel() {
  return <ComingSoon title="Management Reports" />
}

// ── 19. Tax Reports ────────────────────────────────────────────────────────────
function TaxReportsPanel() {
  return <ComingSoon title="Tax Reports" />
}

// ── 20. Practice Profile ───────────────────────────────────────────────────────
function PracticeProfilePanel() {
  return <ComingSoon title="Practice Profile" />
}

// ── 21. Team Management ────────────────────────────────────────────────────────
function TeamManagementPanel() {
  return <ComingSoon title="Team Management" />
}

// ── 22. Rate Cards & Pricing ───────────────────────────────────────────────────
function RateCardsPanel() {
  return <ComingSoon title="Rate Cards & Pricing" />
}

// ── 23. Subscriptions ──────────────────────────────────────────────────────────
function SubscriptionsPanel() {
  return <ComingSoon title="Subscriptions & Billing" />
}

// ── 24. Templates ──────────────────────────────────────────────────────────────
function TemplatesPanel() {
  return <ComingSoon title="Templates" />
}

// ── 25. Setup Center ───────────────────────────────────────────────────────────
function SetupCenterPanel() {
  return <ComingSoon title="Setup Center" />
}

// ── 26. Client Portal ──────────────────────────────────────────────────────────
function ClientPortalPanel() {
  return <ComingSoon title="Client Portal" />
}

// ── 27. Expert Help ────────────────────────────────────────────────────────────
function ExpertHelpPanel() {
  return <ComingSoon title="Expert Help" />
}

// ── 28. Billing: Generate Invoices ─────────────────────────────────────────────
function InvoiceGenerationPanel() {
  return <ComingSoon title="Generate Invoices" />
}

// ── 29. Billing: Invoice List ──────────────────────────────────────────────────
function InvoiceListPanel() {
  return <ComingSoon title="Invoice List" />
}

// ── 30. Billing: Recurring Billing ─────────────────────────────────────────────
function RecurringBillingPanel() {
  return <ComingSoon title="Recurring Billing" />
}

// ── 31. Billing: Payment Tracking ─────────────────────────────────────────────
function PaymentTrackingPanel() {
  return <ComingSoon title="Payment Tracking" />
}

// ── 32. Analytics: Practice Overview ──────────────────────────────────────────
function PracticeOverviewPanel() {
  return <ComingSoon title="Practice Overview" />
}

// ── 33. Analytics: Client Analytics ───────────────────────────────────────────
function ClientAnalyticsPanel() {
  return <ComingSoon title="Client Analytics" />
}

// ── 34. Analytics: Staff Reports ──────────────────────────────────────────────
function StaffReportsPanel() {
  return <ComingSoon title="Staff Reports" />
}

// ── 35. Analytics: Billing Reports ────────────────────────────────────────────
function BillingReportsPanel() {
  return <ComingSoon title="Billing Reports" />
}

// ── 36. Analytics: Work Reports ───────────────────────────────────────────────
function WorkReportsPanel() {
  return <ComingSoon title="Work Reports" />
}

// ── 37. Settings: Automation ──────────────────────────────────────────────────
function AutomationPanel() {
  return <ComingSoon title="Automation" />
}

// ── 38. Settings: Integrations ────────────────────────────────────────────────
function IntegrationsPanel() {
  return <ComingSoon title="Integrations" />
}

function DashboardPanel() {
  const [stats, setStats] = useState(SAMPLE_STATS)
  const [activity, setActivity] = useState(SAMPLE_ACTIVITY)
  const [deadlines, setDeadlines] = useState(SAMPLE_DEADLINES)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/practice-hub/dashboard', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        if (data.stats) {
          setStats([
            { label: 'Active Clients', value: String(data.stats.activeClients ?? 0), sub: '', accent: 'border-l-green-500', light: 'bg-green-50', text: 'text-green-700', icon: Users },
            { label: 'Open Tasks', value: String(data.stats.openTasks ?? 0), sub: '', accent: 'border-l-amber-500', light: 'bg-amber-50', text: 'text-amber-700', icon: ListChecks },
            { label: 'Pending Reviews', value: String(data.stats.pendingReviews ?? 0), sub: '', accent: 'border-l-rose-500', light: 'bg-rose-50', text: 'text-rose-600', icon: AlertCircle },
            { label: 'Completed MTD', value: String(data.stats.completedMtd ?? 0), sub: '', accent: 'border-l-slate-400', light: 'bg-slate-100', text: 'text-slate-600', icon: CheckCircle2 },
          ])
          setIsLive(true)
        }
        if (Array.isArray(data.activity)) setActivity(data.activity)
        if (Array.isArray(data.deadlines)) setDeadlines(data.deadlines)
      } catch { /* use defaults */ }
    })()
  }, [])

  const formatTime = (iso: string) => {
    try {
      const diff = Date.now() - new Date(iso).getTime()
      if (diff < 60_000) return 'Just now'
      if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
      if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
      return `${Math.floor(diff / 86_400_000)}d ago`
    } catch { return iso }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch { return iso }
  }

  return (
    <div className="space-y-6">
      {/* Sample data banner */}
      {!isLive && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-2 rounded-xl">
          Showing placeholder data — connect your practice to see real figures.
        </div>
      )}

      {/* Welcome bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Good morning, Accountant 👋</h2>
          <p className="text-sm text-slate-500 mt-0.5">Here&apos;s what&apos;s happening in your practice today.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-600/25 transition-all hover:scale-105 active:scale-95">
          <UserPlus size={14} /> Add Client
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white border border-slate-200 border-l-4 ${s.accent} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-xl ${s.light} flex items-center justify-center`}>
                <s.icon size={15} className={s.text} />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            {s.sub && <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Activity + Deadlines */}
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
            <button className="text-xs text-green-600 font-semibold hover:underline flex items-center gap-0.5">View all <ArrowUpRight size={11} /></button>
          </div>
          <div className="divide-y divide-slate-50">
            {activity.length === 0 && (
              <p className="text-sm text-slate-400 px-5 py-6 text-center">No recent activity</p>
            )}
            {activity.map((a, i) => (
              <div key={a.client + i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.status === 'done' ? 'bg-green-100' : a.status === 'warn' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                  {a.status === 'done' ? <CheckCircle2 size={13} className="text-green-600" /> :
                    a.status === 'warn' ? <AlertCircle size={13} className="text-amber-500" /> :
                      <Circle size={13} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{a.client}</p>
                  <p className="text-xs text-slate-400">{a.action}</p>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0">{formatTime(a.time)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3>
            <CalendarDays size={14} className="text-slate-400" />
          </div>
          <div className="divide-y divide-slate-50">
            {deadlines.length === 0 && (
              <p className="text-sm text-slate-400 px-5 py-6 text-center">No upcoming deadlines</p>
            )}
            {deadlines.map((d, i) => (
              <div key={d.label + i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex-shrink-0 ${d.urgent ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{formatDate(d.date)}</span>
                <p className="text-xs text-slate-700 font-medium leading-snug">{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'New Engagement', icon: BriefcaseBusiness, color: 'text-green-700 bg-green-50', hover: 'hover:border-green-200 hover:bg-green-50/40' },
            { label: 'Upload Document', icon: FolderOpen, color: 'text-slate-700 bg-slate-100', hover: 'hover:border-slate-300 hover:bg-slate-50' },
            { label: 'Request from Client', icon: MessageSquare, color: 'text-teal-700 bg-teal-50', hover: 'hover:border-teal-200 hover:bg-teal-50/40' },
            { label: 'Start Reconciliation', icon: RefreshCw, color: 'text-green-700 bg-green-50', hover: 'hover:border-green-200 hover:bg-green-50/40' },
          ].map((qa) => (
            <button key={qa.label} className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-slate-200 ${qa.hover} transition-all group`}>
              <div className={`w-11 h-11 rounded-xl ${qa.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <qa.icon size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-600 text-center leading-snug">{qa.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
import { useSearchParams } from 'next/navigation'

export default function PracticeHubPage() {
  const searchParams = useSearchParams()
  const practiceId = searchParams?.get('practiceId')
  if (practiceId) console.log('practiceId selected:', practiceId)
  const [activeGroup, setActiveGroup] = useState('home')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [panelOpen, setPanelOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const railRef = useRef<HTMLElement | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ top: 0 })

  const updateIndicator = useCallback(() => {
    const idx = NAV.findIndex((g) => g.key === activeGroup)
    const btn = tabRefs.current[idx]
    const rail = railRef.current
    if (!btn || !rail) return

    const railRect = rail.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    const rawTop = btnRect.top - railRect.top + rail.scrollTop
    const centeredTop = rawTop + btn.offsetHeight / 2 - 18

    setIndicator({
      top: centeredTop,
    })
  }, [activeGroup])

  useLayoutEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  useEffect(() => {
    const handleResize = () => updateIndicator()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateIndicator])

  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const tenantId = (user as any)?.ownedWorkspaceId as string | undefined

  const userName = useMemo(() => {
    if (!user) return 'User'
    const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    if (full) return full
    return user.name || user.email || 'User'
  }, [user])

  const userRole = useMemo(() => {
    if (!user) return ''
    return user.role ? user.role.replace(/_/g, ' ') : ''
  }, [user])

  const userInitials = useMemo(() => {
    if (!user) return '??'
    const name = user.firstName || user.name || user.email || ''
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    if (parts[0]) return parts[0].slice(0, 2).toUpperCase()
    return '??'
  }, [user])

  const switchHub = useCallback(async () => {
    try {
      await fetch('/api/users/preferred-hub', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredHub: 'OWNER' }),
      })
    } catch (e) {
      // ignore
    }
    router.replace('/workspace')
  }, [router])

  const signOut = useCallback(async () => {
    await authService.logout()
    router.replace('/login')
  }, [router])

  const currentGroup = NAV.find(g => g.key === activeGroup)!
  const activeItem = currentGroup?.items.find(i => i.key === activeSection)

  const selectGroup = (key: string) => {
    setActiveGroup(key)
    const group = NAV.find(g => g.key === key)!
    setActiveSection(group.items[0].key)
    setPanelOpen(true)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 bg-slate-900 flex items-center justify-between px-5 border-b border-slate-700 shadow-xl z-50">
        {/* Left: logo + switcher */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 pr-5 border-r border-slate-700">
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <BriefcaseBusiness size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-none tracking-tight">Haypbooks</p>
              <p className="text-[9px] text-green-400 font-bold uppercase tracking-widest leading-none mt-0.5">Practice Hub</p>
            </div>
          </div>
          <button className="hidden md:flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-700 transition-colors group">
            <LayoutGrid size={13} className="text-green-400 group-hover:rotate-90 transition-transform duration-300" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">Organization</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-bold text-white">My Practice</span>
                <ChevronDown size={10} className="text-slate-400" />
              </div>
            </div>
          </button>
        </div>

        {/* Center: global search */}
        <div className="flex-1 max-w-xl mx-8 hidden lg:block">
          <div className="relative group">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" />
            <input
              placeholder="Search clients, tasks, reports..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-20 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded text-[9px] font-bold border border-slate-600">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-1.5">
          <button title="New" className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-all">
            <Plus size={17} className="hover:rotate-90 transition-transform" />
          </button>
          <button title="Notifications" className="relative p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-all">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-slate-900">4</span>
          </button>
          <button title="Help" className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-all">
            <HelpCircle size={17} />
          </button>
          <div className="ml-2 pl-3 border-l border-slate-700 relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-green-600/30">
                {userLoading ? '...' : userInitials}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-white leading-none">{userLoading ? 'Loading...' : userName}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{userLoading ? '' : userRole}</p>
              </div>
              <ChevronDown size={12} className="text-slate-500 hidden md:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 z-50">
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    switchHub()
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Switch hub
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    signOut()
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body: rail + secondary panel + content ──────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {/* PRIMARY ICON RAIL */}
        <aside
          ref={railRef}
          className="relative w-20 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-2 overflow-y-auto"
        >
          <motion.div
            className="absolute left-1.5 w-1.5 rounded-r-full bg-green-400 shadow-[2px_0_8px_rgba(74,222,128,0.5)] pointer-events-none z-20"
            animate={{ top: indicator.top }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ height: 36 }}
          />

          {NAV.map((group, idx) => {
            const isActive = activeGroup === group.key
            return (
              <button
                key={group.key}
                ref={(el) => { tabRefs.current[idx] = el }}
                title={group.label}
                onClick={() => selectGroup(group.key)}
                className={`relative z-10 w-16 flex flex-col items-center justify-center py-3 rounded-xl transition-all group ${isActive
                    ? 'bg-slate-700 text-white shadow-lg ring-1 ring-emerald-600/40'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                <group.icon
                  size={20}
                  className={isActive ? 'text-green-200' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span className={`text-[10px] mt-1.5 font-black uppercase tracking-tight text-center leading-tight px-1 w-full break-words ${isActive ? 'text-green-300' : 'text-slate-600 group-hover:text-slate-400'
                  }`}>
                  {group.label}
                </span>
              </button>
            )
          })}
        </aside>

        {/* SECONDARY NAV PANEL */}
        {panelOpen && (
          <aside className="w-[220px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden shadow-sm">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                  <currentGroup.icon size={14} className="text-green-600" />
                </div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">{currentGroup.label}</span>
              </div>
              <button
                title="Close panel"
                onClick={() => setPanelOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all"
              >
                <X size={14} />
              </button>
            </div>



            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-0.5">
              {currentGroup.items.map((item) => {
                const isActive = activeSection === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                        : 'text-slate-600 hover:bg-green-50 hover:text-green-800'
                      }`}
                  >
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isActive && <ChevronRight size={12} className="ml-auto text-green-300 flex-shrink-0" />}
                  </button>
                )
              })}
            </nav>

            {/* Panel footer — user card */}
            <div className="px-3 py-3 border-t border-slate-100">
              <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow">
                  {userLoading ? '...' : userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{userLoading ? 'Loading...' : userName}</p>
                  <p className="text-[9px] text-slate-400 truncate font-medium">{userLoading ? '' : userRole}</p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Re-open panel button */}
        {!panelOpen && (
          <button
            title="Open navigation"
            onClick={() => setPanelOpen(true)}
            className="absolute top-[15px] left-[79px] z-50 flex items-center justify-center p-1.5 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white rounded-lg shadow-lg shadow-green-500/30 transition-all"
          >
            <ChevronRight size={13} />
          </button>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable body */}
          <main className="flex-1 overflow-y-auto px-7 py-6 bg-slate-50">
            {activeSection === 'dashboard' && <DashboardPanel />}
            {activeSection === 'practice-health' && <PracticeHealthPanel />}
            {activeSection === 'shortcuts' && <ShortcutsPanel />}
            {activeSection === 'setup-center' && <SetupCenterPanel />}
            {activeSection === 'client-list' && <ClientListPanel />}
            {activeSection === 'client-onboarding' && <ClientOnboardingPanel />}
            {activeSection === 'client-documents' && <ClientDocumentsPanel />}
            {activeSection === 'client-portal' && <ClientPortalPanel />}
            {activeSection === 'client-crm' && <ClientCRMPanel />}
            {activeSection === 'communications' && <CommunicationsPanel />}
            {activeSection === 'work-queue' && <WorkQueuePanel />}
            {activeSection === 'monthly-close' && <MonthlyClosePanel />}
            {activeSection === 'annual-engagements' && <AnnualEngagementsPanel />}
            {activeSection === 'work-in-progress' && <WIPLedgerPanel />}
            {activeSection === 'calendar' && <CalendarPanel />}
            {activeSection === 'books-review' && <BooksReviewPanel />}
            {activeSection === 'reconciliation' && <ReconciliationHubPanel />}
            {activeSection === 'adjusting' && <AdjustingEntriesPanel />}
            {activeSection === 'client-requests' && <ClientRequestsPanel />}
            {activeSection === 'expert-help' && <ExpertHelpPanel />}
            {activeSection === 'invoice-generation' && <InvoiceGenerationPanel />}
            {activeSection === 'invoice-list' && <InvoiceListPanel />}
            {activeSection === 'recurring-billing' && <RecurringBillingPanel />}
            {activeSection === 'payment-tracking' && <PaymentTrackingPanel />}
            {activeSection === 'rate-cards' && <RateCardsPanel />}
            {activeSection === 'practice-overview' && <PracticeOverviewPanel />}
            {activeSection === 'client-analytics' && <ClientAnalyticsPanel />}
            {activeSection === 'staff-reports' && <StaffReportsPanel />}
            {activeSection === 'billing-reports' && <BillingReportsPanel />}
            {activeSection === 'work-reports' && <WorkReportsPanel />}
            {activeSection === 'profile' && <PracticeProfilePanel />}
            {activeSection === 'team' && <TeamManagementPanel />}
            {activeSection === 'templates' && <TemplatesPanel />}
            {activeSection === 'automation' && <AutomationPanel />}
            {activeSection === 'integrations' && <IntegrationsPanel />}
            {activeSection === 'subscriptions' && <SubscriptionsPanel />}
          </main>
        </div>
      </div>
    </div>
  )
}
