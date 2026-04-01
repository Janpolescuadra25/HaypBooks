'use client'

import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  ChevronsUpDown, Save, ExternalLink, ShieldCheck,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import ComingSoon from '@/components/owner/ComingSoon'
import PageDocumentation from '@/components/owner/PageDocumentation'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { usePracticeDashboard, usePracticeClients } from '@/hooks/usePracticeDashboard'
import { useUser } from '@/hooks/use-user'
import { authService } from '@/services/auth.service'
import InviteAccountantModal from '@/components/companies/InviteAccountantModal'
import PracticeProgressChecklist from '@/components/practice-hub/PracticeProgressChecklist'

// ── Navigation structure ───────────────────────────────────────────────────────
const NAV = [
  {
    key: 'home', label: 'Home', icon: LayoutDashboard,
    groups: [
      { group_name: 'Overview', items: [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'practice-health', label: 'Practice Health', icon: HeartPulse },
        { key: 'performance', label: 'Performance', icon: TrendingUp },
        { key: 'shortcuts', label: 'Shortcuts', icon: Zap },
      ], },
      { group_name: 'Management', items: [
        { key: 'deadlines-home', label: 'Deadlines', icon: AlertCircle },
        { key: 'notifications', label: 'Notifications Inbox', icon: Bell },
        { key: 'setup-center', label: 'Setup Center', icon: Layers },
      ], },
    ],
  },
  {
    key: 'clients', label: 'Clients', icon: Users,
    groups: [
      { group_name: 'Management', items: [
        { key: 'client-list', label: 'My Clients', icon: Users },
        { key: 'client-groups', label: 'Client Groups', icon: Tag },
        { key: 'client-portal', label: 'Client Portal', icon: Globe },
      ], },
      { group_name: 'CRM & Engagement', items: [
        { key: 'client-crm', label: 'Client Relationships', icon: Filter },
        { key: 'communications', label: 'Communications', icon: MessageSquare },
        { key: 'client-documents', label: 'Client Documents', icon: FolderOpen },
        { key: 'engagements', label: 'Engagements', icon: ClipboardList },
      ], },
      { group_name: 'Lifecycle', items: [
        { key: 'client-onboarding', label: 'Client Onboarding', icon: UserPlus },
        { key: 'client-transitions', label: 'Transitions & Exits', icon: ArrowUpRight },
      ], },
    ],
  },
  {
    key: 'work', label: 'Work Mgmt', icon: ListChecks,
    groups: [
      { group_name: 'Workflow', items: [
        { key: 'work-queue', label: 'Work Queue', icon: ListChecks },
        { key: 'work-in-progress', label: 'Work in Progress (WIP)', icon: BarChart },
        { key: 'deadline-tracker', label: 'Deadline Tracker', icon: AlertCircle },
      ], },
      { group_name: 'Schedule', items: [
        { key: 'calendar', label: 'Calendar', icon: CalendarDays },
        { key: 'monthly-close', label: 'Monthly Close', icon: RefreshCw },
        { key: 'annual-close', label: 'Annual Close', icon: BookMarked },
      ], },
    ],
  },
  {
    key: 'workspace', label: 'Workspace', icon: BriefcaseBusiness,
    groups: [
      { group_name: 'Review Tools', items: [
        { key: 'books-review', label: 'Books Review', icon: BookMarked },
        { key: 'reconciliation', label: 'Reconciliation Hub', icon: RefreshCw },
        { key: 'audit-trail', label: 'Audit Trail', icon: Eye },
        { key: 'work-papers', label: 'Work Papers', icon: FileText },
      ], },
      { group_name: 'Accounting Actions', items: [
        { key: 'adjusting', label: 'Adjusting Entries', icon: FileDiff },
        { key: 'period-close', label: 'Period Close', icon: CheckCircle2 },
      ], },
      { group_name: 'Requests', items: [
        { key: 'client-requests', label: 'Client Requests', icon: ClipboardList },
        { key: 'expert-help', label: 'Live Expert Support', icon: HelpCircle },
      ], },
    ],
  },
  {
    key: 'billing', label: 'Billing', icon: Receipt,
    groups: [
      { group_name: 'Invoicing', items: [
        { key: 'invoice-generation', label: 'Generate Invoices', icon: FileText },
        { key: 'invoice-list', label: 'Invoice List', icon: LayoutGrid },
        { key: 'recurring-billing', label: 'Recurring Billing', icon: RefreshCw },
      ], },
      { group_name: 'Revenue Management', items: [
        { key: 'payment-tracking', label: 'Payment Tracking', icon: DollarSign },
        { key: 'retainers', label: 'Retainers', icon: Briefcase },
        { key: 'collections', label: 'Collections', icon: AlertCircle },
        { key: 'write-offs', label: 'Bad Debt Write-offs', icon: Trash2 },
      ], },
      { group_name: 'Setup', items: [
        { key: 'rate-cards', label: 'Rate Cards', icon: FileSpreadsheet },
      ], },
    ],
  },
  {
    key: 'team', label: 'Team', icon: UsersRound,
    groups: [
      { group_name: 'Staffing', items: [
        { key: 'team-members', label: 'Team Members', icon: Users },
        { key: 'time-off', label: 'Time Off', icon: CalendarDays },
        { key: 'schedule', label: 'Team Schedule', icon: Calendar },
      ], },
      { group_name: 'Time Tracking', items: [
        { key: 'timesheet-entry', label: 'Timesheet Entry', icon: Clock },
        { key: 'time-approvals', label: 'Time Approvals', icon: CheckCircle2 },
      ], },
      { group_name: 'Performance', items: [
        { key: 'team-performance', label: 'Staff Performance', icon: Award },
        { key: 'team-capacity', label: 'Capacity Planning', icon: Target },
      ], },
      { group_name: 'Collaboration', items: [
        { key: 'team-chat', label: 'Team Chat', icon: MessageSquare },
        { key: 'client-communication', label: 'Client Messages', icon: Mail },
        { key: 'announcements', label: 'Announcements', icon: Bell },
        { key: 'document-collab', label: 'Document Collaboration', icon: FileText },
      ], },
    ],
  },
  {
    key: 'analytics', label: 'Analytics', icon: PieChart,
    groups: [
      { group_name: 'Executive Insights', items: [
        { key: 'practice-analytics', label: 'Practice Analytics', icon: BarChart3 },
        { key: 'financial-reports', label: 'Financial Reports', icon: FileSpreadsheet },
      ], },
      { group_name: 'Operational Reports', items: [
        { key: 'client-analytics', label: 'Client Reports', icon: Users },
        { key: 'staff-reports', label: 'Staff Reports', icon: UsersRound },
        { key: 'billing-reports', label: 'Billing Reports', icon: Receipt },
        { key: 'work-reports', label: 'Work Reports', icon: ListChecks },
      ], },
    ],
  },
  {
    key: 'settings', label: 'Settings', icon: Settings,
    groups: [
      { group_name: 'Practice Profile', items: [
        { key: 'profile', label: 'Details', icon: Building2 },
        { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
        { key: 'localization', label: 'Localization', icon: Globe },
      ], },
      { group_name: 'Configuration', items: [
        { key: 'templates', label: 'Templates', icon: LayoutTemplate },
        { key: 'automation', label: 'Automation', icon: Zap },
        { key: 'integrations', label: 'Integrations', icon: Layers },
      ], },
      { group_name: 'Security & Data', items: [
        { key: 'security', label: 'Security', icon: ShieldCheck },
        { key: 'data-management', label: 'Data & Privacy', icon: Archive },
        { key: 'comm-settings', label: 'Communication Settings', icon: Settings },
      ], },
    ],
  },
]

// ── Stats (used as fallback when API is empty) ────────────────────────────────
const SAMPLE_STATS = [
  { label: 'Active Clients', value: '0', sub: 'No data yet', accent: 'border-l-blue-600', light: 'bg-blue-50', text: 'text-blue-800', icon: Users },
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
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-700/20 transition-all hover:scale-105 active:scale-95">
      {children}
    </button>
  )
}

// ── 1. Practice Health ─────────────────────────────────────────────────────────
function PracticeHealthPanel() {
  return (
    <PageDocumentation
      title="Practice Health"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Home / Practice Health"
      purpose="Practice Health is the central health-monitoring dashboard for your accounting firm, aggregating key indicators across clients, staff, deadlines, and billing into a single real-time view. It surfaces risk signals early — overdue client deliverables, unhealthy client books, staff capacity warnings, and unpaid invoices — so practice managers can intervene before small issues become client problems. The health score system provides a quick at-a-glance indication of how the overall practice is performing relative to its targets."
      components={[
        { name: 'Overall Health Score', description: 'Composite score (0–100) derived from on-time delivery rate, client satisfaction, staff utilization, and collections.' },
        { name: 'Risk Signals Panel', description: 'Color-coded list of active risk flags: overdue tasks, unhealthy client books, and capacity alerts.' },
        { name: 'Client Health Grid', description: 'Per-client health indicators showing book quality, task status, last review date, and outstanding issues.' },
        { name: 'Staff Workload Heatmap', description: "Visual heat map of each staff member's current workload vs. capacity." },
        { name: 'Deadline Alert Feed', description: 'Upcoming and overdue filing deadlines across all clients, sorted by urgency.' },
      ]}
      tabs={['Health Overview', 'Client Health', 'Staff Health', 'Deadline Risk']}
      features={[
        'View composite practice health score with trend indicator',
        'Identify clients with unhealthy books or overdue deliverables',
        'Monitor staff capacity and detect overload conditions',
        'Track upcoming deadlines across all clients in one view',
        'Drill into any risk signal to see the underlying cause',
        'Set health score thresholds to trigger automatic alerts',
      ]}
      dataDisplayed={[
        'Overall practice health score and 30-day trend',
        'Number of active risk signals by category',
        'Per-client health status and last review date',
        'Staff utilization percentage and capacity warnings',
        'Deadline adherence rate (% delivered on time)',
      ]}
      userActions={[
        'View detailed breakdown of health score components',
        'Click a risk signal to navigate to the affected area',
        'Filter health view by client, staff member, or period',
        'Export health summary as PDF for management review',
        'Adjust health score weights and alert thresholds',
      ]}
    />
  )
}

// ── 2. Shortcuts ───────────────────────────────────────────────────────────────
function ShortcutsPanel() {
  return (
    <PageDocumentation
      title="Shortcuts"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Home / Shortcuts"
      purpose="Shortcuts provides a fully customizable quick-access launchpad for the most frequently used actions and pages in the practice hub — eliminating the need to navigate deep menus for daily recurring operations. Staff members can pin their own set of shortcuts, while practice managers can define firm-wide default shortcuts that appear for all users. Keyboard shortcuts are also displayed here for power users who prefer working without a mouse."
      components={[
        { name: 'Pinned Actions Grid', description: 'Customizable grid of pinned shortcuts showing icon, label, and destination for each.' },
        { name: 'Firm-Wide Defaults', description: 'Administrator-configured shortcuts that appear for all firm users and cannot be removed.' },
        { name: 'Recent Pages', description: 'Automatically populated list of recently visited pages within the practice hub.' },
        { name: 'Keyboard Shortcut Map', description: 'Reference table of all available keyboard shortcuts for navigating the practice hub.' },
        { name: 'Shortcut Search', description: 'Search box to find any page or action in the hub and add it as a shortcut.' },
      ]}
      tabs={['My Shortcuts', 'Firm Defaults', 'Keyboard Shortcuts', 'Recent Pages']}
      features={[
        'Pin any page or action as a personal shortcut',
        'View and customize keyboard shortcuts for the hub',
        'Access firm-wide shortcuts configured by administrators',
        'Quickly navigate to recently visited pages',
        'Search for any hub feature and launch it directly',
        'Organize shortcuts into custom groups',
      ]}
      dataDisplayed={[
        'Personal pinned shortcuts with labels and icons',
        'Firm-wide default shortcuts',
        'Recent page history with timestamps',
        'Keyboard shortcut map for all hub sections',
        'Shortcut categories and groupings',
      ]}
      userActions={[
        'Add a new personal shortcut via search',
        'Remove or reorder personal shortcuts',
        'Navigate directly to a shortcut destination',
        'Search for a feature to create a shortcut',
        'Administrator: configure firm-wide default shortcuts',
      ]}
    />
  )
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
  const [helpOpen, setHelpOpen] = useState(false)

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
          <button onClick={() => setHelpOpen(true)} className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold" aria-label="Open Client List help">?</button>
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
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'connected' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              Connected Clients ({clients.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('incoming')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'incoming' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
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

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Client List Help</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">Close</button>
            </div>
            <p className="text-sm text-slate-700 mb-3">This module is your central place for managing clients. It lets you invite new clients, review active and incoming clients, and track their statuses. Use the filters and tabs to switch between connected and incoming clients.</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>Active Clients: clients with existing connections.</li>
              <li>Pending Invites: waiting for client acceptance.</li>
              <li>Status filters to show/hide clients by Active, Pending, Expired, Inactive.</li>
              <li>Invite button opens the onboarding/invitation workflow.</li>
            </ul>
          </div>
        </div>
      )}

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
  return (
    <PageDocumentation
      title="Client Onboarding"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Clients / Client Onboarding"
      purpose="Client Onboarding provides a structured workflow for bringing new accounting clients onto the Haypbooks platform — from initial information collection through books setup, permissions configuration, and first-period closing. The onboarding module reduces the time-to-first-deliverable by eliminating ad-hoc setup tasks and ensuring nothing critical is missed. Each client gets a dedicated onboarding checklist that tracks completion status across all required steps."
      components={[
        { name: 'Onboarding Checklist', description: 'Per-client step-by-step checklist covering information gathering, books setup, access, and first deliverable.' },
        { name: 'Document Collection Form', description: 'Customizable intake form to collect entity info, prior-year financials, tax IDs, and authorization documents.' },
        { name: 'Chart of Accounts Import', description: "Tool to import or map the client's existing chart of accounts into Haypbooks standard structure." },
        { name: 'Access & Permissions Setup', description: "Guided setup of the client's user access, firm permissions, and data sharing settings." },
        { name: 'Onboarding Progress Dashboard', description: 'Aggregate view of all active client onboardings with completion percentage per client.' },
      ]}
      tabs={['Intake Form', 'Books Setup', 'Access Setup', 'First Close', 'Summary']}
      features={[
        'Guided step-by-step onboarding workflow per new client',
        'Collect client information via customizable intake forms',
        'Import or map client chart of accounts during onboarding',
        'Configure access permissions and data sharing during setup',
        'Track onboarding completion percentage across all new clients',
        'Assign onboarding tasks to specific team members',
      ]}
      dataDisplayed={[
        'Onboarding step completion status per client',
        'Client entity information collected via intake form',
        'Chart of accounts import status and mapping',
        'Access permissions configured during onboarding',
        'Days since onboarding started per client',
      ]}
      userActions={[
        'Start onboarding for a new client',
        'Complete and submit client intake form',
        'Import or map chart of accounts',
        'Configure client access permissions',
        'Mark onboarding complete and activate client',
      ]}
    />
  )
}


// ── 5. Client Documents ────────────────────────────────────────────────────────
function ClientDocumentsPanel() {
  return (
    <PageDocumentation
      title="Client Documents"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Clients / Client Documents"
      purpose="Client Documents is the centralized document management vault for all files exchanged with clients — including financial statements, tax returns, engagement letters, source documents, and client responses to information requests. Documents are organized by client and engagement year, with version control, access permissions, and an audit trail of who viewed or downloaded each file. The document vault supports direct client portal sharing so clients can access their files without emailing."
      components={[
        { name: 'Document Library', description: 'Hierarchical file browser organized by client > year > engagement type > document category.' },
        { name: 'Upload & Version Control', description: 'Drag-and-drop upload with automatic version history and change tracking per document.' },
        { name: 'Client Portal Sharing', description: 'Toggle to share selected documents with the client via the Client Portal with view/download permissions.' },
        { name: 'Request Tracker', description: 'shows outstanding document requests sent to clients with due dates and response status.' },
        { name: 'Document Search', description: 'Full-text search across all uploaded documents with filters by client, type, date, and tag.' },
      ]}
      tabs={['All Documents', 'By Client', 'Shared with Clients', 'Requested from Clients', 'Archived']}
      features={[
        'Organize all client documents in a structured filing system',
        'Maintain version history for all uploaded documents',
        'Share documents with clients via the Client Portal',
        'Track outstanding document requests to clients',
        'Search full text across all documents',
        'Set document access permissions per staff member',
      ]}
      dataDisplayed={[
        'Document name, type, and file size',
        'Client and engagement year',
        'Upload date and last modified date',
        'Version number and change history',
        'Shared-with-client status and download log',
      ]}
      userActions={[
        'Upload new documents via drag and drop',
        'Organize documents into client-year folders',
        'Share document with client portal',
        'Request document from client',
        'Download or preview document',
      ]}
    />
  )
}

// ── 6. Client CRM Leads ────────────────────────────────────────────────────────
function ClientCRMPanel() {
  return (
    <PageDocumentation
      title="Client CRM & Leads"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Clients / Client CRM"
      purpose="Client CRM & Leads is the relationship management and business development module for accounting firms, tracking prospects, proposals, won engagements, and active client relationship notes in one place. The CRM captures communication history, stores proposals and engagement letters, and maintains lifecycle status from lead through active client through inactive. Firms use it to manage their pipeline of prospective clients and ensure no follow-up falls through the cracks."
      components={[
        { name: 'Leads Pipeline Board', description: 'Kanban-style board organizing leads through stages: Prospect, Proposal Sent, Negotiation, Won, Lost.' },
        { name: 'Client Relationship Record', description: 'Per-client profile with contact history, notes, proposals, and engagement timeline.' },
        { name: 'Proposal Tracker', description: 'Tracks all proposals sent with status, value, submission date, and follow-up due date.' },
        { name: 'Follow-up Reminders', description: 'Scheduled follow-up tasks tied to leads or existing clients, with owner and due date.' },
        { name: 'Engagement History Timeline', description: 'Chronological record of all interactions, proposals, and engagements per client.' },
      ]}
      tabs={['Pipeline', 'Active Clients', 'Proposals', 'Follow-ups', 'Won/Lost Analysis']}
      features={[
        'Manage prospective client pipeline with kanban stages',
        'Track all proposals with status and expected close date',
        'Record and review interaction history per client',
        'Schedule follow-up reminders for prospects and clients',
        'Analyze win/loss rates by source, service type, or time period',
        'Convert won leads to active clients with one click',
      ]}
      dataDisplayed={[
        'Lead name, source, and pipeline stage',
        'Proposal value and submission date',
        'Last contact date and next follow-up scheduled',
        'Win/loss outcome and reason',
        'Relationship notes and communication history',
      ]}
      userActions={[
        'Add a new lead to the pipeline',
        'Move lead through pipeline stages',
        'Create and send a proposal',
        'Log an interaction note',
        'Convert a won lead to an active client',
      ]}
    />
  )
}

// ── 7. Communications ──────────────────────────────────────────────────────────
function CommunicationsPanel() {
  return (
    <PageDocumentation
      title="Communications"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Clients / Communications"
      purpose="Communications is the unified messaging hub for all firm-to-client and internal team communications within the practice — combining client messages, document exchange, task comments, and announcements in a single organized inbox. All communications are associated with their client record for easy retrieval, reducing reliance on external email for practice-related correspondence. The module supports read receipts, file attachments, and message threading to keep conversations structured."
      components={[
        { name: 'Unified Inbox', description: 'Consolidated view of all incoming messages from clients, sorted by recency and client.' },
        { name: 'Message Composer', description: 'Rich text message composer with file attachment, template insertion, and client recipient selector.' },
        { name: 'Thread View', description: 'Per-conversation thread showing all messages exchanged with a specific client on a topic.' },
        { name: 'Read Receipt Tracker', description: 'Shows which clients have read their most recent message or document notification.' },
        { name: 'Communication Templates', description: 'Pre-written message templates for common communications (e.g., document requests, engagement reminders).' },
      ]}
      tabs={['Inbox', 'Sent', 'By Client', 'Templates', 'Announcements']}
      features={[
        'Unified inbox for all client communications',
        'Send messages with file attachments directly from the hub',
        'Use templates for common client communications',
        'Track message read status per client',
        'View full conversation thread per client',
        'Search across all communications by client or keyword',
      ]}
      dataDisplayed={[
        'Message sender, recipient, and timestamp',
        'Attached files and document links',
        'Message read status and read time',
        'Thread subject and message count',
        'Template name used if applicable',
      ]}
      userActions={[
        'Reply to a client message',
        'Compose and send new message',
        'Attach documents to a message',
        'Use a communication template',
        'Mark conversation as resolved or archive it',
      ]}
    />
  )
}

// ── 8. Work Queue ──────────────────────────────────────────────────────────────
function WorkQueuePanel() {
  return (
    <PageDocumentation
      title="Work Queue"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Work Mgmt / Work Queue"
      purpose="Work Queue is the centralized task management board for all outstanding accounting work items across every client — including bookkeeping tasks, reconciliations, review items, client requests, and filing preparation tasks. Staff can view their assigned queue, update task status, log time, and coordinate handoffs. Practice managers see the aggregate queue to identify bottlenecks, reallocate work, and ensure nothing falls past its due date."
      components={[
        { name: 'Personal Work Queue', description: 'List of all tasks assigned to the currently logged-in staff member, sorted by priority and due date.' },
        { name: 'Team Work Queue', description: 'Manager view showing the full work queue across all staff with filter by assignee.' },
        { name: 'Priority Sorting', description: 'Color-coded priority tiers (Critical, High, Normal, Low) with drag-to-reorder within priority.' },
        { name: 'Time Logging', description: 'Inline time logging on each task showing estimated vs. actual hours with one-click timer start.' },
        { name: 'Task Status Pipeline', description: 'Kanban columns: To Do, In Progress, Blocked, Under Review, Completed.' },
      ]}
      tabs={['My Queue', 'Team Queue', 'Kanban Board', 'Completed']}
      features={[
        'View and manage all assigned work tasks in priority order',
        'Update task status without leaving the work queue',
        'Log billable time directly from each task in the queue',
        'Identify blocked tasks and reassign or escalate as needed',
        'Manager view shows full team queue and workload distribution',
        'Filter queue by client, task type, or due date range',
      ]}
      dataDisplayed={[
        'Task name, client, and type',
        'Assigned staff member',
        'Priority level and due date',
        'Status (To Do / In Progress / Blocked / Review / Done)',
        'Estimated and actual hours logged',
      ]}
      userActions={[
        'Update task status',
        'Log time on a task',
        'Reassign a task to another staff member',
        'Add a note or comment to a task',
        'Mark task complete',
      ]}
    />
  )
}

// ── 9. Monthly Close ───────────────────────────────────────────────────────────
function MonthlyClosePanel() {
  return (
    <PageDocumentation
      title="Monthly Close"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Work Mgmt / Monthly Close"
      purpose="Monthly Close is the structured workflow module for executing the period-end close process across all client books — covering bank reconciliation sign-off, journal entry review, trial balance check, and accounts reconciliation completion. Each client gets a dedicated monthly close checklist with required steps, responsible staff assignments, and due dates. The module aggregates completion status so managers can see which clients are closed and which are still in progress at any time."
      components={[
        { name: 'Close Progress Dashboard', description: "Aggregate view of all clients with this month's close status: Not Started, In Progress, In Review, Closed." },
        { name: 'Per-Client Close Checklist', description: 'Expandable checklist per client showing all required close steps with owner, status, and due date.' },
        { name: 'Reconciliation Sign-off', description: 'Linked sign-off interface for each bank account reconciliation within the close workflow.' },
        { name: 'Journal Entry Review Queue', description: 'List of pending journal entries awaiting review and approval before the period can be closed.' },
        { name: 'Close Lock', description: 'Lock button that prevents new transactions from being posted once the close is approved.' },
      ]}
      tabs={['Close Overview', 'Per-Client Close', 'Reconciliations', 'JE Review', 'Closed Periods']}
      features={[
        'Track monthly close status for all clients in one dashboard',
        'Run structured per-client close checklist to completion',
        'Sign off on bank reconciliations within the close workflow',
        'Review and approve journal entries before period close',
        'Lock closed periods to prevent retroactive posting',
        'Export close sign-off summary for each client',
      ]}
      dataDisplayed={[
        'Client name and close status for current period',
        'Close checklist step completion per client',
        'Bank reconciliation sign-off status',
        'Pending JEs awaiting review',
        'Close lock status per period',
      ]}
      userActions={[
        'Start monthly close for a client',
        'Complete and check off each close step',
        'Sign off on bank reconciliations',
        'Approve pending journal entries',
        'Lock the closed period',
      ]}
    />
  )
}

// ── 10. Annual Engagements ─────────────────────────────────────────────────────
function AnnualEngagementsPanel() {
  return (
    <PageDocumentation
      title="Annual Engagements"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Work Mgmt / Annual Engagements"
      purpose="Annual Engagements manages the major year-end and recurring annual service engagements for each client — including year-end audit or review, income tax return preparation, annual business registration renewal, and other year-end deliverables. Each engagement has a template-driven task list, a target completion date, assigned staff, and billing milestone tracking. The module ensures that all annual obligations for every client are planned, staffed, and delivered on time."
      components={[
        { name: 'Engagement List', description: 'Master list of all active annual engagements across clients with type, status, and due date.' },
        { name: 'Engagement Template Library', description: 'Pre-built task templates for common engagement types (year-end audit, tax prep, review engagement).' },
        { name: 'Engagement Timeline', description: 'Gantt-style timeline showing all engagement phases and milestones across clients.' },
        { name: 'Billing Milestones', description: 'Links billing milestones to engagement completion stages for progressive billing.' },
        { name: 'Staff Assignment Panel', description: 'Assign staff roles (preparer, reviewer, partner) to each engagement with workload visibility.' },
      ]}
      tabs={['All Engagements', 'By Type', 'Timeline', 'Billing Milestones', 'Completed']}
      features={[
        'Plan and manage all annual client engagements in one place',
        'Use engagement templates to generate task lists per engagement type',
        'Visualize engagement timelines across all clients on a Gantt chart',
        'Link billing milestones to engagement completion phases',
        'Assign staff roles to each engagement with workload balancing',
        'Track engagement completion percentage and flag overruns',
      ]}
      dataDisplayed={[
        'Engagement type and client name',
        'Engagement start and due date',
        'Assigned staff and role',
        'Completion percentage and status',
        'Billing milestone status',
      ]}
      userActions={[
        'Create a new annual engagement for a client',
        'Apply an engagement template',
        'Assign staff to an engagement',
        'Mark engagement milestone as complete',
        'Generate billing invoice from completed milestone',
      ]}
    />
  )
}

// ── 11. WIP Ledger ─────────────────────────────────────────────────────────────
function WIPLedgerPanel() {
  return (
    <PageDocumentation
      title="WIP Ledger"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Work Mgmt / WIP Ledger"
      purpose="Work-in-Progress (WIP) Ledger tracks the value of unbilled professional services time and expenses accumulated across all active client engagements — giving practice managers a real-time view of revenue recognized but not yet invoiced. The WIP ledger helps prevent billable time from being lost and informs billing decisions by showing when WIP balances have grown large enough to warrant an interim invoice. It also supports write-up and write-down adjustments before final billing."
      components={[
        { name: 'WIP Summary Table', description: 'Per-client WIP balance showing unbilled hours, value at standard rate, and age of oldest unbilled entry.' },
        { name: 'Entry-Level Drill-Down', description: 'Expand any client to see each individual unbilled time or expense entry with staff, date, and amount.' },
        { name: 'Write-Up / Write-Down', description: 'Adjustment tool to record approved WIP adjustments before billing (e.g., discounts, premium billing).' },
        { name: 'Billing Trigger Alert', description: "Configurable threshold that alerts when a client's WIP balance crosses a set dollar amount." },
        { name: 'WIP Aging Analysis', description: 'Aging table showing WIP by age bucket: current, 30–60 days, 60–90 days, 90+ days old.' },
      ]}
      tabs={['WIP Summary', 'Entry Detail', 'Aging', 'Write-ups/Downs']}
      features={[
        'Track unbilled time and expense value across all clients',
        'Drill into entry-level detail for any WIP balance',
        'Apply write-up or write-down adjustments to WIP before billing',
        'Alert when WIP balance crosses billing threshold',
        'Analyze WIP aging to identify stale unbilled entries',
        'Transfer approved WIP to invoice in one action',
      ]}
      dataDisplayed={[
        'Client WIP balance and entry count',
        'Oldest unbilled date per client',
        'WIP value at standard vs. actual rate',
        'Write-up/down adjustments applied',
        'WIP aging by bucket',
      ]}
      userActions={[
        'View WIP detail for a client',
        'Apply write-up or write-down adjustment',
        'Set billing threshold alert',
        'Transfer WIP to invoice',
        'Export WIP ledger report',
      ]}
    />
  )
}

// ── 12. Calendar ───────────────────────────────────────────────────────────────
function CalendarPanel() {
  return (
    <PageDocumentation
      title="Calendar"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Work Mgmt / Calendar"
      purpose="Calendar provides a unified view of all scheduled events across the practice — including client meetings, filing deadlines, team check-ins, staff time-off, and engagement milestones — displayed in a standard monthly, weekly, or daily calendar format. The practice calendar integrates with Google Calendar and Microsoft 365 for two-way sync, ensuring that external meetings appear alongside internal deadlines. Color coding distinguishes event types so staff can quickly identify the nature of each item."
      components={[
        { name: 'Multi-View Calendar', description: 'Month, week, and day view toggles showing all practice events in a standard calendar layout.' },
        { name: 'Event Type Color Coding', description: 'Color legend distinguishing deadlines (red), meetings (blue), milestones (green), and PTO (gray).' },
        { name: 'Client Meeting Scheduler', description: 'Book a client meeting directly with optional video conferencing link and agenda attachment.' },
        { name: 'External Calendar Sync', description: 'Two-way sync with Google Calendar and Microsoft 365 to show external events on the practice calendar.' },
        { name: 'Deadline Overlay', description: 'Toggle to overlay all filing deadlines from the Deadline Tracker onto the calendar view.' },
      ]}
      tabs={['Month View', 'Week View', 'Day View', 'My Events', 'Deadlines Overlay']}
      features={[
        'Unified calendar view across all practice events and deadlines',
        'Book client meetings with video conferencing links',
        'Sync with Google Calendar and Microsoft 365',
        'Overlay filing deadlines on the calendar',
        'View team availability to find meeting windows',
        'Export calendar to PDF or subscribe via iCal link',
      ]}
      dataDisplayed={[
        'Event name, type, and date/time',
        'Attendees and location',
        'Client and engagement association',
        'Filing deadline dates overlaid on calendar',
        'Staff time-off periods',
      ]}
      userActions={[
        'Book a new client meeting',
        'Toggle deadline overlay on/off',
        'Connect Google or Microsoft 365 calendar',
        'View team availability for a day',
        'Export calendar or share iCal link',
      ]}
    />
  )
}

// ── 13. Books Review ───────────────────────────────────────────────────────────
function BooksReviewPanel() {
  return (
    <PageDocumentation
      title="Books Review"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Books Review"
      purpose="Books Review is the accountant's primary workspace for reviewing a client's accounting records for accuracy, completeness, and GAAP compliance — providing a structured checklist-driven review interface that surfaces flagged transactions, coding anomalies, and reconciliation gaps. The review workflow ensures all items are investigated and resolved before the period is cleared, with sign-off capability at each review step. All review notes and exceptions are recorded for the audit trail."
      components={[
        { name: 'Review Checklist', description: 'Step-by-step review checklist covering every major account category with pass/fail and note fields.' },
        { name: 'Anomaly Detection Feed', description: 'Auto-generated list of transactions flagged by the system as unusual (new vendors, duplicate amounts, round numbers).' },
        { name: 'Uncategorized Transactions', description: 'List of transactions mapped to suspense or default accounts requiring proper coding.' },
        { name: 'Balance vs. Prior Period', description: 'Side-by-side GL account balance comparison to the prior period for variance identification.' },
        { name: 'Sign-off Panel', description: 'Digital sign-off on completed review with staff name, date, and optional manager counter-sign.' },
      ]}
      tabs={['Checklist', 'Anomalies', 'Uncategorized', 'Balance Comparison', 'Sign-off']}
      features={[
        'Structured checklist-driven review of client books',
        'Surface anomalies and unusual transactions automatically',
        'Identify and recode uncategorized transactions',
        'Compare account balances to prior period for variance analysis',
        'Digital sign-off on completed review steps',
        'Export review findings as a client communication',
      ]}
      dataDisplayed={[
        'Review checklist step completion status',
        'Flagged anomalies with description and amount',
        'Uncategorized transaction count and total value',
        'Account balance vs. prior period variance',
        'Review sign-off with staff and date',
      ]}
      userActions={[
        'Work through review checklist step by step',
        'Investigate and clear anomaly flags',
        'Recode uncategorized transactions',
        'Leave review notes on specific items',
        'Sign off on completed review',
      ]}
    />
  )
}

// ── 14. Reconciliation Hub ─────────────────────────────────────────────────────
function ReconciliationHubPanel() {
  return (
    <PageDocumentation
      title="Reconciliation Hub"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Reconciliation Hub"
      purpose="Reconciliation Hub is the centralized workspace for managing all bank and balance sheet account reconciliations across every client, with a Kanban-style status board showing which reconciliations are pending, in progress, in review, or signed off. Staff can open any reconciliation directly from this hub and return to the hub view when done. The hub supports variance tracking, reviewer assignment, and bulk sign-off for firms managing large client portfolios."
      components={[
        { name: 'Reconciliation Kanban Board', description: 'Status columns (To Do, In Progress, In Review, Signed Off) with client-account cards.' },
        { name: 'Variance Summary', description: 'Summary of all reconciliations with outstanding variances above a configurable threshold.' },
        { name: 'Assigned Tasks View', description: 'Filter to show only reconciliations assigned to the current staff member.' },
        { name: 'Sign-off Tracker', description: "Aggregate sign-off status showing how many of this period's reconciliations are fully signed off." },
        { name: 'Client Filter', description: 'Narrow the hub view to a single client or a select group of clients.' },
      ]}
      tabs={['All Reconciliations', 'My Assignments', 'Pending Variances', 'Signed Off']}
      features={[
        'Manage all client reconciliations from a single hub view',
        'Kanban board shows real-time status of every reconciliation',
        'Track and resolve outstanding variances',
        'Assign reconciliations to specific staff members',
        'Bulk sign off on completed reconciliations',
        'Filter by client, assignee, or status',
      ]}
      dataDisplayed={[
        'Client and account name per reconciliation',
        'Reconciliation status in Kanban stage',
        'Outstanding variance amount',
        'Assigned staff member',
        'Sign-off status and approver',
      ]}
      userActions={[
        'Open a reconciliation to work on it',
        'Assign reconciliation to a team member',
        'Flag variance for partner attention',
        'Sign off on completed reconciliation',
        'Filter to client or staff view',
      ]}
    />
  )
}

// ── 15. Adjusting Entries ──────────────────────────────────────────────────────
function AdjustingEntriesPanel() {
  return (
    <PageDocumentation
      title="Adjusting Entries"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Adjusting Entries"
      purpose="Adjusting Entries provides a dedicated workspace for accountants to create, review, and post period-end adjusting journal entries across client books — including accruals, deferrals, depreciation, prepayments, and correction entries. The module includes a template bank for common adjusting entry patterns, an auto-reversal scheduler for accrual reversals in the next period, and a review queue so partners can approve proposed adjustments before they are posted."
      components={[
        { name: 'Entry List', description: 'Table of all adjusting entries for the period with type, amount, status, and posting date.' },
        { name: 'Entry Form', description: 'Journal entry form for creating new adjusting entries with debit/credit lines and memo.' },
        { name: 'Template Bank', description: 'Library of pre-built adjusting entry templates for common period-end entry patterns.' },
        { name: 'Reversal Scheduler', description: 'Set automatic reversal date for accrual entries so they reverse in the next period.' },
        { name: 'Approval Queue', description: 'Entries submitted for review before posting, with approve/reject workflow for partners.' },
      ]}
      tabs={['All Entries', 'Pending Review', 'Templates', 'Auto-Reversals', 'Posted']}
      features={[
        'Create adjusting journal entries from scratch or from templates',
        'Schedule automatic reversals for accrual entries',
        'Submit entries for partner review and approval',
        "Post approved adjusting entries to the client's books",
        'Track all adjusting entries for the period with audit trail',
        'Export adjusting entry summary for working paper file',
      ]}
      dataDisplayed={[
        'Entry type and description',
        'Debit and credit accounts and amounts',
        'Approval status and approver name',
        'Auto-reversal date if scheduled',
        'Posting status and posted date',
      ]}
      userActions={[
        'Create new adjusting entry',
        'Apply template to create common entry',
        'Set reversal date for an accrual',
        'Submit entry for approval',
        'Post approved entry to books',
      ]}
    />
  )
}

// ── 16. Client Requests ────────────────────────────────────────────────────────
function ClientRequestsPanel() {
  return (
    <PageDocumentation
      title="Client Requests"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Client Requests"
      purpose="Client Requests is the structured document-request management system that replaces ad-hoc email chasing — allowing accountants to create itemized requests, send them to clients via the portal, track responses, and receive documents directly into the client's document vault. Each request has a due date, priority level, and status indicator, and automated reminders can be configured to nudge clients who haven't responded within a set number of days."
      components={[
        { name: 'Request Queue', description: 'Table of all open client requests with client, items requested, due date, and response status.' },
        { name: 'Request Composer', description: 'Create a new request with a checklist of required items, instructions, due date, and priority.' },
        { name: 'Response Tracker', description: 'Shows which items in each request have been fulfilled, partially fulfilled, or still outstanding.' },
        { name: 'Document Intake', description: "Fulfilled items are automatically saved to the client's document vault with the request reference." },
        { name: 'Reminder Configuration', description: "Set automatic follow-up reminders if client hasn't responded within N days." },
      ]}
      tabs={['Open Requests', 'Awaiting Response', 'Fulfilled', 'Overdue']}
      features={[
        'Create structured document requests with itemized checklists',
        'Send requests to clients via the client portal',
        'Automatically receive fulfilled documents into the document vault',
        'Track per-item fulfillment status for each request',
        'Configure automatic reminders for overdue requests',
        'View all outstanding requests across all clients in one place',
      ]}
      dataDisplayed={[
        'Request subject and client name',
        'List of requested items and their status',
        'Request sent date and due date',
        'Days since last client activity on the request',
        'Fulfilled vs. outstanding item count',
      ]}
      userActions={[
        'Create a new client request',
        'Add items to an existing request',
        'Send request to client portal',
        'Mark a request item as fulfilled',
        'Set automatic reminder interval',
      ]}
    />
  )
}

// ── 17. Financial Statements ───────────────────────────────────────────────────
function FinancialStatementsPanel() {
  return (
    <PageDocumentation
      title="Financial Statements"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Financial Statements"
      purpose="Financial Statements generates draft financial statement packages for clients directly from their Haypbooks books — including the income statement, balance sheet, statement of cash flows, and accompanying notes. The module supports standard presentation formats (GAAP, IFRS, PFRS for SMEs) and allows accountants to customize layout, apply statement-level rounding, and add disclosure notes before issuing the statements to clients."
      components={[
        { name: 'Statement Generator', description: 'Pulls GL data to generate the full financial statement set for the selected period.' },
        { name: 'Format Selector', description: 'Choose statement presentation: GAAP, IFRS, PFRS for SMEs, or custom.' },
        { name: 'Notes Editor', description: 'Rich text editor for adding or customizing disclosure notes appended to each statement.' },
        { name: 'Comparative Columns', description: 'Toggle to add prior period or budget comparison columns.' },
        { name: 'Issuance & Distribution', description: 'Send finalized statements to client portal or generate PDF for distribution.' },
      ]}
      tabs={['Income Statement', 'Balance Sheet', 'Cash Flows', 'Notes', 'Issuance']}
      features={[
        'Generate full financial statement package from books',
        'Choose GAAP, IFRS, or PFRS presentation format',
        'Add and edit disclosure notes per statement',
        'Include comparative period or budget columns',
        'Issue finalized statements to client portal',
        'Export statements as PDF for distribution',
      ]}
      dataDisplayed={[
        'Statement period and basis of accounting',
        'Revenue, expense, and net income figures',
        'Asset, liability, and equity balances',
        'Cash flow components (operating, investing, financing)',
        'Notes content and disclosure items',
      ]}
      userActions={[
        'Select period and generate statements',
        'Choose presentation format',
        'Edit disclosure notes',
        'Toggle comparative columns',
        'Issue and send finalized statements to client',
      ]}
    />
  )
}

// ── 18. Management Reports ─────────────────────────────────────────────────────
function ManagementReportsPanel() {
  return (
    <PageDocumentation
      title="Management Reports"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Management Reports"
      purpose="Management Reports generates formatted management reporting packages — including KPI dashboards, budget vs. actual analyses, department P&Ls, and cash flow forecasts — tailored for the client's management team rather than for statutory purposes. These reports use the client's own GL data but present it in a business-friendly format with charts, commentary boxes, and summary tables suitable for board meetings and investor updates."
      components={[
        { name: 'Report Template Library', description: 'Pre-built management report templates covering P&L, KPI dashboard, variance analysis, and cash flow.' },
        { name: 'Chart Builder', description: 'Drag-in revenue, expense, or KPI metric charts to include in the report package.' },
        { name: 'Commentary Section', description: 'Free-text commentary blocks where accountants can add narrative alongside the numbers.' },
        { name: 'Budget vs. Actual', description: 'Side-by-side comparison table of budget vs. actuals with variance % highlighted.' },
        { name: 'Distribution Workflow', description: 'Schedule and send management reports to defined recipient lists on a recurring basis.' },
      ]}
      tabs={['Report Templates', 'Report Builder', 'Budget vs. Actual', 'Distribution']}
      features={[
        'Generate management reports from templates or custom layouts',
        'Include visual charts and KPI metrics in report packages',
        'Add narrative commentary alongside financial data',
        'Compare actuals to budget with variance highlights',
        'Schedule recurring report delivery to client management',
        'Export management report package as PDF or Excel',
      ]}
      dataDisplayed={[
        'Report period and template used',
        'Revenue and expense metrics vs. budget',
        'KPI chart data and trend indicators',
        'Commentary text sections',
        'Distribution list and delivery schedule',
      ]}
      userActions={[
        'Select or create a management report template',
        'Add charts and metrics to the report',
        'Write commentary for each section',
        'Compare to budget',
        'Send report to client management',
      ]}
    />
  )
}

// ── 19. Tax Reports ────────────────────────────────────────────────────────────
function TaxReportsPanel() {
  return (
    <PageDocumentation
      title="Tax Reports"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Tax Reports"
      purpose="Tax Reports provides accountants with quick access to generate client-facing tax summary reports — including VAT/GST filing summaries, withholding tax reports, income tax computations, and annual tax position summaries — directly from the client's Haypbooks books. These reports are formatted for client presentation and can be shared via the client portal or exported as supporting schedules for tax return preparation."
      components={[
        { name: 'Tax Report Selector', description: 'Dropdown to choose the type of tax report: VAT summary, withholding, income tax, or custom.' },
        { name: 'Period Picker', description: 'Select the reporting period (monthly, quarterly, annual) for the tax report.' },
        { name: 'Computation Preview', description: 'Preview the computed tax report before finalizing and issuing to the client.' },
        { name: 'Client Portal Share', description: 'Share completed tax reports with the client directly through the client portal.' },
        { name: 'Export Options', description: 'Export report as PDF or Excel for use as a supporting schedule in tax return preparation.' },
      ]}
      tabs={['VAT/GST Summary', 'Withholding Tax', 'Income Tax', 'Annual Summary']}
      features={[
        'Generate tax reports from client books for any period',
        'Preview computation before issuing to client',
        'Share tax reports via client portal',
        'Export as PDF or Excel supporting schedule',
        'Cover VAT, withholding, income tax, and annual summary formats',
        'Use as supporting schedule for return preparation',
      ]}
      dataDisplayed={[
        'Tax report type and period',
        'Tax computed and source transaction count',
        'Client name and entity type',
        'Report generated date',
        'Share status with client portal',
      ]}
      userActions={[
        'Select tax report type and period',
        'Preview computed report',
        'Adjust or override computed figures if needed',
        'Share report to client portal',
        'Export as PDF or Excel',
      ]}
    />
  )
}

// ── 20. Practice Profile ───────────────────────────────────────────────────────
function PracticeProfilePanel() {
  return (
    <PageDocumentation
      title="Practice Profile"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Settings / Practice Profile"
      purpose="Practice Profile stores and manages the core identity and branding settings for the accounting practice — including the firm name, logo, contact information, registered address, website, professional license numbers, and the default signature and letterhead used on client-facing documents. This information populates across all firm-branded outputs such as invoices, financial statements, engagement letters, and email communications."
      components={[
        { name: 'Firm Identity Fields', description: 'Firm name, legal name, logo upload, tagline, and company description.' },
        { name: 'Contact Information', description: 'Principal email, phone, fax, website URL, and registered address.' },
        { name: 'Professional Credentials', description: 'Fields for CPA license number, registration authority, PCAOB or equivalent body membership.' },
        { name: 'Letterhead & Signature Defaults', description: 'Upload letterhead template and default partner signature image for document outputs.' },
        { name: 'Practice Timezone & Currency', description: "Set the practice's operating timezone and default reporting currency." },
      ]}
      tabs={['Firm Identity', 'Contact Info', 'Credentials', 'Branding', 'Regional Settings']}
      features={[
        'Store firm name, logo, and legal identity information',
        'Manage contact details used across all client communications',
        'Record professional license and registration credentials',
        'Upload letterhead and signature for document outputs',
        'Set timezone and default currency for the practice',
        'Changes propagate to all firm-branded documents automatically',
      ]}
      dataDisplayed={[
        'Firm legal name and trading name',
        'Logo and letterhead images',
        'Contact email, phone, and address',
        'Professional license numbers',
        'Timezone and default currency setting',
      ]}
      userActions={[
        'Update firm name or logo',
        'Upload letterhead and signature',
        'Edit contact information',
        'Add professional credentials',
        'Set timezone and default currency',
      ]}
    />
  )
}

// ── 21. Team Management ────────────────────────────────────────────────────────
function TeamManagementPanel() {
  return (
    <PageDocumentation
      title="Team Management"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Settings / Team Management"
      purpose="Team Management is the administrative panel for managing all staff accounts within the practice — inviting new team members, assigning roles and permissions, managing access levels by functional area, and deactivating departed staff. Roles are defined at the practice level (e.g., Partner, Manager, Senior, Junior, Admin) and each role carries a default access permissions set that can be further customized per person. An audit log captures all access-level changes."
      components={[
        { name: 'Staff Directory', description: 'List of all active and inactive staff with role, email, last login, and access status.' },
        { name: 'Invite Staff', description: 'Send email invitation to new staff with a role assignment and pre-populated access defaults.' },
        { name: 'Role Manager', description: 'Define and customize role-based access permission sets for the practice.' },
        { name: 'Per-Person Access Override', description: 'Adjust individual access permissions beyond the role default for special cases.' },
        { name: 'Deactivation Workflow', description: 'Deactivate departing staff with access revocation confirmation and audit trail.' },
      ]}
      tabs={['Staff Directory', 'Invite Staff', 'Roles & Permissions', 'Access Overrides', 'Audit Log']}
      features={[
        'Invite new staff to the practice with role assignment',
        'Manage role-based access permissions across the team',
        'Apply per-person access overrides beyond role defaults',
        'Deactivate departed staff and revoke access',
        'Review audit log of all permission changes',
        'View staff last login and account status',
      ]}
      dataDisplayed={[
        'Staff name, role, and email',
        'Last login date and account status (active/inactive)',
        'Role permissions assigned',
        'Individual access overrides applied',
        'Access change audit log entries',
      ]}
      userActions={[
        'Invite a new team member',
        "Change a staff member's role",
        'Customize individual access permissions',
        'Deactivate a staff member',
        'Review the access change audit log',
      ]}
    />
  )
}

// ── 24. Templates ──────────────────────────────────────────────────────────────
function TemplatesPanel() {
  return (
    <PageDocumentation
      title="Templates"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Settings / Templates"
      purpose="Templates manages the practice's reusable document and workflow templates — including engagement letter templates, management report layouts, client request templates, recurring work checklists, and email communication templates. By maintaining a central template library, the practice ensures consistency and quality across all client-facing outputs while reducing the time staff spend creating recurring documents from scratch."
      components={[
        { name: 'Template Library', description: 'Categorized list of all templates: Engagement Letters, Reports, Requests, Checklists, Emails.' },
        { name: 'Template Editor', description: 'Rich-text editor for creating and editing templates with variable placeholders (<<ClientName>>, <<Date>>, etc.).' },
        { name: 'Variable Placeholders', description: 'Merge field library showing all available placeholders that auto-fill from client and engagement data.' },
        { name: 'Template Version History', description: 'Prior versions of each template preserved for reference or rollback.' },
        { name: 'Template Assignment', description: 'Link templates to specific client types, engagement types, or staff roles for easy discovery.' },
      ]}
      tabs={['All Templates', 'Engagement Letters', 'Reports', 'Checklists', 'Emails']}
      features={[
        'Maintain a central library of reusable templates',
        'Edit templates with variable placeholders for auto-fill',
        'Categorize templates by type and assigned use case',
        'Preserve version history with rollback option',
        'Link templates to client or engagement types',
        'Ensure consistent quality across all client-facing outputs',
      ]}
      dataDisplayed={[
        'Template name, type, and category',
        'Variable placeholders used per template',
        'Last modified date and by whom',
        'Template version history entries',
        'Client/engagement type assignments',
      ]}
      userActions={[
        'Create a new template with placeholders',
        'Edit an existing template',
        'Preview a template with sample data',
        'Restore a prior version of a template',
        'Link template to a client or engagement type',
      ]}
    />
  )
}

// ── 25. Setup Center ───────────────────────────────────────────────────────────
function SetupCenterPanel() {
  return (
    <PageDocumentation
      title="Setup Center"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Home / Setup Center"
      purpose="Setup Center is the guided onboarding and configuration hub for new accounting firms getting started with Haypbooks Practice. It presents a step-by-step checklist of essential setup tasks — adding team members, connecting the first client, configuring billing, setting up templates, and integrating external tools — with progress tracking so nothing falls through the cracks. Setup Center also surfaces recommended configuration improvements for established firms."
      components={[
        { name: 'Setup Progress Tracker', description: 'Visual progress bar and checklist showing how many setup steps are complete vs. remaining.' },
        { name: 'Step-by-Step Wizard Cards', description: 'Expandable cards for each setup step with instructions, a CTA button, and completion status.' },
        { name: 'Quick Wins Panel', description: 'High-impact, low-effort configuration improvements ranked by time saved.' },
        { name: 'Integration Checklist', description: 'Status of recommended third-party integrations (accounting software, email, calendar, etc.).' },
        { name: 'Setup Completion Certificate', description: 'Displayed when all critical setup steps are complete, with a link to the practice dashboard.' },
      ]}
      tabs={['Essential Setup', 'Team Setup', 'Client Setup', 'Integrations', 'Templates']}
      features={[
        'Step-by-step guided setup for all critical practice hub features',
        'Track setup progress with visual completion indicators',
        'See quick-win configuration improvements recommended for your practice',
        'Check status of all recommended integrations',
        'Complete setup on any device with progress persisted across sessions',
        'Revisit any setup step to update existing configuration',
      ]}
      dataDisplayed={[
        'Total setup progress percentage',
        'List of completed and pending setup steps',
        'Integration connection status per service',
        'Recommended configuration improvements with estimated time impact',
        'Setup completion date per step',
      ]}
      userActions={[
        'Click any setup card to begin that step',
        'Mark a step as complete or skip it',
        'Launch guided setup wizard for complex steps',
        'Connect third-party integrations from setup checklist',
        'Revisit completed steps to update configuration',
      ]}
    />
  )
}

// ── 26. Client Portal ──────────────────────────────────────────────────────────
function ClientPortalPanel() {
  return (
    <PageDocumentation
      title="Client Portal"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Clients / Client Portal"
      purpose="Client Portal is the secure, branded self-service web portal that accounting firm clients log in to — allowing them to view their financial reports, download documents, respond to information requests, and communicate with their accountant, all without needing direct access to Haypbooks itself. The portal is white-labeled to reflect the accounting firm's brand and can be customized with the firm logo, color scheme, and welcome message. Firm administrators control exactly what each client can see and do within their portal."
      components={[
        { name: 'Portal Preview', description: 'Live preview of what the client sees when they log into their practice portal.' },
        { name: 'Branding Configuration', description: 'Upload firm logo, set primary color, and customize the portal welcome message and footer.' },
        { name: 'Per-Client Access Controls', description: 'Configure exactly what documents, reports, and features each client can access in their portal.' },
        { name: 'Portal Activity Log', description: 'Log of all client portal logins, document views, downloads, and form submissions.' },
        { name: 'Invitation Management', description: 'Send, resend, and revoke client portal invitations with expiry date management.' },
      ]}
      tabs={['Portal Settings', 'Branding', 'Client Access', 'Activity Log', 'Invitations']}
      features={[
        'Branded self-service portal for clients to access their financial information',
        'Control exactly what reports and documents each client can view',
        'Track all client portal activity with a complete audit log',
        'Send and manage portal access invitations per client',
        'Receive client responses to requests directly within portal',
        'White-label portal with firm name, logo, and colors',
      ]}
      dataDisplayed={[
        'Portal login activity and last access per client',
        'Documents shared with each client in the portal',
        'Client responses to information requests',
        'Branding settings (logo, colors, welcome text)',
        'Portal invitation status per client',
      ]}
      userActions={[
        'Preview the client portal experience',
        'Update firm branding on the portal',
        'Configure client-specific access permissions',
        'Send portal access invitation to a client',
        'View client activity log',
      ]}
    />
  )
}

// ── 27. Expert Help ────────────────────────────────────────────────────────────
function ExpertHelpPanel() {
  return (
    <PageDocumentation
      title="Expert Help"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Expert Help"
      purpose="Expert Help connects accounting firm staff with specialized Haypbooks-certified experts for on-demand consultation on complex accounting, tax, or software questions — providing access to the knowledge base needed to handle unusual client situations without leaving the practice hub. Staff can book one-on-one expert sessions, ask questions via live chat, or post to the expert community board for peer-sourced answers. All sessions are documented for later reference."
      components={[
        { name: 'Expert Directory', description: 'Searchable list of available experts with specialization, rating, availability, and hourly rate.' },
        { name: 'Session Scheduler', description: 'Calendar-based booking system to book a one-on-one consultation with a selected expert.' },
        { name: 'Live Chat Widget', description: 'Instant messaging channel for quick questions to an available expert without a full booking.' },
        { name: 'Community Q&A Board', description: 'Peer community board where staff can post questions and receive answers from the expert community.' },
        { name: 'Session History', description: 'Log of all past expert sessions with summary, recommendations, and any attached documents.' },
      ]}
      tabs={['Find Expert', 'Book Session', 'Live Chat', 'Community Q&A', 'My Sessions']}
      features={[
        'Browse and book certified accounting experts for consultation',
        'Ask quick questions via live chat without a full booking',
        'Post to community Q&A to get peer-sourced answers',
        'Review past session notes and expert recommendations',
        'Access specialist expertise for complex client scenarios',
        'Rate expert sessions to maintain quality of the directory',
      ]}
      dataDisplayed={[
        'Expert name, specialization, and rating',
        'Expert availability and hourly rate',
        'Session topic, date, and duration',
        'Live chat response time indicator',
        'Community Q&A post status and answers',
      ]}
      userActions={[
        'Search for an expert by specialization',
        'Book a consultation session',
        'Start a live chat with an expert',
        'Post a question to the community board',
        'Review summary from a past session',
      ]}
    />
  )
}

// ── Invoice Generation ────────────────────────────────────────────────────────
function InvoiceGenerationPanel() {
  return (
    <PageDocumentation
      title="Invoice Generation"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Billing / Invoice Generation"
      purpose="Invoice Generation is the accountant-side invoice creation center for drafting and issuing professional services invoices to clients — supporting flat fee, hourly billing from the WIP ledger, milestone billing, and retainer draw-down formats. Invoices are generated from the firm's branded template and can include time detail line items, engagement references, and custom notes before being issued to the client portal or sent by email."
      components={[
        { name: 'Invoice Composer', description: 'Form-based invoice builder with line items, descriptions, amounts, taxes, and a memo field.' },
        { name: 'Pull from WIP', description: 'Import approved WIP time and expense entries as invoice line items with one click.' },
        { name: 'Billing Format Selector', description: 'Choose billing format: flat fee, time-and-materials, retainer draw, or fixed milestone.' },
        { name: 'Template & Branding', description: 'Apply firm-branded invoice template with logo, terms, and payment instructions.' },
        { name: 'Send & Delivery Options', description: 'Issue invoice to client portal, email directly, or download as PDF.' },
      ]}
      tabs={['Create Invoice', 'Pull from WIP', 'Drafts', 'Preview']}
      features={[
        'Create professional services invoices with line item detail',
        'Auto-populate line items from approved WIP ledger entries',
        'Choose flat fee, time-and-materials, retainer, or milestone billing',
        'Apply firm-branded template with custom terms and payment instructions',
        'Issue invoice to client portal, send by email, or export as PDF',
        'Save invoice as draft and return to edit before issuing',
      ]}
      dataDisplayed={[
        'Client name and invoice number',
        'Invoice line items with description and amount',
        'Tax amount and total due',
        'Payment terms and due date',
        'Delivery status (portal/email/PDF)',
      ]}
      userActions={[
        'Create new invoice from scratch',
        'Pull WIP entries as line items',
        'Choose billing format',
        'Preview invoice before issuing',
        'Issue invoice to client',
      ]}
    />
  )
}

// ── Rate Cards ────────────────────────────────────────────────────────────────
function RateCardsPanel() {
  return (
    <PageDocumentation
      title="Rate Cards"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Billing / Rate Cards"
      purpose="Rate Cards manages the firm's billing rate structure — defining standard hourly rates by staff level (junior, senior, manager, partner), engagement-specific negotiated rates, and volume-based pricing tiers. Each client engagement can be assigned a specific rate card so that WIP is automatically valued at the correct billable rate. Rate card history is maintained so that historical billing accuracy is preserved when rates are updated."
      components={[
        { name: 'Rate Card Library', description: 'All active rate cards with name, type (standard/client-specific), and rate tiers.' },
        { name: 'Rate Card Builder', description: 'Create a new rate card with staff-level tiers, effective date, and client/engagement assignment.' },
        { name: 'Client Assignment', description: 'Link a rate card to a specific client or engagement to override the standard rates.' },
        { name: 'Rate History', description: 'View past rate card versions with effective date ranges for historical billing accuracy.' },
        { name: 'Rate Card Analytics', description: 'Analysis of effective billing rates vs. standard across clients and engagements.' },
      ]}
      tabs={['All Rate Cards', 'Standard Rates', 'Client-Specific', 'Rate History']}
      features={[
        'Define and manage billing rate cards by staff level',
        'Create client-specific or engagement-specific rate overrides',
        'Assign rate cards to clients and engagements',
        'Maintain rate history for accurate historical billing',
        'Analyze effective billing rates vs. standard across practice',
        'Update rates with effective date to preserve past billing',
      ]}
      dataDisplayed={[
        'Rate card name and type',
        'Staff level and hourly rate per tier',
        'Client or engagement assignment',
        'Effective date range',
        'Last updated date and updated by',
      ]}
      userActions={[
        'Create a new rate card',
        'Assign rate card to client or engagement',
        'Update rates with a new effective date',
        'View rate card history',
        'Compare effective vs. standard rates',
      ]}
    />
  )
}

// ── Subscriptions ─────────────────────────────────────────────────────────────
function SubscriptionsPanel() {
  return (
    <PageDocumentation
      title="Subscriptions"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Billing / Subscriptions"
      purpose="Subscriptions manages the practice's software subscription billing for clients who are billed for their Haypbooks seat as part of the firm's client services package — tracking active subscriptions, plan tiers, per-client subscription fees, and renewal dates. The module helps practices that resell or bundle software access to manage their subscription revenue and ensure that billing accurately reflects the subscription arrangement with each client."
      components={[
        { name: 'Subscription Register', description: 'List of all active client subscriptions with plan tier, monthly fee, and renewal date.' },
        { name: 'Plan Tier Manager', description: 'Define and manage the plan tiers offered to clients (e.g., Starter, Professional, Enterprise).' },
        { name: 'Billing Integration', description: 'Links each subscription to recurring billing so subscription fees are automatically invoiced.' },
        { name: 'Renewal Alerts', description: 'Automated alerts ahead of subscription renewal dates for review or renegotiation.' },
        { name: 'Subscription Analytics', description: 'Monthly recurring revenue (MRR) summary by client and plan tier.' },
      ]}
      tabs={['Active Subscriptions', 'Plan Tiers', 'Upcoming Renewals', 'MRR Analytics']}
      features={[
        'Track all client software subscriptions with fee and renewal date',
        'Define and manage billing plan tiers',
        'Link subscriptions to recurring billing for automated invoicing',
        'Receive renewal alerts before subscriptions expire',
        'Monitor monthly recurring revenue by plan tier',
        'Update subscription tier when client plan changes',
      ]}
      dataDisplayed={[
        'Client name and subscription plan tier',
        'Monthly or annual subscription fee',
        'Subscription start and renewal date',
        'Billing integration status',
        'Total MRR across all active subscriptions',
      ]}
      userActions={[
        'Add a new client subscription',
        'Update a client plan tier',
        'Link subscription to recurring billing',
        'View MRR analytics',
        'Process subscription renewal or cancellation',
      ]}
    />
  )
}

// ── 29. Billing: Invoice List ──────────────────────────────────────────────────
function InvoiceListPanel() {
  return (
    <PageDocumentation
      title="Invoice List"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Billing / Invoice List"
      purpose="Invoice List is the full accounts receivable register for the practice — showing all issued invoices across every client with their amount, due date, payment status, and outstanding balance. The list supports filtering by client, status, date range, and amount, and provides aging analysis to identify overdue accounts requiring attention. From the invoice list, accountants can record manual payments, send payment reminders, and issue credit notes."
      components={[
        { name: 'Invoice Register Table', description: 'Paginated table of all invoices with number, client, amount, due date, status, and balance.' },
        { name: 'Status Filter Bar', description: 'Quick filter tabs: All, Draft, Issued, Partially Paid, Paid, Overdue, Voided.' },
        { name: 'Invoice Aging Widget', description: 'Summary of outstanding invoices bucketed by aging: current, 30, 60, 90+ days overdue.' },
        { name: 'Record Payment', description: 'Manual payment entry form to record a client payment against an outstanding invoice.' },
        { name: 'Payment Reminder', description: 'Send payment reminder email or portal notification to clients with overdue invoices.' },
      ]}
      tabs={['All Invoices', 'Overdue', 'Drafts', 'Paid', 'Aging Summary']}
      features={[
        'View all issued invoices across all clients in one register',
        'Filter invoices by status, client, date range, or amount',
        'See aging summary of outstanding AR balances',
        'Record manual payments against issued invoices',
        'Send payment reminders to clients with overdue invoices',
        'Void or credit an invoice with automatic AR adjustment',
      ]}
      dataDisplayed={[
        'Invoice number and client name',
        'Invoice amount and outstanding balance',
        'Invoice date and due date',
        'Payment status and last payment date',
        'Days outstanding and aging bucket',
      ]}
      userActions={[
        'Filter invoice list by status or client',
        'Record a payment against an invoice',
        'Send payment reminder to client',
        'Void or credit an invoice',
        'Download invoice list as CSV or PDF',
      ]}
    />
  )
}

// ── 30. Billing: Recurring Billing ─────────────────────────────────────────────
function RecurringBillingPanel() {
  return (
    <PageDocumentation
      title="Recurring Billing"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Billing / Recurring Billing"
      purpose="Recurring Billing automates the generation and delivery of fixed-fee monthly billing for clients on recurring service agreements — eliminating the need to manually create the same invoice every month. Each recurring billing schedule defines the frequency, amount, billing day, client, and delivery method. The system auto-generates and optionally auto-issues invoices on schedule, with a review queue for firms that prefer to review before sending."
      components={[
        { name: 'Recurring Schedule List', description: 'All active recurring billing schedules with client, amount, frequency, and next billing date.' },
        { name: 'Schedule Builder', description: 'Create a new recurring schedule with frequency (monthly/quarterly/annual), amounts, and start date.' },
        { name: 'Auto-Issue Toggle', description: 'Option to auto-issue invoices on schedule or hold them in a review queue.' },
        { name: 'Next Billing Preview', description: 'Preview the next scheduled invoice generation batch before it runs.' },
        { name: 'Pause / Cancel Schedule', description: 'Pause or permanently cancel a recurring schedule without deleting historical invoices.' },
      ]}
      tabs={['Active Schedules', 'Review Queue', 'Billing History', 'Paused']}
      features={[
        'Automate monthly or recurring invoice generation for fixed-fee clients',
        'Configure billing frequency, amount, and start date per client',
        'Choose auto-issue or hold in review queue before sending',
        'Preview upcoming scheduled billing before it processes',
        'Pause or cancel a recurring billing schedule',
        'View full billing history for each recurring schedule',
      ]}
      dataDisplayed={[
        'Client name and recurring billing amount',
        'Billing frequency and next billing date',
        'Auto-issue status and review queue count',
        'Schedule start date and status',
        'Total invoiced to date on this schedule',
      ]}
      userActions={[
        'Create a new recurring billing schedule',
        'Toggle auto-issue on/off',
        'Review and approve invoices in the review queue',
        'Pause a recurring schedule',
        'Preview next scheduled invoice batch',
      ]}
    />
  )
}

// ── 31. Billing: Payment Tracking ─────────────────────────────────────────────
function PaymentTrackingPanel() {
  return (
    <PageDocumentation
      title="Payment Tracking"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Billing / Payment Tracking"
      purpose="Payment Tracking provides real-time visibility into all client payment activity — showing payments received, reconciled, and outstanding across all active billing, with a cash receipts log and automatic matching of payments to open invoices. The module supports multiple payment method tracking (bank transfer, card, cheque, direct debit) and integrates with the client's bank feed for automatic payment matching when connected."
      components={[
        { name: 'Cash Receipts Log', description: 'Chronological list of all payments received with client, amount, payment method, and matched invoice.' },
        { name: 'Unmatched Payments', description: 'Payments received without a matching invoice that need manual application.' },
        { name: 'Auto-Match Engine', description: 'System that matches incoming bank feed credits to open invoices by amount and client.' },
        { name: 'Payment Method Breakdown', description: 'Summary chart showing distribution of payments by method (transfer, card, cheque, etc.).' },
        { name: 'Overdue Invoice Alerts', description: 'Daily digest of invoices newly moved into overdue status for follow-up.' },
      ]}
      tabs={['Cash Receipts', 'Unmatched Payments', 'Auto-Match', 'Overdue Alerts']}
      features={[
        'Track all client payments received with full detail',
        'Auto-match bank feed credits to open invoices',
        'Identify and manually apply unmatched payments',
        'Monitor daily overdue invoice alerts',
        'View payment method distribution across practice',
        'Export cash receipts report for reconciliation',
      ]}
      dataDisplayed={[
        'Payment date, client, and amount',
        'Payment method and reference number',
        'Matched invoice number and application status',
        'Unmatched payment count and total',
        'Days until overdue for outstanding invoices',
      ]}
      userActions={[
        'Apply an unmatched payment to an invoice',
        'View detail of a payment receipt',
        'Trigger auto-match for bank feed payments',
        'Export cash receipts log',
        'Set up overdue alert notifications',
      ]}
    />
  )
}

// ── 32. Analytics: Practice Overview ──────────────────────────────────────────
function PracticeOverviewPanel() {
  return (
    <PageDocumentation
      title="Practice Overview"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Analytics / Practice Overview"
      purpose="Practice Overview provides the top-level analytics dashboard for the accounting practice — aggregating the key performance indicators that reflect the health of the entire practice in one view: total active clients, monthly recurring revenue, WIP balance, outstanding AR, engagements completed vs. in progress, and average billing realization rate. It is designed for practice owners and managing partners who need a daily snapshot of the practice's performance without drilling into individual reports."
      components={[
        { name: 'KPI Tile Row', description: 'Six-tile summary row showing: Active Clients, MRR, WIP Balance, Unbilled AR, Completed Engagements, Realization Rate.' },
        { name: 'Revenue Trend Chart', description: 'Month-over-month revenue trend bar chart for the trailing 12 months.' },
        { name: 'Engagement Volume Chart', description: 'Stacked bar chart showing engagements by type and completion status by month.' },
        { name: 'Top Clients Table', description: 'Top 10 clients by billings for the selected period with YoY comparison.' },
        { name: 'Practice Health Score', description: 'Composite score (0–100) derived from AR aging, WIP age, deadline compliance, and realization rate.' },
      ]}
      tabs={['KPI Summary', 'Revenue Trend', 'Engagements', 'Top Clients', 'Health Score']}
      features={[
        'Daily snapshot of key practice KPIs in a single view',
        'Revenue trend analysis for the trailing 12 months',
        'Engagement volume and completion status by month',
        'Identify top revenue-generating clients',
        'Composite Practice Health Score for early warning of issues',
        'Drill down from any KPI tile to the underlying detail report',
      ]}
      dataDisplayed={[
        'Active client count',
        'Monthly recurring revenue (MRR)',
        'Total WIP balance',
        'Outstanding AR balance',
        'Engagements completed this month',
        'Billing realization rate %',
      ]}
      userActions={[
        'View KPI tile details by clicking each tile',
        'Change the reporting period',
        'Export practice overview as PDF',
        'Drill into revenue trend by client',
        'View Practice Health Score breakdown',
      ]}
    />
  )
}

// ── 33. Analytics: Client Analytics ───────────────────────────────────────────
function ClientAnalyticsPanel() {
  return (
    <PageDocumentation
      title="Client Analytics"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Analytics / Client Analytics"
      purpose="Client Analytics provides per-client and cross-client comparative analytics — allowing practice managers to understand each client's revenue contribution, service mix, billing realization rate, staff time allocation, and profitability. The module helps identify underpriced clients, over-serviced accounts, and growth opportunities within the existing client base, supporting strategic decisions about pricing, service packaging, and client retention."
      components={[
        { name: 'Client Revenue Summary', description: 'Per-client revenue table sorted by billing amount, with prior period comparison and YoY change.' },
        { name: 'Service Mix Breakdown', description: 'Pie chart of services billed per client (bookkeeping, tax, advisory, etc.) for cross-sell insight.' },
        { name: 'Realization Rate by Client', description: 'Billing realization rate (billed/standard) by client, highlighting discounted accounts.' },
        { name: 'Time vs. Revenue Analysis', description: 'Scatter plot of staff hours vs. revenue per client to identify over- or under-serviced clients.' },
        { name: 'Client Profitability Index', description: 'Estimated profitability index per client combining revenue, cost-to-serve, and overhead allocation.' },
      ]}
      tabs={['Client Revenue', 'Service Mix', 'Realization Rates', 'Time Analysis', 'Profitability']}
      features={[
        'Analyze revenue contribution by client for any period',
        'See service mix breakdown to identify cross-sell opportunities',
        'Compare billing realization rates across clients',
        'Identify over-serviced clients with time vs. revenue analysis',
        'Estimate client profitability to prioritize strategic accounts',
        'Export client analytics summary for partner review',
      ]}
      dataDisplayed={[
        'Client name and billed revenue for period',
        'Service mix breakdown by billing type',
        'Realization rate vs. standard rate',
        'Staff hours allocated by client',
        'Estimated profitability index',
      ]}
      userActions={[
        'Select client or date range for analysis',
        'View service mix for a client',
        'Compare realization rates across clients',
        'Identify over-serviced accounts',
        'Export client analytics report',
      ]}
    />
  )
}

// ── 34. Analytics: Staff Reports ──────────────────────────────────────────────
function StaffReportsPanel() {
  return (
    <PageDocumentation
      title="Staff Reports"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Analytics / Staff Reports"
      purpose="Staff Reports provides workforce analytics for the practice — tracking each team member's billable utilization, hours logged, WIP generated, billing realization rate, and task completion rate. These metrics help managers identify high performers, staff under-utilized or over-loaded team members, benchmark utilization against targets, and make informed staffing decisions without relying on anecdote."
      components={[
        { name: 'Utilization Summary Table', description: 'Per-staff table showing billable hours, total hours, and utilization % for the period.' },
        { name: 'Realization Rate by Staff', description: 'Billing realization rate per staff member vs. their standard billing rate.' },
        { name: 'WIP Generated', description: 'WIP value generated per staff member showing effective production output.' },
        { name: 'Task Completion Rate', description: 'Tasks completed vs. assigned for each team member as a quality-of-delivery metric.' },
        { name: 'Utilization Trend Chart', description: 'Month-over-month utilization trend per staff member for the trailing 6 months.' },
      ]}
      tabs={['Utilization', 'Realization Rates', 'WIP Generated', 'Task Completion', 'Trends']}
      features={[
        'Track billable utilization for every team member',
        'Measure billing realization rate by staff',
        'Monitor WIP generated as a production output metric',
        'Track task completion rates to assess delivery quality',
        'View utilization trends over the trailing 6 months',
        'Export staff analytics report for management review',
      ]}
      dataDisplayed={[
        'Staff member name and role',
        'Billable hours and total hours logged',
        'Utilization % vs. target',
        'WIP value generated in period',
        'Task completion rate (tasks done / tasks assigned)',
      ]}
      userActions={[
        'Select date range for staff report',
        "Drill into a staff member's time detail",
        'Compare utilization across team',
        'Set utilization targets',
        'Export staff report as PDF or Excel',
      ]}
    />
  )
}

// ── 35. Analytics: Billing Reports ────────────────────────────────────────────
function BillingReportsPanel() {
  return (
    <PageDocumentation
      title="Billing Reports"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Analytics / Billing Reports"
      purpose="Billing Reports provides comprehensive reporting on the practice's billing activity — covering invoiced revenue, cash collected, WIP aging, AR aging, write-offs, and billing realization — with period-over-period trend views and drill-down capability to the invoice level. These reports are the primary financial performance tool for practice owners and are used in monthly management reviews to assess billing health."
      components={[
        { name: 'Revenue Summary Report', description: 'Aggregated billing revenue by period, client, and service type with comparison to prior period.' },
        { name: 'Cash Collections Report', description: 'Cash collected vs. invoiced for the period with collection ratio calculation.' },
        { name: 'AR Aging Report', description: 'Accounts receivable aging table bucketed by 0–30, 31–60, 61–90, and 90+ days.' },
        { name: 'WIP Aging Report', description: 'WIP balance aging showing unbilled time value by age bucket across all clients.' },
        { name: 'Write-off Summary', description: 'Total write-offs in the period with breakdown by client and reason code.' },
      ]}
      tabs={['Revenue Summary', 'Cash Collections', 'AR Aging', 'WIP Aging', 'Write-offs']}
      features={[
        'Review invoiced revenue by period, client, and service type',
        'Track cash collections ratio vs. invoice value',
        'Analyze AR aging to prioritize collections follow-up',
        'Monitor WIP aging to prevent stale unbilled entries',
        'Quantify write-offs for management decision-making',
        'Export any billing report as PDF or Excel',
      ]}
      dataDisplayed={[
        'Total invoiced revenue for period',
        'Cash collected and collection ratio',
        'AR aging by bucket (current, 30, 60, 90+ days)',
        'WIP aging by bucket',
        'Write-off amount by client and reason',
      ]}
      userActions={[
        'Select report type and date range',
        'Drill into revenue detail by client',
        'View AR aging and prioritize collections',
        'Analyze WIP aging',
        'Export billing report',
      ]}
    />
  )
}

// ── 36. Analytics: Work Reports ───────────────────────────────────────────────
function WorkReportsPanel() {
  return (
    <PageDocumentation
      title="Work Reports"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Analytics / Work Reports"
      purpose="Work Reports provides operational analytics on work volume and throughput across the practice — covering tasks completed, engagement progress rates, deadline compliance rates, close completion statistics, and recurring work adherence. These reports help practice managers understand whether the team is keeping up with the volume of work committed to clients and identify systemic bottlenecks in the production workflow."
      components={[
        { name: 'Task Throughput Report', description: 'Tasks created vs. completed in the period by staff member and task type.' },
        { name: 'Engagement Progress Report', description: 'Completion rate of active engagements as a % of planned steps done by planned date.' },
        { name: 'Deadline Compliance Report', description: '% of deadlines met on time in the period with breakdown by deadline type.' },
        { name: 'Monthly Close Rate Report', description: '% of clients whose monthly close was completed by the target close date.' },
        { name: 'Recurring Work Adherence', description: '% of recurring work tasks (monthly bookkeeping, payroll, etc.) completed on schedule.' },
      ]}
      tabs={['Task Throughput', 'Engagement Progress', 'Deadline Compliance', 'Close Rate', 'Recurring Adherence']}
      features={[
        'Analyze task creation and completion throughput',
        'Monitor engagement progress against planned completion rates',
        'Track deadline compliance rates across all practice deadlines',
        'Measure monthly close completion rates by client',
        'Assess recurring work adherence for scheduled tasks',
        'Identify bottlenecks in work production workflow',
      ]}
      dataDisplayed={[
        'Tasks created and completed in period',
        'Engagement progress % vs. planned rate',
        'Deadline compliance rate %',
        'Monthly close completion rate %',
        'Recurring task on-time adherence rate %',
      ]}
      userActions={[
        'Select report type and date range',
        'Filter by staff or client',
        'Drill into compliance failures for root cause',
        'Compare period-over-period work rates',
        'Export work reports as PDF or Excel',
      ]}
    />
  )
}

// ── 37. Settings: Automation ──────────────────────────────────────────────────
function AutomationPanel() {
  return (
    <PageDocumentation
      title="Automation"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Settings / Automation"
      purpose="Automation allows practice managers to configure rules-based workflow automations — such as automatically creating recurring work tasks when a month begins, sending client requests when a new engagement starts, triggering payment reminders a set number of days after an invoice is issued, and assigning tasks to staff based on client type. These automations reduce manual coordination overhead and ensure the practice's recurring operational rhythm runs reliably without staff intervention."
      components={[
        { name: 'Automation Rule List', description: 'All active automation rules with trigger, condition, action, and enabled/disabled status.' },
        { name: 'Rule Builder', description: 'Visual rule builder: Choose trigger event → Conditions → Action to perform with parameters.' },
        { name: 'Trigger Library', description: 'Predefined trigger events: new client added, engagement started, invoice issued, month start, deadline approaching.' },
        { name: 'Action Library', description: 'Predefined actions: create task, send email, generate request, assign staff, post notification.' },
        { name: 'Run History', description: 'Log of all automation rule executions with trigger event, outcome, and any errors.' },
      ]}
      tabs={['All Rules', 'Create Rule', 'Rule Templates', 'Run History']}
      features={[
        'Automate recurring workflow tasks to reduce manual coordination',
        'Build rules with trigger-condition-action logic',
        'Choose from a library of common triggers and actions',
        'Monitor automation run history for each rule',
        'Enable or disable automations without deleting them',
        'Use automation templates for common practice workflows',
      ]}
      dataDisplayed={[
        'Rule name, trigger, and action summary',
        'Rule enabled/disabled status',
        'Last run date and outcome',
        'Error count in run history',
        'Condition filters applied',
      ]}
      userActions={[
        'Create a new automation rule',
        'Select trigger event and action',
        'Enable or disable an existing rule',
        'View run history for a rule',
        'Edit rule conditions or actions',
      ]}
    />
  )
}

// ── 38. Settings: Integrations ────────────────────────────────────────────────
function IntegrationsPanel() {
  return (
    <PageDocumentation
      title="Integrations"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Settings / Integrations"
      purpose="Integrations manages all third-party application connections for the practice — including calendar and email sync (Google, Microsoft 365), payment processing (Stripe, Square), e-signature (DocuSign, HelloSign), cloud storage (Google Drive, Dropbox, OneDrive), payroll providers, and tax software connectors. Each integration shows its connection status, authorized scope, and last sync timestamp, with a one-click disconnect option."
      components={[
        { name: 'Integration Directory', description: 'Card grid of all available integrations with name, category, and connected/disconnected status.' },
        { name: 'OAuth Connection Flow', description: 'Standard OAuth 2.0 authorization flow to connect each integration without storing credentials.' },
        { name: 'Sync Status Monitor', description: 'Last sync time, data scopes authorized, and sync error log for each connected integration.' },
        { name: 'Webhook Management', description: 'Configure inbound and outbound webhooks for custom integration workflows.' },
        { name: 'API Key Management', description: 'Generate and manage API keys for direct API access to the practice hub by trusted third-party tools.' },
      ]}
      tabs={['All Integrations', 'Connected', 'Calendar & Email', 'Payments', 'E-Signature', 'Storage']}
      features={[
        'Connect practice hub to external tools and services',
        'Manage all integration connections from one dashboard',
        'Monitor sync status and error logs per integration',
        'Configure webhooks for custom event-driven workflows',
        'Generate API keys for trusted third-party access',
        'Disconnect integrations with one click',
      ]}
      dataDisplayed={[
        'Integration name and category',
        'Connection status and last sync time',
        'Authorized OAuth scopes',
        'Webhook URL and last trigger',
        'API key name and creation date',
      ]}
      userActions={[
        'Connect a new integration via OAuth',
        'View sync status and errors',
        'Configure webhook for an integration',
        'Generate a new API key',
        'Disconnect an existing integration',
      ]}
    />
  )
}


// ── Performance ──────────────────────────────────────────────────────────────
function PerformancePanel() {
  return (
    <PageDocumentation
      title="Performance"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Home / Performance"
      purpose="Performance tracks the accounting firm's operational KPIs over time — including revenue per client, billable utilization, realization rate, client retention, and staff productivity — giving practice managers the data they need to make informed decisions about pricing, staffing, and service mix. Trend charts allow quarter-over-quarter and year-over-year comparison, while benchmark comparisons show how the firm performs relative to industry averages for similar-sized practices."
      components={[
        { name: 'KPI Summary Cards', description: 'Key metric cards: total revenue, realization rate, utilization, client retention, and NPS.' },
        { name: 'Revenue Trend Chart', description: 'Monthly line chart of billed revenue vs. collected revenue over the trailing 12 months.' },
        { name: 'Utilization Breakdown', description: 'Staff utilization breakdown showing billable, non-billable, and administrative time percentages.' },
        { name: 'Client Retention Metrics', description: 'Churn rate, average client tenure, and new vs. lost clients per quarter.' },
        { name: 'Benchmark Comparison', description: 'Side-by-side comparison of firm KPIs vs. industry benchmarks for similar-sized practices.' },
      ]}
      tabs={['KPI Summary', 'Revenue', 'Utilization', 'Client Retention', 'Benchmarks']}
      features={[
        'Track all key practice performance KPIs in one view',
        'Analyze revenue trends over trailing 12 months',
        'Measure billable utilization vs. target per staff member',
        'Monitor client retention rate and churn trends',
        'Compare firm performance to industry benchmarks',
        'Export performance report for partner or board review',
      ]}
      dataDisplayed={[
        'Monthly and YTD revenue figures',
        'Realization and utilization rates',
        'Client count, new clients, and churned clients',
        'Average revenue per client',
        'Staff productivity scores',
      ]}
      userActions={[
        'Select date range for performance analysis',
        'Drill into revenue by service line or staff member',
        'View utilization per individual staff member',
        'Export performance report',
        'Compare to benchmark data',
      ]}
    />
  )
}

// ── Deadlines (Home) ─────────────────────────────────────────────────────────
function DeadlinesHomePanel() {
  return (
    <PageDocumentation
      title="Deadlines"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Home / Deadlines"
      purpose="Deadlines provides a consolidated view of all upcoming and overdue tax filing dates, regulatory submission deadlines, and internal deliverable due dates across every client in the firm's portfolio. Unlike the per-client deadline tracker in Work Management, this Home section gives a bird's-eye view so practice managers can immediately see which days are the busiest and which clients need urgent attention. Color-coding distinguishes overdue, due-today, due-this-week, and upcoming items."
      components={[
        { name: 'Deadline Calendar View', description: 'Monthly calendar marking all client filing deadlines with color-coded urgency indicators.' },
        { name: 'Overdue Items List', description: 'Highlighted list of all deadlines that have already passed without a completed status.' },
        { name: 'This-Week Preview', description: 'Focused list of all deadlines due in the current calendar week, sorted by date.' },
        { name: 'Client Filter', description: 'Per-client filter to narrow the deadline view to a specific client or portfolio subset.' },
        { name: 'Deadline Type Filter', description: 'Filter by deadline category: tax filing, regulatory, internal close, client deliverable.' },
      ]}
      tabs={['Calendar View', 'Overdue', 'This Week', 'By Client', 'By Type']}
      features={[
        'See all client deadlines in a single consolidated view',
        'Identify overdue items requiring immediate action',
        "Preview the current week's deadline schedule",
        'Filter deadlines by client or deadline type',
        'Set automated reminder notifications per deadline',
        'Export deadline schedule for partner or team review',
      ]}
      dataDisplayed={[
        'Deadline date and description',
        'Client name and responsible staff member',
        'Deadline status (overdue, due today, upcoming)',
        'Deadline category (tax, regulatory, internal)',
        'Completion date when marked done',
      ]}
      userActions={[
        'View deadline calendar for the current month',
        "Filter to a specific client's deadlines",
        'Mark a deadline as completed',
        'Set a reminder for an upcoming deadline',
        'Export deadline list to calendar or PDF',
      ]}
    />
  )
}

// ── Notifications Inbox ──────────────────────────────────────────────────────
function NotificationsPanel() {
  return (
    <PageDocumentation
      title="Notifications Inbox"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Home / Notifications Inbox"
      purpose="Notifications Inbox aggregates all system-generated alerts, task assignments, client responses, approval requests, and deadline warnings into a single prioritized feed for practice staff, ensuring no important action item is missed. Notifications are categorized and can be filtered to show only those relevant to a specific function (e.g. billing, clients, compliance). Users can take direct action on many notifications — such as approving a request or marking an item read — without leaving the inbox."
      components={[
        { name: 'Notification Feed', description: 'Chronological list of all notifications with type icon, description, timestamp, and read/unread indicator.' },
        { name: 'Category Filter', description: 'Filter notifications by type: task, deadline, client message, approval, billing, system.' },
        { name: 'Priority Sort', description: 'Sort by priority (urgent first) or by recency, with urgent items pinned to the top.' },
        { name: 'Bulk Actions', description: 'Select multiple notifications to mark as read, archive, or delete in bulk.' },
        { name: 'Notification Preferences Link', description: 'Quick link to configure which notification types trigger alerts and via which channels.' },
      ]}
      tabs={['All', 'Unread', 'Urgent', 'By Category']}
      features={[
        'Centralized inbox for all system and activity notifications',
        'Filter notifications by category and priority',
        'Take direct actions from notification items',
        'Mark notifications as read individually or in bulk',
        'Navigate directly to the source of any notification',
        'Configure notification preferences from within the inbox',
      ]}
      dataDisplayed={[
        'Notification type, icon, and description',
        'Timestamp and read/unread status',
        'Source (client name, task, document, etc.)',
        'Priority level (urgent/normal)',
        'Action button where applicable',
      ]}
      userActions={[
        'Mark notification as read',
        'Click notification to navigate to source',
        'Filter by category or urgency',
        'Bulk mark all as read',
        'Archive or dismiss notifications',
      ]}
    />
  )
}

// ── Help & Support ───────────────────────────────────────────────────────────
function HelpPanel() {
  return (
    <PageDocumentation
      title="Help & Support"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Home / Help & Support"
      purpose="Help & Support is the self-service knowledge base and support portal for accounting firm staff using Haypbooks Practice. It surfaces contextual help articles based on the user's current section, provides a searchable knowledge base covering all practice hub features, and offers live chat support for issues requiring human assistance. Firms can also submit support tickets and track their resolution status directly within this section."
      components={[
        { name: 'Contextual Help Articles', description: 'Dynamically surfaced help articles relevant to the page or feature the user is currently using.' },
        { name: 'Knowledge Base Search', description: 'Full-text search across all Haypbooks help documentation with categorized results.' },
        { name: 'Video Tutorial Library', description: 'Short video walkthroughs for common practice hub tasks and setup steps.' },
        { name: 'Live Chat Support', description: 'Real-time chat window to connect with Haypbooks support staff during business hours.' },
        { name: 'Support Ticket Tracker', description: 'Submit and track the status of open support tickets with full conversation history.' },
      ]}
      tabs={['Help Articles', 'Knowledge Base', 'Video Tutorials', 'Contact Support', 'My Tickets']}
      features={[
        'Access contextual help articles for the current page',
        'Search full knowledge base for any feature question',
        'Watch video tutorials for step-by-step guidance',
        'Chat live with Haypbooks support during business hours',
        'Submit support tickets and track resolution status',
        'Browse FAQ for common accounting-firm questions',
      ]}
      dataDisplayed={[
        'Contextual help articles for current section',
        'Search results with article title and excerpt',
        'Video tutorial duration and topic',
        'Open ticket subject, status, and last update',
        'Live chat availability indicator',
      ]}
      userActions={[
        'Search knowledge base for a topic',
        'Open a help article to read full content',
        'Watch a video tutorial',
        'Start a live chat with support',
        'Submit a new support ticket',
      ]}
    />
  )
}

// ── Client Groups ────────────────────────────────────────────────────────────
function ClientGroupsPanel() {
  return (
    <PageDocumentation
      title="Client Groups"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Clients / Client Groups"
      purpose="Client Groups allows accounting firms to segment their client portfolio into named groups — such as by industry, entity type, service tier, assigned partner, or geographic location — making it possible to apply bulk actions, filtered reporting, and group-level work assignments. Groups are user-defined and a single client can belong to multiple groups simultaneously, supporting overlapping segmentation schemas."
      components={[
        { name: 'Group Directory', description: 'List of all defined client groups with name, description, member count, and last updated date.' },
        { name: 'Group Builder', description: 'Form to create a new group with name, optional criteria-based auto-assignment rules, and manual members.' },
        { name: 'Member Management Table', description: 'Per-group table of member clients with options to add, remove, or bulk assign clients.' },
        { name: 'Bulk Action on Group', description: 'Apply a bulk action — such as send message, assign task, or generate report — to all clients in a group.' },
        { name: 'Group Reporting', description: 'Generate reports filtered to a specific client group for segmented analysis.' },
      ]}
      tabs={['All Groups', 'Group Members', 'Automatic Groups', 'Bulk Actions']}
      features={[
        'Create named segments for client portfolio organization',
        'Automatically assign clients to groups based on criteria',
        'Apply bulk actions to all clients in a group',
        'Generate reports filtered to a specific group',
        'Manage group membership with add/remove controls',
        'View all groups a specific client belongs to',
      ]}
      dataDisplayed={[
        'Group name, description, and member count',
        'Group type (manual vs. auto-assigned)',
        'Member client list with status indicators',
        'Last action performed on group',
        'Criteria for auto-assignment groups',
      ]}
      userActions={[
        'Create a new client group',
        'Add or remove clients from a group',
        'Set auto-assignment criteria for a group',
        'Send bulk message to group clients',
        'Generate report for a client group',
      ]}
    />
  )
}

// ── Client Transitions ───────────────────────────────────────────────────────
function ClientTransitionsPanel() {
  return (
    <PageDocumentation
      title="Client Transitions"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Clients / Client Transitions"
      purpose="Client Transitions manages the structured workflow for clients that are changing status — being onboarded, transitioning from another firm, going on hold, or offboarding — ensuring that all data, documents, access rights, and outstanding work items are properly handled during every change. Each transition type has a predefined checklist appropriate to that type of change, reducing the risk of dropped tasks when clients move between engagement states."
      components={[
        { name: 'Active Transitions List', description: 'Table of all clients currently in a transition process with type, stage, and responsible staff.' },
        { name: 'Transition Type Selector', description: 'Choose the transition type: Onboarding, Firm Transfer In, Firm Transfer Out, On Hold, Offboarding.' },
        { name: 'Transition Checklist', description: 'Step-by-step checklist tailored to the selected transition type, with per-step owner and due date.' },
        { name: 'Data Transfer Panel', description: 'Guided export/import of client data during firm-transfer transitions.' },
        { name: 'Offboarding Data Retention', description: 'Configuration of data retention, export, and access removal schedule for clients leaving the firm.' },
      ]}
      tabs={['Active Transitions', 'Onboarding', 'Transfers', 'On Hold', 'Offboarding']}
      features={[
        'Manage all client status changes with structured checklists',
        'Track active transitions across all clients in a single view',
        'Handle firm-to-firm data transfers with guided workflow',
        'Configure data retention and access removal on offboarding',
        'Assign transition steps to specific staff members',
        'Document reasons and notes for each transition',
      ]}
      dataDisplayed={[
        'Client name and transition type',
        'Transition start date and target completion date',
        'Checklist step completion status',
        'Responsible staff per step',
        'Transition notes and documentation',
      ]}
      userActions={[
        'Initiate a new client transition',
        'Select transition type and assign owner',
        'Complete and check off transition steps',
        'Export client data during transfer',
        'Finalize and close a completed transition',
      ]}
    />
  )
}


// ── Deadline Tracker ─────────────────────────────────────────────────────────
function DeadlineTrackerPanel() {
  return (
    <PageDocumentation
      title="Deadline Tracker"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Work Mgmt / Deadline Tracker"
      purpose="Deadline Tracker is the detailed deadline management tool for practice-wide filing obligations and engagement deliverables, providing a searchable and filterable registry of all known deadlines with responsible staff, completion status, and reminder configuration. Unlike the home Deadlines view which gives a bird's-eye overview, Deadline Tracker supports the full lifecycle management of each deadline — adding custom deadlines, configuring automated reminders, logging completion, and generating compliance calendars for clients."
      components={[
        { name: 'Deadline Registry Table', description: 'Full table of all deadlines with client, type, due date, responsible staff, and status.' },
        { name: 'Add Deadline Form', description: 'Form to create a custom deadline with type, client, due date, description, and responsible person.' },
        { name: 'Status Update', description: 'Dropdown to update deadline status: Not Started, In Progress, Complete, Extended, Late.' },
        { name: 'Reminder Configuration', description: 'Set one or multiple automated reminder dates (e.g., 30 days, 7 days, 1 day before) per deadline.' },
        { name: 'Compliance Calendar Export', description: 'Export a client-specific compliance calendar as PDF showing all their deadlines for the year.' },
      ]}
      tabs={['All Deadlines', 'My Deadlines', 'Overdue', 'Upcoming 30 Days', 'Compliance Calendar']}
      features={[
        'Manage all practice deadlines in a searchable registry',
        'Create custom deadlines for any filing or deliverable obligation',
        'Update status as deadlines are completed or extended',
        'Set multi-stage automated reminders per deadline',
        'Export compliance calendar for any client',
        'Filter by client, type, status, or responsible staff',
      ]}
      dataDisplayed={[
        'Deadline description and type',
        'Client and responsible staff member',
        'Due date and current status',
        'Reminder dates configured',
        'Actual completion date when marked done',
      ]}
      userActions={[
        'Add a new custom deadline',
        'Update deadline status',
        'Configure reminder dates',
        'Mark deadline complete',
        'Export compliance calendar for client',
      ]}
    />
  )
}

// ── Audit Trail ──────────────────────────────────────────────────────────────
function AuditTrailPanel() {
  return (
    <PageDocumentation
      title="Audit Trail"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Audit Trail"
      purpose="Audit Trail provides a full transaction-level and system-level audit log for all changes made within a client's books by firm staff — showing who made each change, what was changed, the before and after values, and when the change was made. This immutable log is the primary tool for internal quality control reviews and external audit support, demonstrating that the client's accounts were maintained with appropriate controls and that no unauthorized changes occurred."
      components={[
        { name: 'Activity Log Table', description: 'Chronological log of all accounting entries, edits, deletions, and approvals per client.' },
        { name: 'Change Detail Drill-Down', description: 'Expand any log entry to see the full before-and-after field values for the change.' },
        { name: 'User & Action Filters', description: 'Filter the audit log by staff member, action type, account, or date range.' },
        { name: 'Export for External Audit', description: 'Export filtered audit trail sections as PDF or CSV for external auditor use.' },
        { name: 'Integrity Verification', description: 'System check confirming no entries have been modified without a proper audit trail record.' },
      ]}
      tabs={['Full Activity Log', 'By Staff Member', 'By Account', 'By Date Range']}
      features={[
        'View complete audit trail of all changes to client books',
        'Filter by staff member, account, or action type',
        'Drill into change detail to see before and after values',
        'Export selected audit trail sections for external auditors',
        'Verify integrity of audit trail records',
        'Support internal QC reviews with documented change history',
      ]}
      dataDisplayed={[
        'Staff member who made the change',
        'Date and time of change',
        'Account or record affected',
        'Action type (create/edit/delete/approve)',
        'Before and after field values',
      ]}
      userActions={[
        'Filter audit log by staff or date range',
        'View change detail for a specific entry',
        'Export audit trail for external review',
        'Verify audit trail integrity',
        'Flag anomalous changes for review',
      ]}
    />
  )
}

// ── Period Close ─────────────────────────────────────────────────────────────
function PeriodClosePanel() {
  return (
    <PageDocumentation
      title="Period Close"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Workspace / Period Close"
      purpose="Period Close manages the formal closing of an accounting period in the client's books — executing the standard closing entry sequence, locking the closed period against new postings, and generating a post-close confirmation report. The module follows a configurable close checklist that ensures all required steps (reconciliations, JE review, adjustments, management approval) are completed before the period is locked, maintaining the integrity of closed-period financial statements."
      components={[
        { name: 'Close Checklist', description: 'Ordered checklist of required close steps with status and owner, preventing the close if steps are incomplete.' },
        { name: 'Auto-Generate Closing Entries', description: 'System-generated closing journal entries that transfer income statement balances to retained earnings.' },
        { name: 'Period Lock Control', description: 'Lock and unlock control for a specific accounting period to prevent or allow retroactive postings.' },
        { name: 'Post-Close Report', description: "Summary report of the period's key financial metrics after closing entries are posted." },
        { name: 'Re-Open Period Workflow', description: 'Controlled workflow for re-opening a closed period with reason, approver, and audit trail.' },
      ]}
      tabs={['Close Checklist', 'Closing Entries', 'Lock Control', 'Post-Close Report', 'Period History']}
      features={[
        'Run structured close checklist before locking period',
        'Auto-generate standard closing journal entries',
        'Lock closed periods against retroactive postings',
        'Generate post-close summary report',
        'Re-open a closed period with controlled approval workflow',
        'Track full history of all period closes with close date and user',
      ]}
      dataDisplayed={[
        'Close checklist step completion status',
        'Closing entries generated and posted',
        'Period lock status (open/closed)',
        'Post-close income and equity balances',
        'Close date, user, and approver',
      ]}
      userActions={[
        'Complete close checklist steps',
        'Review and post closing entries',
        'Lock the period after checklist completion',
        'Generate post-close report',
        'Re-open period if correction needed',
      ]}
    />
  )
}


// ── Retainers ─────────────────────────────────────────────────────────────────
function RetainersPanel() {
  return (
    <PageDocumentation
      title="Retainers"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Billing / Retainers"
      purpose="Retainers manages clients who pre-pay a fixed monthly or annual fee that gives them access to a defined scope of services — tracking retainer balances, drawdowns against services rendered, overage billings, and renewals. The module helps practices that use retainer-based billing models maintain transparency with clients by providing a real-time view of retainer balance consumed, balance remaining, and projected depletion date."
      components={[
        { name: 'Retainer Register', description: 'List of all active client retainers with balance, drawdown rate, and renewal date.' },
        { name: 'Drawdown Recorder', description: "Record service delivery time or expenses against a client's retainer balance." },
        { name: 'Balance Alerts', description: 'Automatic alerts when a retainer balance falls below a configurable threshold.' },
        { name: 'Overage Billing', description: 'Generate an overage invoice when services exceed the retainer balance for the period.' },
        { name: 'Renewal Workflow', description: 'Renewal reminder and pricing update workflow ahead of retainer expiry date.' },
      ]}
      tabs={['Active Retainers', 'Low Balance Alerts', 'Overages', 'Renewals']}
      features={[
        'Track retainer balances and drawdowns per client',
        'Record service delivery against retainer balance',
        'Alert when retainer balance is running low',
        'Bill overages when services exceed retainer',
        'Manage retainer renewals with pricing updates',
        'Generate retainer activity statement for client',
      ]}
      dataDisplayed={[
        'Client name and retainer amount',
        'Retainer balance remaining and consumed',
        'Drawdown transactions and dates',
        'Overage amount and billing status',
        'Renewal date and renewal status',
      ]}
      userActions={[
        'Record drawdown against client retainer',
        'Set low-balance alert threshold',
        'Generate overage invoice',
        'Process retainer renewal',
        'Send retainer statement to client',
      ]}
    />
  )
}

// ── Collections ──────────────────────────────────────────────────────────────
function CollectionsPanel() {
  return (
    <PageDocumentation
      title="Collections"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Billing / Collections"
      purpose="Collections manages the follow-up workflow for overdue accounts receivable — providing a structured collections pipeline with contact history, escalation stages, payment plan management, and bad debt write-off workflow. Instead of ad-hoc email chasing, the module gives the firm a repeatable collections process: automated reminders, phone call logging, payment arrangement tracking, and escalation to a final demand or write-off decision."
      components={[
        { name: 'Collections Pipeline', description: 'Overdue invoices organized in escalation stages: Reminder Sent, Called, Payment Arranged, Final Notice, Write-off.' },
        { name: 'Contact History Log', description: 'Record of all collections contacts per client with date, method, outcome, and next action.' },
        { name: 'Payment Plan Manager', description: 'Structured payment plan agreement with installments, due dates, and auto-reminders.' },
        { name: 'Escalation Controls', description: 'Move invoices through escalation stages with reason and responsible staff recorded.' },
        { name: 'Bad Debt Write-off Workflow', description: 'Formal write-off approval process with manager authorization before removing from AR.' },
      ]}
      tabs={['Collections Pipeline', 'Contact History', 'Payment Plans', 'Final Notice', 'Write-offs']}
      features={[
        'Manage overdue AR collections with a structured pipeline',
        'Log all collections contacts with outcome and next action',
        'Set up payment plan arrangements with installments',
        'Escalate overdue invoices through defined stages',
        'Process bad debt write-offs with manager approval',
        'Track days sales outstanding improvement over time',
      ]}
      dataDisplayed={[
        'Client and invoice amount in collections',
        'Days overdue and escalation stage',
        'Last contact date, method, and outcome',
        'Payment plan installment status',
        'Write-off amount pending authorization',
      ]}
      userActions={[
        'Move invoice to next escalation stage',
        'Log a collections contact',
        'Set up a payment plan for a client',
        'Issue final demand notice',
        'Submit write-off for manager approval',
      ]}
    />
  )
}

// ── Write-offs ───────────────────────────────────────────────────────────────
function WriteOffsPanel() {
  return (
    <PageDocumentation
      title="Write-offs"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Billing / Write-offs"
      purpose="Write-offs tracks all billing write-offs applied to the practice's AR and WIP — covering WIP write-downs before billing, invoice discounts at point of issuance, and bad debt write-offs of invoices declared uncollectable. The module provides a management-level summary of write-off activity with reason code analysis to help practice owners understand why billings are being reduced and where the practice is losing recoverable revenue."
      components={[
        { name: 'Write-off Register', description: 'Table of all write-offs applied in the period with client, original amount, written-off amount, and reason.' },
        { name: 'Reason Code Analytics', description: 'Pie chart of write-off reasons: client dispute, write-down, discount, bad debt, fee adjustment.' },
        { name: 'Approval Workflow', description: 'Write-offs above a configurable threshold require manager review and approval before being applied.' },
        { name: 'Impact Summary', description: 'Revenue impact summary showing total write-offs as a % of invoiced revenue for the period.' },
        { name: 'Recovery Tracking', description: 'Flag written-off invoices for recovery attempt and track any partial payments received.' },
      ]}
      tabs={['Write-off Register', 'Reason Analysis', 'Pending Approval', 'Recovery Tracking']}
      features={[
        'Track all billing write-offs with reason codes',
        'Analyze write-off patterns to identify systemic issues',
        'Enforce approval workflow for large write-offs',
        'Quantify write-off impact as % of invoiced revenue',
        'Track recovery attempts on written-off invoices',
        'Export write-off report for management review',
      ]}
      dataDisplayed={[
        'Client and original billed amount',
        'Write-off amount and reason code',
        'Approval status and approver name',
        'Write-off % of total invoiced revenue',
        'Recovery status for written-off invoices',
      ]}
      userActions={[
        'Record a new write-off with reason',
        'Submit write-off for management approval',
        'Approve or reject a pending write-off',
        'Analyze write-off reasons',
        'Flag written-off invoice for recovery follow-up',
      ]}
    />
  )
}

// ── Financial Reports ─────────────────────────────────────────────────────────
function FinancialReportsPanel() {
  return (
    <PageDocumentation
      title="Financial Reports"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Analytics / Financial Reports"
      purpose="Financial Reports is the practice's internal financial performance reporting center — generating profit and loss statements, cash flow summaries, and balance sheet views for the practice entity itself (not for clients). These reports help the firm owner track their own business performance, billing revenue, payroll costs, overhead, net income, and cash position, using the firm's own Haypbooks books as the source of truth."
      components={[
        { name: 'Practice P&L Report', description: 'Income statement for the practice entity showing revenue, staff costs, overhead, and net income.' },
        { name: 'Cash Flow Summary', description: 'Practice-level cash flow covering collections received, payroll, rent, and operating expenses.' },
        { name: 'Practice Balance Sheet', description: 'Balance sheet for the practice entity showing AR, payables, equity, and retained earnings.' },
        { name: 'Revenue vs. Cost of Services', description: 'Margin analysis separating billing revenue from direct staff cost of services.' },
        { name: 'Period Comparison', description: 'Side-by-side comparison of current period vs. prior period or budget for all financial reports.' },
      ]}
      tabs={['Practice P&L', 'Cash Flow', 'Balance Sheet', 'Margin Analysis', 'Period Comparison']}
      features={[
        'Generate practice P&L to track firm profitability',
        'View cash flow for the practice entity',
        'Analyze revenue vs. cost of services margins',
        'Compare current period to prior period or budget',
        'Export practice financial reports for owner review',
        "Use practice's own Haypbooks books as data source",
      ]}
      dataDisplayed={[
        'Practice revenue and expense categories',
        'Net income and net margin %',
        'Cash collected and operating expenses',
        'Cost of services vs. gross profit',
        'Period comparison columns with variance %',
      ]}
      userActions={[
        'Select report type and period',
        'Toggle period comparison columns',
        'Drill into revenue or expense detail',
        'Export report as PDF or Excel',
        'Share practice P&L with accountant or advisor',
      ]}
    />
  )
}


// ── Team Members ─────────────────────────────────────────────────────────────
function TeamMembersPanel() {
  return (
    <PageDocumentation
      title="Team Members"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Team / Team Members"
      purpose="Team Members is the staff directory and profile hub for the practice — showing each team member's contact information, role, service specializations, client assignments, current workload, and account status. This panel is the primary reference for understanding who works in the practice and what they do. Managers use it to quickly identify who is responsible for a client or task, view capacity at a glance, and access contact details without leaving the hub."
      components={[
        { name: 'Staff Profile Cards', description: 'Card view of all staff with photo, name, role, specialization, and active client count.' },
        { name: 'List View Toggle', description: 'Switch between card grid and detailed table showing all staff with workload and availability metrics.' },
        { name: 'Client Assignment Summary', description: 'For each staff member, show the number of clients assigned and the list on expand.' },
        { name: 'Workload Indicator', description: 'Color-coded workload status: Under-utilized, OK, Busy, Over-capacity based on task backlog.' },
        { name: 'Contact Info', description: 'Phone, email, and preferred contact method per staff member.' },
      ]}
      tabs={['Directory', 'By Workload', 'Client Assignments']}
      features={[
        'View all team members with roles and specializations',
        'Check workload status for each staff member',
        'See client assignments per staff member at a glance',
        'Access contact details for each team member',
        'Identify over-capacity or under-utilized staff',
        'Toggle between card and list view',
      ]}
      dataDisplayed={[
        'Staff name, role, and specialization',
        'Active client count per staff member',
        'Workload status indicator',
        'Contact email and phone',
        'Last active date in the practice hub',
      ]}
      userActions={[
        "View a staff member's profile",
        'See list of clients assigned to a staff member',
        'Filter by role or specialization',
        'Contact a staff member directly',
        'Identify available capacity in the team',
      ]}
    />
  )
}

// ── Time Off ─────────────────────────────────────────────────────────────────
function TimeOffPanel() {
  return (
    <PageDocumentation
      title="Time Off"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Team / Time Off"
      purpose="Time Off manages staff leave requests and approval — covering vacation days, sick leave, public holidays, and other absence types. The module gives managers a calendar view of all approved time-off across the team to identify coverage gaps, approve or reject requests, and plan around peak periods. Integration with the work calendar ensures that time-off periods are reflected when assigning tasks and scheduling deadlines."
      components={[
        { name: 'Leave Request Form', description: 'Staff self-service form to submit a time-off request with type, date range, and notes.' },
        { name: 'Approval Queue', description: 'Manager view of pending leave requests awaiting approval or rejection with reason field.' },
        { name: 'Team Leave Calendar', description: 'Calendar view showing all approved time off across the team for capacity planning.' },
        { name: 'Accrual Tracker', description: 'For firms tracking leave accruals, shows remaining days balance per leave type per staff member.' },
        { name: 'Coverage Gap Alerts', description: 'Alert when multiple key staff are absent simultaneously during a critical period.' },
      ]}
      tabs={['Leave Requests', 'Approval Queue', 'Team Calendar', 'Accruals']}
      features={[
        'Staff can submit leave requests self-service',
        'Managers review and approve or reject leave requests',
        'Team calendar shows all approved absences for capacity planning',
        'Track leave accrual balances per staff member',
        'Alert on simultaneous absences that create coverage gaps',
        'Integration with work calendar for task scheduling',
      ]}
      dataDisplayed={[
        'Leave request type and date range',
        'Approval status and approver name',
        'Team calendar events for approved leave',
        'Accrual balance per leave type',
        'Coverage gap periods flagged',
      ]}
      userActions={[
        'Submit a leave request',
        'Approve or reject a pending leave request',
        'View team calendar for absence coverage',
        'Check leave accrual balance',
        'Resolve a coverage gap before approving leave',
      ]}
    />
  )
}

// ── Schedule ─────────────────────────────────────────────────────────────────
function SchedulePanel() {
  return (
    <PageDocumentation
      title="Schedule"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Team / Schedule"
      purpose="Schedule provides the team's daily and weekly schedule planner — showing who is working, what they are working on (from the work queue), what client meetings are booked, and what deadlines are due today. Managers use it to plan the team's daily rhythm, ensure critical tasks are staffed, and spot availability for unexpected client requests. The schedule view integrates with the work calendar and team members' leave calendar."
      components={[
        { name: 'Daily Schedule Board', description: "Today's view showing each staff member's active tasks, meetings, and availability." },
        { name: 'Weekly Planner', description: '5-day week view with each staff member as a row and tasks/events as time blocks.' },
        { name: 'Capacity Overview', description: 'Daily capacity bar per staff showing hours booked vs. available hours.' },
        { name: 'Quick Task Assignment', description: 'Assign an unscheduled task from the queue to a specific staff slot by drag and drop.' },
        { name: 'Meeting Scheduler', description: 'Book an internal team or client meeting directly from the schedule with invite links.' },
      ]}
      tabs={['Today', 'This Week', 'Capacity Overview']}
      features={[
        "View team's daily schedule in one board",
        'Weekly planner view with tasks and meetings per staff',
        'Track capacity vs. availability for each team member',
        'Drag and drop tasks onto the schedule',
        'Book meetings directly from the schedule',
        'Spot availability gaps for urgent task allocation',
      ]}
      dataDisplayed={[
        'Staff member and daily/weekly tasks listed',
        'Client meetings booked per staff',
        'Available vs. booked hours per day',
        'Task priority and estimated hours',
        'Deadlines due today shown on schedule',
      ]}
      userActions={[
        "View today's schedule for the team",
        'Switch to weekly planner view',
        "Assign a task to a staff member's schedule",
        'Book a meeting from the schedule',
        'Identify available capacity for urgent work',
      ]}
    />
  )
}

// ── Team Performance ─────────────────────────────────────────────────────────
function TeamPerformancePanel() {
  return (
    <PageDocumentation
      title="Team Performance"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Team / Team Performance"
      purpose="Team Performance provides manager-facing analytics on each team member's key performance metrics — including billable hours, task completion rate, client satisfaction scores, deadline compliance, and peer review ratings. The module supports formal performance review cycles by maintaining a running record of KPIs over time, and surfaces trend data to support objective staff evaluations rather than relying on memory or subjective impressions."
      components={[
        { name: 'KPI Summary Per Staff', description: 'Table of all staff with their current-period KPIs: hours, utilization, completion rate, satisfaction score.' },
        { name: 'Trend Sparklines', description: 'Per-metric sparkline trends for the trailing 6 months per staff member.' },
        { name: 'Deadline Compliance Tracker', description: '% of deadlines each staff member completed on time in the review period.' },
        { name: 'Client Feedback Scores', description: 'Aggregated client satisfaction ratings per staff member from portal feedback forms.' },
        { name: 'Performance Review Builder', description: 'Export a formatted performance review summary for a staff member for HR or partner use.' },
      ]}
      tabs={['KPI Summary', 'Deadline Compliance', 'Client Feedback', 'Performance Review']}
      features={[
        'Track KPIs per team member for objective performance management',
        'View trend sparklines for key metrics over 6 months',
        'Measure deadline compliance per staff member',
        'Aggregate client satisfaction feedback per staff member',
        'Generate performance review summary export',
        'Support formal review cycles with historical KPI data',
      ]}
      dataDisplayed={[
        'Staff name and current KPI values',
        'Billable utilization % per staff',
        'Task completion rate and deadline compliance %',
        'Client satisfaction score',
        'KPI trend over the trailing 6 months',
      ]}
      userActions={[
        'Select staff member to view KPI detail',
        'View trend history per metric',
        'Filter by date range or review period',
        'Export performance review summary',
        'Set performance targets for each metric',
      ]}
    />
  )
}

// ── Team Capacity ────────────────────────────────────────────────────────────
function TeamCapacityPanel() {
  return (
    <PageDocumentation
      title="Team Capacity"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Team / Team Capacity"
      purpose="Team Capacity provides a forward-looking view of the practice's staffing capacity — showing how much available time each team member has in the coming days and weeks, how much is already committed to active tasks and engagements, and whether any periods have a capacity gap that could affect engagement delivery. Managers use this to make informed staffing decisions before accepting new engagements or committing to client deadlines."
      components={[
        { name: 'Capacity Timeline', description: 'Stacked bar chart showing committed vs. available hours per staff per week for the next 8 weeks.' },
        { name: 'Over-capacity Alerts', description: "Flagging of weeks where committed hours exceed a staff member's available capacity." },
        { name: 'New Engagement Impact Simulator', description: 'Simulate adding a new engagement to see the impact on team capacity.' },
        { name: 'Resource Leveling Tool', description: 'Suggest task reassignments to balance workload based on current capacity data.' },
        { name: 'Skill-Based Availability Filter', description: 'Filter available capacity by specialization to find the right staff for a specific task type.' },
      ]}
      tabs={['Capacity Timeline', 'Over-capacity Alerts', 'Engagement Simulator', 'Resource Leveling']}
      features={[
        'Forward-looking capacity view for the next 8 weeks',
        'Identify over-capacity weeks before they become problems',
        'Simulate impact of a new engagement on team capacity',
        'Get resource leveling suggestions to balance workload',
        'Filter available capacity by specialization',
        'Make informed staffing decisions before committing to deadlines',
      ]}
      dataDisplayed={[
        'Committed vs. available hours per staff per week',
        'Over-capacity periods flagged',
        'New engagement simulation result',
        'Suggested reassignments from resource leveling',
        'Available capacity by specialization filter',
      ]}
      userActions={[
        'View 8-week capacity timeline',
        'Run new engagement impact simulation',
        'Apply resource leveling suggestions',
        'Filter available capacity by skill',
        'Set capacity thresholds for over-capacity alerts',
      ]}
    />
  )
}

// ── Team Chat ────────────────────────────────────────────────────────────────
function TeamChatPanel() {
  return (
    <PageDocumentation
      title="Team Chat"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Communication / Team Chat"
      purpose="Team Chat provides an internal instant messaging workspace for the practice team — with channels organized by client, project, or topic, plus direct messages and group chats. Unlike email, Team Chat keeps work-related discussions searchable and contextually organized so conversations about a specific client or task stay together. Files, images, and links shared in chat are automatically indexed and searchable by the whole team."
      components={[
        { name: 'Channel Browser', description: 'List of all team channels with last message preview and unread message count.' },
        { name: 'Channel View', description: 'Message thread for a selected channel with reply threading and emoji reactions.' },
        { name: 'Direct Messages', description: 'Private 1:1 and group direct message conversations with individual team members.' },
        { name: 'File & Link Sharing', description: 'Paste or drag-drop files and links into chat, which are indexed for later search.' },
        { name: 'Message Search', description: 'Full-text search across all channels and DMs for messages, files, and shared links.' },
      ]}
      tabs={['Channels', 'Direct Messages', 'Files & Links', 'Search']}
      features={[
        'Instant messaging channels organized by client or project',
        'Direct messages for private 1:1 or group conversations',
        'Share files and links within chat with automatic indexing',
        'Full-text search across all messages and files',
        'Reply threading to keep discussions organized',
        'Unread message badges on channels and DMs',
      ]}
      dataDisplayed={[
        'Channel name and last message time',
        'Unread message count per channel',
        'Message sender and timestamp',
        'Files and links shared in channel',
        'Response thread count per message',
      ]}
      userActions={[
        'Join or create a team channel',
        'Send a message in a channel',
        'Start a direct message with a team member',
        'Share a file in chat',
        'Search for a past message or file',
      ]}
    />
  )
}

// ── Client Communication ─────────────────────────────────────────────────────
function ClientCommunicationPanel() {
  return (
    <PageDocumentation
      title="Client Communication"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Communication / Client Communication"
      purpose="Client Communication is the accountant-side unified communication hub for all messages exchanged with clients — combining client portal messages, email threads, and automated system notifications in one threaded inbox per client. Staff can compose portal messages, view client replies, track communication history, and see which messages have been read by the client. This eliminates the need to switch between email and the portal to maintain client communication context."
      components={[
        { name: 'Client Message Inbox', description: 'Unified message inbox with one thread per client showing all portal messages, email, and system alerts.' },
        { name: 'Compose Message', description: 'Compose and send a new message to a client via the portal or email with file attachment support.' },
        { name: 'Read Receipts', description: 'Read status indicator showing when a client has opened and read a portal message.' },
        { name: 'Communication History', description: 'Full chronological history of all communications with a client for reference and compliance.' },
        { name: 'Auto-Reply Templates', description: 'Insert pre-written templates for common responses: acknowledgment, request for documents, meeting invite.' },
      ]}
      tabs={['All Clients', 'Unread Messages', 'Compose', 'Communication History']}
      features={[
        'Unified inbox for all client communications',
        'Send messages via portal or email from one interface',
        'See read receipts for portal messages',
        'Access full communication history per client',
        'Use templates for fast, consistent client responses',
        'Attach files to outbound client messages',
      ]}
      dataDisplayed={[
        'Client name and most recent message',
        'Message content, date, and direction (sent/received)',
        'Read status for portal messages',
        'File attachments in message thread',
        'Auto-reply template category',
      ]}
      userActions={[
        'View all messages from a client',
        'Compose a new message to a client',
        'Check read status of a sent message',
        'Apply a communication template',
        'View full communication history for a client',
      ]}
    />
  )
}

// ── Announcements ────────────────────────────────────────────────────────────
function AnnouncementsPanel() {
  return (
    <PageDocumentation
      title="Announcements"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Communication / Announcements"
      purpose="Announcements is the broadcast communication tool for sending important practice-wide or client-specific announcements — such as system downtime notices, new feature releases, regulatory deadline reminders, holiday closure notices, and fee change communications. Announcements can be targeted to all clients, a specific client group, or only to internal staff, and can be scheduled for future delivery to ensure timely distribution."
      components={[
        { name: 'Announcement Composer', description: 'Rich text editor for drafting announcements with subject line, body, and optional attachment.' },
        { name: 'Audience Selector', description: 'Target announcement to All Clients, Client Group, or Internal Staff Only.' },
        { name: 'Schedule & Publish', description: 'Choose to publish immediately or schedule for a future date and time.' },
        { name: 'Announcement History', description: 'Archive of all past announcements with delivery date, audience, and read receipt count.' },
        { name: 'Read Receipt Summary', description: 'Count of clients or staff who have opened and confirmed reading the announcement.' },
      ]}
      tabs={['Compose Announcement', 'Scheduled', 'Sent', 'Drafts']}
      features={[
        'Send practice-wide or targeted announcements',
        'Target announcements to clients, client groups, or staff',
        'Schedule announcements for future delivery',
        'Track read receipts to confirm delivery',
        'Access archive of all past announcements',
        'Attach files or links to announcements',
      ]}
      dataDisplayed={[
        'Announcement subject and target audience',
        'Scheduled or sent date',
        'Recipient count and read receipt count',
        'Attachment status',
        'Delivery channel (portal/email/system)',
      ]}
      userActions={[
        'Compose a new announcement',
        'Select audience for announcement',
        'Schedule announcement for future delivery',
        'View read receipt counts',
        'Review announcement archive',
      ]}
    />
  )
}

// ── Document Collaboration ───────────────────────────────────────────────────
function DocumentCollabPanel() {
  return (
    <PageDocumentation
      title="Document Collaboration"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Communication / Document Collaboration"
      purpose="Document Collaboration enables real-time co-editing and commenting on documents shared between the accounting firm and its clients — covering working papers, draft reports, management letters, and engagement deliverables. Documents can be co-edited in the browser, with threaded comments per paragraph, tracked changes, and version history, eliminating the need to exchange multiple email attachments for document review cycles."
      components={[
        { name: 'Document Library', description: 'Shared document library organized by client with view, edit, and comment access controls.' },
        { name: 'Co-edit Mode', description: 'Real-time collaborative editor with presence indicators showing who is currently viewing or editing.' },
        { name: 'Threaded Comments', description: 'Inline paragraph-level comments with reply threading for targeted document feedback.' },
        { name: 'Track Changes', description: 'Record all edits as suggestions that require accept/reject, similar to Word track changes.' },
        { name: 'Version History', description: 'Full version history with diff view between any two versions and one-click restore.' },
      ]}
      tabs={['Document Library', 'Co-editing', 'Comments', 'Track Changes', 'Version History']}
      features={[
        'Co-edit documents with clients and team in real time',
        'Leave threaded inline comments on specific sections',
        'Track changes so edits can be reviewed before accepting',
        'Full version history with diff view between versions',
        'Share documents with clients via portal with access controls',
        'Export final document as PDF once review is complete',
      ]}
      dataDisplayed={[
        'Document name, type, and client',
        'Co-editors currently viewing document',
        'Open comment threads and resolved count',
        'Tracked change suggestion count',
        'Version count and last modified date',
      ]}
      userActions={[
        'Open a document for co-editing',
        'Leave a comment on a paragraph',
        'Accept or reject tracked changes',
        'View version history and compare versions',
        'Share document with client via portal',
      ]}
    />
  )
}

// ── Comm Settings ────────────────────────────────────────────────────────────
function CommSettingsPanel() {
  return (
    <PageDocumentation
      title="Communication Settings"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Communication / Comm Settings"
      purpose="Communication Settings controls the practice's communication preferences and defaults — including email sender domain configuration, notification preferences for staff and clients, default message templates, portal messaging settings, and unsubscribe policy management. These settings ensure the practice's outbound communications align with the firm's brand and that clients receive the right level of messaging without being overwhelmed."
      components={[
        { name: 'Email Sender Configuration', description: 'Configure the From name, reply-to address, and email domain for all practice outbound email.' },
        { name: 'Staff Notification Preferences', description: 'Control which system events trigger notifications to staff: new task, client reply, overdue, etc.' },
        { name: 'Client Notification Defaults', description: 'Define default notification settings for new clients (can be overridden per client).' },
        { name: 'Portal Message Settings', description: 'Configure portal message delivery: email notification on new portal message, digest frequency.' },
        { name: 'Unsubscribe Management', description: 'View clients or contacts who have unsubscribed from communications and manage overrides.' },
      ]}
      tabs={['Email Configuration', 'Staff Notifications', 'Client Defaults', 'Portal Settings', 'Unsubscribes']}
      features={[
        'Configure email sender identity and domain',
        'Control which events trigger staff notifications',
        'Set default notification preferences for clients',
        'Configure portal message delivery settings',
        'Manage unsubscribe list and communication overrides',
        'Test outbound email configuration before sending',
      ]}
      dataDisplayed={[
        'Sender email and display name',
        'Staff notification event list and on/off settings',
        'Client default notification preferences',
        'Portal message email alert settings',
        'Unsubscribed client count and list',
      ]}
      userActions={[
        'Set sender email address and display name',
        'Configure which events notify staff',
        'Update default client notification preferences',
        'Turn on/off portal message email alerts',
        'Review and manage unsubscribe list',
      ]}
    />
  )
}

// ── Security ─────────────────────────────────────────────────────────────────
function SecurityPanel() {
  return (
    <PageDocumentation
      title="Security"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Settings / Security"
      purpose="Security gives the practice administrator control over access security settings — including two-factor authentication enforcement for staff, session timeout policies, IP allowlisting, password strength requirements, login attempt limits, and active session monitoring. The panel also surfaces any active security alerts such as unusual login locations or simultaneous login events that may indicate compromised credentials."
      components={[
        { name: '2FA Enforcement', description: 'Toggle to require all staff to use TOTP or SMS-based two-factor authentication.' },
        { name: 'Session Policy', description: 'Set session timeout duration and whether login persists across browser restarts.' },
        { name: 'IP Allowlist', description: 'Restrict login access to a defined list of trusted IP addresses or CIDR ranges.' },
        { name: 'Active Sessions Monitor', description: 'View all currently active staff login sessions with device, IP, and last activity time.' },
        { name: 'Security Alerts', description: 'Recent security events: failed logins, unusual locations, concurrent session detections.' },
      ]}
      tabs={['2FA Settings', 'Session Policy', 'IP Allowlist', 'Active Sessions', 'Security Alerts']}
      features={[
        'Enforce two-factor authentication for all staff',
        'Set session timeout and persistence policies',
        'Restrict access to trusted IP addresses',
        'Monitor all currently active login sessions',
        'Review security alerts for suspicious activity',
        'Terminate suspicious active sessions remotely',
      ]}
      dataDisplayed={[
        '2FA enforcement status (on/off)',
        'Current session policy settings',
        'IP allowlist entries',
        'Active sessions with device and IP',
        'Recent security alert events',
      ]}
      userActions={[
        'Enable or enforce 2FA for all staff',
        'Update session timeout policy',
        'Add IP to allowlist',
        'View and terminate active sessions',
        'Review and dismiss security alerts',
      ]}
    />
  )
}

// ── Data Management ──────────────────────────────────────────────────────────
function DataManagementPanel() {
  return (
    <PageDocumentation
      title="Data Management"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Settings / Data Management"
      purpose="Data Management provides tools for the practice to export, back up, and manage the data stored within the practice hub — including client records, billing history, engagement data, communication logs, and document archives. The module supports full practice data export for regulatory retention requirements, selective data purge under right-to-deletion requests, and data import for migrating from a prior practice management system."
      components={[
        { name: 'Data Export Tool', description: 'Export selected data categories (clients, invoices, communications, documents) as CSV, JSON, or ZIP.' },
        { name: 'Scheduled Backup', description: 'Configure automatic scheduled backups of practice data to a secure cloud storage destination.' },
        { name: 'Data Purge Workflow', description: 'Controlled purge of specific client records in compliance with data deletion policy, with audit trail.' },
        { name: 'Import Wizard', description: 'Step-by-step import tool for migrating client and billing data from another system.' },
        { name: 'Storage Usage Dashboard', description: 'Breakdown of storage used by data category: documents, attachments, logs, etc.' },
      ]}
      tabs={['Export Data', 'Scheduled Backup', 'Import Wizard', 'Storage Usage', 'Purge']}
      features={[
        'Export practice data by category for retention',
        'Schedule automated data backups to cloud storage',
        'Import data from a previous practice management system',
        'Purge client data per deletion policy with audit trail',
        'Monitor storage usage by data category',
        'Full data export for regulatory compliance',
      ]}
      dataDisplayed={[
        'Export categories available and file format',
        'Scheduled backup status and last run',
        'Import job status and row count',
        'Storage used by category',
        'Purge requests pending and completed',
      ]}
      userActions={[
        'Start a data export by category',
        'Configure a scheduled backup',
        'Run the import wizard for data migration',
        'Submit a data purge request',
        'View storage usage breakdown',
      ]}
    />
  )
}

// ── Localization ─────────────────────────────────────────────────────────────
function LocalizationPanel() {
  return (
    <PageDocumentation
      title="Localization"
      module="PRACTICE HUB"
      breadcrumb="Practice Hub / Settings / Localization"
      purpose="Localization controls the regional and language settings for the practice hub — including the interface language, date format, number format, currency symbol placement, fiscal year start month, and tax jurisdiction-specific labels. These settings ensure that the practice hub displays correctly for the practice's regional context and that all client-facing documents use the correct date and number formatting conventions."
      components={[
        { name: 'Language Selector', description: 'Choose the practice hub UI language (e.g., English, Spanish, French, Filipino).' },
        { name: 'Date & Number Formats', description: 'Configure date format (MM/DD/YYYY vs. DD/MM/YYYY) and number separators (. vs. ,).' },
        { name: 'Currency Display', description: 'Set the default currency symbol, currency code, and decimal precision for amounts.' },
        { name: 'Fiscal Year Configuration', description: 'Set the fiscal year start month for all period-based reporting.' },
        { name: 'Tax Label Localization', description: "Map generic tax labels (e.g., 'Sales Tax') to local equivalents (e.g., 'VAT', 'GST', 'BIR')." },
      ]}
      tabs={['Language', 'Date & Numbers', 'Currency', 'Fiscal Year', 'Tax Labels']}
      features={[
        'Set system language for the practice hub interface',
        'Configure date and number format matching regional conventions',
        'Set default currency symbol and decimal precision',
        'Define fiscal year start month for period reporting',
        'Map tax labels to local regulatory terminology',
        'Changes apply to all practice-generated documents',
      ]}
      dataDisplayed={[
        'Currently selected UI language',
        'Date format and number separator settings',
        'Currency symbol and decimal precision',
        'Fiscal year start month',
        'Mapped tax label names by jurisdiction',
      ]}
      userActions={[
        'Change the interface language',
        'Update date and number formats',
        'Set currency symbol and precision',
        'Configure fiscal year start month',
        'Update tax label names for local jurisdiction',
      ]}
    />
  )
}


// Placeholder panel for nav items without dedicated panels
function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <BriefcaseBusiness size={28} className="text-blue-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">{label}</h2>
      <p className="text-sm text-slate-500 mb-4">This feature is under development.</p>
      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
        <Clock size={12} />
        Coming Soon
      </span>
    </div>
  )
}
function DashboardPanel() {
  const { data, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = usePracticeDashboard()
  const { clients, loading: clientsLoading, error: clientsError, refresh: refreshClients } = usePracticeClients()
  const [helpOpen, setHelpOpen] = useState(false)

  const isLoading = dashboardLoading || clientsLoading
  const isLive = !!data

  return (
    <div className="space-y-6">
      {(dashboardError || clientsError) && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {(dashboardError || clientsError) ?? 'Failed to load practice dashboard data'}
        </div>
      )}

      {!isLive && !isLoading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-2 rounded-xl">
          Showing placeholder data — connect your practice to see real figures.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{data?.firmName ?? 'Practice Dashboard'}</h2>
          <p className="text-sm text-slate-500 mt-0.5">Active clients: {data?.activeClientCount ?? 0}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={refreshDashboard} className="px-3 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold">Refresh Dashboard</button>
          <button onClick={refreshClients} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">Refresh Clients</button>
          <button onClick={() => setHelpOpen(true)} className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold" aria-label="Open Dashboard help">?</button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">My Clients</h3>
          <span className="text-xs text-slate-500">{clients.length} clients</span>
        </div>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading clients…</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-slate-500">No clients yet. Connect a client to see this list.</p>
        ) : (
          <div className="space-y-2">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                  <p className="text-xs text-slate-500">{client.currency} • {client.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <span className={`text-xs font-semibold ${client.isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                  {client.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Practice Dashboard Help</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">Close</button>
            </div>
            <p className="text-sm text-slate-700 mb-3">This dashboard displays the latest practice health metrics and client summaries. Use the refresh buttons to update data and review the client list below.</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>Refresh Dashboard rewrites practice KPIs from the backend.</li>
              <li>Refresh Clients reloads the client roster and statuses.</li>
              <li>Active clients are shown in the list with status badges.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PracticeHubPage() {
  const searchParams = useSearchParams()
  const practiceId = searchParams?.get('practiceId')
  if (practiceId) console.log('practiceId selected:', practiceId)
  const [activeGroup, setActiveGroup] = useState('home')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [panelOpen, setPanelOpen] = useState(true)
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  const currentGroup = NAV.find(g => g.key === activeGroup)!

  // Auto-expand the group containing the active section
  useEffect(() => {
    if (!currentGroup?.groups) return
    const matchingGroup = currentGroup.groups.find(g =>
      g.items.some(item => item.key === activeSection)
    )
    if (matchingGroup) {
      setOpenGroups(prev => {
        if (prev.has(matchingGroup.group_name)) return prev
        const next = new Set(prev)
        next.add(matchingGroup.group_name)
        return next
      })
    }
  }, [activeSection, currentGroup])

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(false)

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

  const allItems = currentGroup?.groups?.flatMap(g => g.items) ?? []
  const activeItem = allItems.find((i: any) => i.key === activeSection)

  const selectGroup = (key: string) => {
    setActiveGroup(key)
    const group = NAV.find(g => g.key === key)!
    const firstItem = group.groups?.[0]?.items?.[0]?.key
    if (firstItem) setActiveSection(firstItem)
    setPanelOpen(true)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 bg-slate-900 flex items-center justify-between px-5 border-b border-slate-700 shadow-xl z-50">
        {/* Left: logo + switcher */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 pr-5 border-r border-slate-700">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <BriefcaseBusiness size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-none tracking-tight">Haypbooks</p>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest leading-none mt-0.5">Practice Hub</p>
            </div>
          </div>
          <button className="hidden md:flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-700 transition-colors group">
            <LayoutGrid size={13} className="text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
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
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              placeholder="Search clients, tasks, reports..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-20 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all"
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
          <button
            title="Development Checklist"
            onClick={() => setChecklistOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl transition-all text-xs font-bold"
          >
            <ListChecks size={15} />
            <span className="hidden xl:inline">Checklist</span>
          </button>
          <div className="ml-2 pl-3 border-l border-slate-700 relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-700/30">
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
            className="absolute left-1.5 w-1.5 rounded-r-full bg-blue-400 shadow-[2px_0_8px_rgba(59,130,246,0.5)] pointer-events-none z-20"
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
                    ? 'bg-slate-700 text-white shadow-lg ring-1 ring-blue-500/40'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                <group.icon
                  size={20}
                  className={isActive ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span className={`text-[10px] mt-1.5 font-black uppercase tracking-tight text-center leading-tight px-1 w-full break-words ${isActive ? 'text-blue-300' : 'text-slate-600 group-hover:text-slate-400'
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
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <currentGroup.icon size={14} className="text-blue-700" />
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




            {/* Nav items - Collapsible Groups */}
            <nav className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-0.5">
              {currentGroup.groups?.map((group, gIdx) => {
                const isOpen = openGroups.has(group.group_name)
                return (
                  <div key={group.group_name}>
                    {/* Group Header - Collapsible */}
                    <button
                      onClick={() => setOpenGroups(prev => {
                        const next = new Set(prev)
                        if (next.has(group.group_name)) { next.delete(group.group_name) }
                        else { next.add(group.group_name) }
                        return next
                      })}
                      className={`w-full flex items-center justify-between px-3 py-2 mt-3 rounded-lg transition-colors group ${
                        isOpen ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 select-none">
                        {group.group_name}
                      </span>
                      <span className="flex items-center gap-1">
                        {isOpen ? (
                          <ChevronDown size={12} className="text-blue-500" />
                        ) : (
                          <ChevronRight size={12} className="text-slate-300" />
                        )}
                      </span>
                    </button>

                    {/* Group Items - Expandable */}
                    {isOpen && (
                      <div className="mt-0.5 space-y-0.5">
                        {group.items.map((item) => {
                          const isActive = activeSection === item.key
                          return (
                            <button
                              key={item.key}
                              onClick={() => setActiveSection(item.key)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-600/10 text-blue-700 shadow-sm'
                                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                            >
                              <span className="flex-1 text-left truncate">{item.label}</span>
                              {isActive && <ChevronRight size={12} className="ml-auto text-blue-400 flex-shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

          </aside>
        )}

        {/* Re-open panel button */}
        {!panelOpen && (
          <button
            title="Open navigation"
            onClick={() => setPanelOpen(true)}
            className="absolute top-[15px] left-[79px] z-50 flex items-center justify-center p-1.5 bg-blue-500 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/30 transition-all"
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
            {activeSection === 'annual-close' && <AnnualEngagementsPanel />}
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
            {activeSection === 'practice-analytics' && <PracticeOverviewPanel />}
            {activeSection === 'client-analytics' && <ClientAnalyticsPanel />}
            {activeSection === 'staff-reports' && <StaffReportsPanel />}
            {activeSection === 'billing-reports' && <BillingReportsPanel />}
            {activeSection === 'work-reports' && <WorkReportsPanel />}
            {activeSection === 'profile' && <PracticeProfilePanel />}
            {activeSection === 'team-management' && <TeamManagementPanel />}
            {activeSection === 'templates' && <TemplatesPanel />}
            {activeSection === 'automation' && <AutomationPanel />}
            {activeSection === 'integrations' && <IntegrationsPanel />}
            {activeSection === 'subscriptions' && <SubscriptionsPanel />}
            {activeSection === 'performance' && <PerformancePanel />}
            {activeSection === 'deadlines-home' && <DeadlinesHomePanel />}
            {activeSection === 'notifications' && <NotificationsPanel />}
            {activeSection === 'help' && <HelpPanel />}
            {activeSection === 'client-groups' && <ClientGroupsPanel />}
            {activeSection === 'client-transitions' && <ClientTransitionsPanel />}
            {activeSection === 'deadline-tracker' && <DeadlineTrackerPanel />}
            {activeSection === 'audit-trail' && <AuditTrailPanel />}
            {activeSection === 'period-close' && <PeriodClosePanel />}
            {activeSection === 'retainers' && <RetainersPanel />}
            {activeSection === 'collections' && <CollectionsPanel />}
            {activeSection === 'write-offs' && <WriteOffsPanel />}
            {activeSection === 'financial-reports' && <FinancialReportsPanel />}
            {activeSection === 'team-members' && <TeamMembersPanel />}
            {activeSection === 'time-off' && <TimeOffPanel />}
            {activeSection === 'schedule' && <SchedulePanel />}
            {activeSection === 'team-performance' && <TeamPerformancePanel />}
            {activeSection === 'team-capacity' && <TeamCapacityPanel />}
            {activeSection === 'team-chat' && <TeamChatPanel />}
            {activeSection === 'client-communication' && <ClientCommunicationPanel />}
            {activeSection === 'announcements' && <AnnouncementsPanel />}
            {activeSection === 'document-collab' && <DocumentCollabPanel />}
            {activeSection === 'comm-settings' && <CommSettingsPanel />}
            {activeSection === 'security' && <SecurityPanel />}
            {activeSection === 'data-management' && <DataManagementPanel />}
            {activeSection === 'localization' && <LocalizationPanel />}
            {activeSection === 'engagements' && <PlaceholderPanel label="Engagements" />}
            {activeSection === 'work-papers' && <PlaceholderPanel label="Work Papers" />}
            {activeSection === 'timesheet-entry' && <PlaceholderPanel label="Timesheet Entry" />}
            {activeSection === 'time-approvals' && <PlaceholderPanel label="Time Approvals" />}
          </main>
        </div>
      </div>
      <PracticeProgressChecklist open={checklistOpen} onClose={() => setChecklistOpen(false)} />
    </div>
  )
}
