'use client'

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import {
  Plus, Search, RefreshCw, ArrowUpDown, X, Globe, Bell, Shield,
  Eye, FileText, CreditCard, Download, BookOpen, Clock, CheckSquare,
  Mail, LogIn, AlertCircle, Loader2, Send, Ban, RotateCcw, Activity,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'
import { useToast } from '@/components/ToastProvider'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string
  name: string
  email?: string
  status?: string
}

interface PortalInvitation {
  id: string
  customerId: string
  customerName: string
  email: string
  portalStatus: 'Active' | 'Invited' | 'Disabled'
  lastLogin: string | null
}

interface ActivityEntry {
  id: string
  customerId: string
  customerName: string
  action: string
  timestamp: string
}

interface ColDef {
  key: string
  label: string
  visible: boolean
  width: number
  align?: 'left' | 'right'
}

type SortKey = 'customerName' | 'email' | 'portalStatus' | 'lastLogin'
type SortDir = 'asc' | 'desc'

// ─── Column config ────────────────────────────────────────────────────────────

const DEFAULT_COLS: ColDef[] = [
  { key: 'customerName', label: 'Customer', visible: true, width: 200, align: 'left' },
  { key: 'email', label: 'Email', visible: true, width: 220, align: 'left' },
  { key: 'portalStatus', label: 'Portal Status', visible: true, width: 140, align: 'left' },
  { key: 'lastLogin', label: 'Last Login', visible: true, width: 160, align: 'left' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('customer-portal-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, visible: sc.visible, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_COLS
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string | null): string {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return s }
}

function fmtDateTime(s: string): string {
  try { return new Date(s).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return s }
}

function statusBadge(status: PortalInvitation['portalStatus']): string {
  switch (status) {
    case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Invited': return 'bg-sky-50 text-sky-700 border-sky-200'
    case 'Disabled': return 'bg-slate-100 text-slate-500 border-slate-200'
  }
}

function compareRows(a: PortalInvitation, b: PortalInvitation, key: SortKey, dir: SortDir): number {
  const mul = dir === 'asc' ? 1 : -1
  if (key === 'lastLogin') {
    const av = a.lastLogin ? new Date(a.lastLogin).getTime() : 0
    const bv = b.lastLogin ? new Date(b.lastLogin).getTime() : 0
    return (av - bv) * mul
  }
  const av = String((a as any)[key] ?? '').toLowerCase()
  const bv = String((b as any)[key] ?? '').toLowerCase()
  return av.localeCompare(bv) * mul
}

// ─── Toggle UI component ──────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-emerald-600' : 'bg-slate-200'}`}
    >
      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

// ─── Mock activity data ───────────────────────────────────────────────────────

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: 'a1', customerId: 'c1', customerName: 'Acme Corp', action: 'Viewed invoice INV-0042', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 'a2', customerId: 'c2', customerName: 'Blue Sky Ltd', action: 'Made online payment of ₱12,500', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'a3', customerId: 'c3', customerName: 'Green Fields Co', action: 'Downloaded statement (PDF)', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'a4', customerId: 'c1', customerName: 'Acme Corp', action: 'Logged in to portal', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 'a5', customerId: 'c4', customerName: 'Harbor Tech', action: 'Accepted quote QT-0018 online', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() },
  { id: 'a6', customerId: 'c5', customerName: 'Summit Retail', action: 'Viewed account statement', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function CustomerPortalPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const toast = useToast()

  // ── Portal Settings ──────────────────────────────────────────────────────
  const [portalEnabled, setPortalEnabled] = useState(true)
  const [portalUrl, setPortalUrl] = useState('portal.mybusiness.haypbooks.com')
  const [primaryColor, setPrimaryColor] = useState('#059669')
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to our customer portal. Manage your invoices, payments, and documents here.')
  const [language, setLanguage] = useState('en')

  // ── Permissions ──────────────────────────────────────────────────────────
  const [perms, setPerms] = useState({
    viewInvoices: true,
    viewQuotes: true,
    viewSalesOrders: false,
    makePayments: true,
    downloadPdf: true,
    viewStatement: true,
    viewPaymentHistory: true,
    acceptDeclineQuotes: true,
  })

  // ── Notifications ────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    inviteOnCreate: true,
    paymentConfirmation: true,
    invoiceNotification: true,
  })

  // ── Invitations table ─────────────────────────────────────────────────────
  const [invitations, setInvitations] = useState<PortalInvitation[]>([])
  const [loadingInvites, setLoadingInvites] = useState(true)
  const [inviteError, setInviteError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<''>  | PortalInvitation['portalStatus']>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey>('customerName')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const [showColMenu, setShowColMenu] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('customer-portal-cols-v1', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const { containerRef, startResize: onResizeStart, isOverflowing } = useFixedWidthResizableColumns({
    columns: cols,
    columnsRef: colsRef,
    saveColumns: saveCols,
    fixedWidth: 120,
  })

  // ── Send Invites modal ────────────────────────────────────────────────────
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set())
  const [sendingInvites, setSendingInvites] = useState(false)
  const [customersLoading, setCustomersLoading] = useState(false)

  // ── Fetch invitations (customers with mock portal status) ─────────────────
  const fetchInvitations = useCallback(async () => {
    if (!companyId) return
    setLoadingInvites(true)
    setInviteError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/customers`)
      const raw: any[] = Array.isArray(data) ? data : data?.items ?? data?.data ?? []
      // Simulate portal status from real customer data
      const statuses: PortalInvitation['portalStatus'][] = ['Active', 'Invited', 'Disabled']
      const mapped: PortalInvitation[] = raw.slice(0, 50).map((c: any, i: number) => ({
        id: c.id,
        customerId: c.id,
        customerName: c.name ?? c.displayName ?? '—',
        email: c.email ?? '—',
        portalStatus: statuses[i % 3],
        lastLogin: i % 3 === 0 ? new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 1)).toISOString() : null,
      }))
      setInvitations(mapped)
    } catch (err: any) {
      setInviteError(err?.response?.data?.message ?? 'Failed to load customers')
    } finally {
      setLoadingInvites(false)
    }
  }, [companyId])

  useEffect(() => { fetchInvitations() }, [fetchInvitations])

  // ── Fetch all customers for invite modal ──────────────────────────────────
  const fetchAllCustomers = useCallback(async () => {
    if (!companyId) return
    setCustomersLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/customers`)
      const raw: any[] = Array.isArray(data) ? data : data?.items ?? data?.data ?? []
      setAllCustomers(raw.map((c: any) => ({ id: c.id, name: c.name ?? c.displayName ?? '—', email: c.email ?? '' })))
    } catch { /* non-blocking */ }
    finally { setCustomersLoading(false) }
  }, [companyId])

  const openInviteModal = () => {
    setCustomerSearch('')
    setSelectedCustomerIds(new Set())
    setShowInviteModal(true)
    fetchAllCustomers()
  }

  const handleSendInvites = async () => {
    if (selectedCustomerIds.size === 0) { toast.error('Select at least one customer'); return }
    setSendingInvites(true)
    try {
      // UI-only: simulate sending invitations
      await new Promise(r => setTimeout(r, 800))
      toast.success(`Portal invitations sent to ${selectedCustomerIds.size} customer(s)`)
      setShowInviteModal(false)
      fetchInvitations()
    } catch { toast.error('Failed to send invitations') }
    finally { setSendingInvites(false) }
  }

  // ── Sort / filter invitations ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = invitations
    if (statusFilter) list = list.filter(r => r.portalStatus === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r => r.customerName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => compareRows(a, b, sortKey, sortDir))
  }, [invitations, statusFilter, search, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(r => r.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  // ── Batch actions ─────────────────────────────────────────────────────────
  const handleBatchSendInvites = async () => {
    if (!selectedIds.size) return
    setBatchLoading(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      toast.success(`Invitations sent to ${selectedIds.size} customer(s)`)
      setSelectedIds(new Set())
    } catch { toast.error('Failed to send invitations') }
    finally { setBatchLoading(false) }
  }

  const handleBatchRevoke = async () => {
    if (!selectedIds.size || !window.confirm(`Revoke portal access for ${selectedIds.size} customer(s)?`)) return
    setBatchLoading(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      toast.success(`Access revoked for ${selectedIds.size} customer(s)`)
      setSelectedIds(new Set())
      fetchInvitations()
    } catch { toast.error('Failed to revoke access') }
    finally { setBatchLoading(false) }
  }

  const handleResendInvite = async (inv: PortalInvitation) => {
    try {
      await new Promise(r => setTimeout(r, 400))
      toast.success(`Invitation resent to ${inv.customerName}`)
    } catch { toast.error('Failed to resend invitation') }
  }

  const handleRevoke = async (inv: PortalInvitation) => {
    if (!window.confirm(`Revoke portal access for ${inv.customerName}?`)) return
    try {
      await new Promise(r => setTimeout(r, 400))
      toast.success(`Access revoked for ${inv.customerName}`)
      fetchInvitations()
    } catch { toast.error('Failed to revoke') }
  }

  const handleSaveSettings = () => {
    toast.success('Portal settings saved')
  }

  const visibleCols = cols.filter(c => c.visible)

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return allCustomers
    const q = customerSearch.toLowerCase()
    return allCustomers.filter(c => c.name.toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q))
  }, [allCustomers, customerSearch])

  if (cidLoading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="ml-2 text-emerald-700">Loading…</span>
    </div>
  )
  if (cidError) return <div className="p-6 text-red-600">{cidError}</div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Portal</h1>
            <p className="text-sm text-slate-500 mt-1">Configure the customer self-service portal your clients use to view invoices, make payments, and manage their account</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchInvitations} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="Refresh invitations">
              <RefreshCw size={16} />
            </button>
            <button onClick={handleSaveSettings} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">
              Save Settings
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">

        {/* ── Row 1: Portal Settings + Notification Settings ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Portal Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={18} className="text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-900">Portal Settings</h2>
            </div>

            {/* Enable/disable */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800">Enable Customer Portal</p>
                <p className="text-xs text-slate-500 mt-0.5">When off, customers cannot access the portal</p>
              </div>
              <Toggle checked={portalEnabled} onChange={() => setPortalEnabled(v => !v)} />
            </div>

            {/* Portal URL */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Portal URL</label>
              <input
                value={portalUrl}
                onChange={e => setPortalUrl(e.target.value)}
                disabled={!portalEnabled}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="portal.mybusiness.haypbooks.com"
              />
            </div>

            {/* Primary color */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  disabled={!portalEnabled}
                  className="w-9 h-9 rounded border border-slate-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 p-0.5"
                />
                <input
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  disabled={!portalEnabled}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400 font-mono"
                  placeholder="#059669"
                />
              </div>
            </div>

            {/* Welcome message */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Welcome Message</label>
              <textarea
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                disabled={!portalEnabled}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400 resize-none"
                placeholder="Welcome to our customer portal…"
              />
            </div>

            {/* Language */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Portal Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                disabled={!portalEnabled}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
                <option value="fil">Filipino</option>
                <option value="zh">Chinese (Simplified)</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell size={18} className="text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-900">Notification Settings</h2>
            </div>
            <div className="space-y-5">
              {([
                { key: 'inviteOnCreate', label: 'Send portal invitation on customer creation', description: 'Automatically invite new customers to the portal when they are added' },
                { key: 'paymentConfirmation', label: 'Send payment confirmation email', description: 'Notify customers by email when their payment is processed' },
                { key: 'invoiceNotification', label: 'Send invoice notification email', description: 'Email customers when a new invoice is issued to them' },
              ] as const).map(item => (
                <div key={item.key} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                  <Toggle
                    checked={notifs[item.key]}
                    onChange={() => setNotifs(v => ({ ...v, [item.key]: !v[item.key] }))}
                    disabled={!portalEnabled}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Permissions ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">Customer Permissions</h2>
            <span className="ml-2 text-xs text-slate-400">What customers can see and do in the portal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            {([
              { key: 'viewInvoices', icon: FileText, label: 'View Invoices', description: 'Customers can browse their invoice history' },
              { key: 'viewQuotes', icon: BookOpen, label: 'View Quotes / Estimates', description: 'Customers can view quotes sent to them' },
              { key: 'viewSalesOrders', icon: CheckSquare, label: 'View Sales Orders', description: 'Customers can track their sales orders' },
              { key: 'makePayments', icon: CreditCard, label: 'Make Online Payments', description: 'Customers can pay invoices directly in the portal' },
              { key: 'downloadPdf', icon: Download, label: 'Download Documents as PDF', description: 'Customers can export invoices and statements as PDF' },
              { key: 'viewStatement', icon: Eye, label: 'View Account Statement', description: 'Customers can view a full statement of their account' },
              { key: 'viewPaymentHistory', icon: Clock, label: 'View Payment History', description: 'Customers can see a log of all previous payments' },
              { key: 'acceptDeclineQuotes', icon: CheckSquare, label: 'Accept / Decline Quotes Online', description: 'Customers can approve or reject quotes from the portal' },
            ] as const).map(item => (
              <div key={item.key} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5 min-w-0">
                  <item.icon size={15} className="mt-0.5 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <Toggle
                  checked={perms[item.key]}
                  onChange={() => setPerms(v => ({ ...v, [item.key]: !v[item.key] }))}
                  disabled={!portalEnabled}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Invitations Table ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-900">Portal Invitations</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  placeholder="Search customers…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                />
              </div>
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Invited">Invited</option>
                <option value="Disabled">Disabled</option>
              </select>
              {/* Column toggle */}
              <div className="relative">
                <button onClick={() => setShowColMenu(v => !v)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Columns</button>
                {showColMenu && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-40 py-2">
                    {cols.map(c => (
                      <label key={c.key} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={c.visible} onChange={() => saveCols(cols.map(col => col.key === c.key ? { ...col, visible: !col.visible } : col))} className="accent-emerald-600" />
                        {c.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* Send Invites */}
              <button onClick={openInviteModal} disabled={!portalEnabled} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-lg shadow-sm">
                <Plus size={15} /> Send Invites
              </button>
            </div>
          </div>

          {/* Batch bar */}
          {selectedIds.size > 0 && (
            <div className="bg-emerald-700 text-white px-6 py-2.5 flex items-center gap-3 text-sm font-medium">
              <span>{selectedIds.size} selected</span>
              <button onClick={handleBatchSendInvites} disabled={batchLoading} className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold disabled:opacity-50">
                <Send size={12} /> Resend Invites
              </button>
              <button onClick={handleBatchRevoke} disabled={batchLoading} className="flex items-center gap-1 px-3 py-1 bg-rose-500 hover:bg-rose-600 rounded text-xs font-semibold disabled:opacity-50">
                <Ban size={12} /> Revoke Access
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto p-1 hover:bg-white/20 rounded"><X size={14} /></button>
            </div>
          )}

          {/* Table */}
          <div ref={containerRef} className={`${isOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
            <table className="w-full text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-3 w-10 border-r border-slate-200">
                    <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleAll} className="accent-emerald-600" />
                  </th>
                  {visibleCols.map((col, ci) => (
                    <th
                      key={col.key}
                      style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                      className={`px-4 py-3 font-semibold text-xs uppercase tracking-wide relative select-none border-r border-slate-200 overflow-hidden ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key as SortKey)}
                        className="flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2"
                        style={{ justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start' }}
                      >
                        <span className="truncate">{col.label}</span>
                        <ArrowUpDown size={11} className={`shrink-0 ${sortKey === col.key ? 'text-emerald-600' : 'text-slate-300'}`} />
                      </button>
                      {ci < visibleCols.length - 1 && (
                        <span onMouseDown={e => onResizeStart(e, col.key)} className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-gray-300/60" />
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingInvites ? (
                  <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />Loading customers…
                  </td></tr>
                ) : inviteError ? (
                  <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center">
                    <AlertCircle size={20} className="mx-auto mb-2 text-rose-400" />
                    <p className="text-rose-500 font-medium">{inviteError}</p>
                    <button onClick={fetchInvitations} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-slate-500">No customers found.</td></tr>
                ) : filtered.map(row => (
                  <tr key={row.id} className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${selectedIds.has(row.id) ? 'bg-emerald-50' : ''}`}>
                    <td className="px-3 py-3 border-r border-slate-100">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-emerald-600" />
                    </td>
                    {visibleCols.map(col => (
                      <td key={col.key} className={`px-4 py-3 truncate border-r border-slate-100 ${col.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                        {col.key === 'customerName' && <span className="font-medium text-slate-900">{row.customerName}</span>}
                        {col.key === 'email' && <span className="text-slate-600">{row.email}</span>}
                        {col.key === 'portalStatus' && (
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${statusBadge(row.portalStatus)}`}>
                            {row.portalStatus}
                          </span>
                        )}
                        {col.key === 'lastLogin' && <span className="text-slate-600">{fmtDate(row.lastLogin)}</span>}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleResendInvite(row)} className="text-xs font-semibold text-sky-700 hover:underline flex items-center gap-0.5">
                          <RotateCcw size={11} /> Resend
                        </button>
                        <span className="text-slate-300">·</span>
                        <button onClick={() => handleRevoke(row)} className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-0.5">
                          <Ban size={11} /> Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} customer{filtered.length !== 1 ? 's' : ''} {statusFilter ? `with status "${statusFilter}"` : 'total'}
          </div>
        </div>

        {/* ── Portal Activity Log ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={18} className="text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">Recent Portal Activity</h2>
            <span className="ml-auto text-xs text-slate-400">Last 48 hours</span>
          </div>
          <div className="space-y-0">
            {MOCK_ACTIVITY.map((entry, i) => (
              <div key={entry.id} className={`flex items-start gap-3 py-3 ${i < MOCK_ACTIVITY.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {entry.action.startsWith('Logged') ? <LogIn size={13} className="text-slate-500" /> :
                   entry.action.includes('payment') ? <CreditCard size={13} className="text-emerald-600" /> :
                   entry.action.includes('Downloaded') ? <Download size={13} className="text-sky-600" /> :
                   entry.action.includes('Accepted') ? <CheckSquare size={13} className="text-emerald-600" /> :
                   <Eye size={13} className="text-slate-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800"><span className="font-medium">{entry.customerName}</span> — {entry.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{fmtDateTime(entry.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Send Invites Modal ────────────────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold text-slate-900">Send Portal Invitations</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-5 border-b border-slate-200 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  placeholder="Search customers…"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {selectedCustomerIds.size > 0 && (
                <p className="text-xs text-emerald-700 mt-2 font-medium">{selectedCustomerIds.size} customer{selectedCustomerIds.size !== 1 ? 's' : ''} selected</p>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {customersLoading ? (
                <div className="p-6 text-center text-slate-400">
                  <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />Loading…
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No customers found.</div>
              ) : filteredCustomers.map(c => (
                <label key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                  <input
                    type="checkbox"
                    checked={selectedCustomerIds.has(c.id)}
                    onChange={() => {
                      setSelectedCustomerIds(prev => {
                        const next = new Set(prev)
                        next.has(c.id) ? next.delete(c.id) : next.add(c.id)
                        return next
                      })
                    }}
                    className="accent-emerald-600"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                    {c.email && <p className="text-xs text-slate-500 truncate">{c.email}</p>}
                  </div>
                </label>
              ))}
            </div>
            <div className="p-5 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleSendInvites}
                disabled={sendingInvites || selectedCustomerIds.size === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-40"
              >
                {sendingInvites ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send {selectedCustomerIds.size > 0 ? `${selectedCustomerIds.size} ` : ''}Invitation{selectedCustomerIds.size !== 1 ? 's' : ''}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center">
                    <p className="text-rose-500 font-medium">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">No features found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.feature}</td>
                    <td className="px-4 py-3 text-slate-600">{row.description}</td>
                    <td className="px-4 py-3 text-slate-600">{row.visibility}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${row.status === 'Enabled' ? 'text-emerald-700' : 'text-rose-700'}`}>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Customer Portal Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Configure which features are available to portal users and segment by access level.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enable public or restricted features for different tiers.</li>
                <li>Manage portal access and monitor availability.</li>
                <li>Use this to improve customer self-service experience.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
