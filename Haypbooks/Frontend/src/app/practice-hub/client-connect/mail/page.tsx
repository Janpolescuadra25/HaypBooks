'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/* ─── Types ─────────────────────────────────────────────────── */
type Status = 'UPLOADED' | 'OPENED' | 'OVERDUE' | 'COMPLETED' | 'ARCHIVED'
type ItemStatus = 'APPROVED' | 'REJECTED' | 'PENDING' | 'UPLOADED'
type Filter = 'sent' | 'received' | 'overdue' | 'completed' | 'archived'
type Category = string

interface RequestedItem { name: string; status: ItemStatus }
interface UploadedFile  { name: string }
interface Discussion    { author: string; date: string; text: string; isMe: boolean }
interface Request {
  id: string
  filter: Filter
  client: string
  company: string
  title: string
  status: Status
  dueDate: string
  sentAt: string
  progress: [number, number]
  category: Category
  message: string
  uploadedFiles: UploadedFile[]
  requestedItems: RequestedItem[]
  discussion: Discussion[]
}

/* ─── Mock data ──────────────────────────────────────────────── */
const REQUESTS: Request[] = [
  // ── SENT ──
  {
    id: '1', filter: 'sent',
    client: 'Sarah Johnson', company: 'Sarah Designs',
    title: 'Q4 Bank Statements & Expense Receipts',
    status: 'UPLOADED', dueDate: 'Feb 28, 2024', sentAt: '2 days ago',
    progress: [2, 4], category: 'Tax',
    message: 'Please upload the bank statements for Oct-Dec 2023 along with all digital receipts for business expenses.',
    uploadedFiles: [
      { name: 'October Bank Statement' },
      { name: 'November Bank Statement' },
      { name: 'Expense Receipts Folder' },
    ],
    requestedItems: [
      { name: 'October Bank Statement', status: 'APPROVED' },
      { name: 'November Bank Statement', status: 'REJECTED' },
      { name: 'December Bank Statement', status: 'PENDING' },
      { name: 'Expense Receipts Folder', status: 'UPLOADED' },
    ],
    discussion: [
      { author: 'James Patel', date: 'Feb 19, 2024, 10:30 AM', text: 'Verified the October statement, thank you.', isMe: true },
      { author: 'James Patel', date: 'Feb 20, 2024, 2:15 PM', text: 'The November file is corrupted. Please re-upload.', isMe: true },
      { author: 'Sarah Johnson', date: 'Feb 20, 2024, 3:45 PM', text: 'Oh sorry! Uploading a fresh copy now.', isMe: false },
    ],
  },
  {
    id: '2', filter: 'sent',
    client: 'Michael Chen', company: 'TechFlow Inc.',
    title: 'W-9 Form for New Contractor',
    status: 'OPENED', dueDate: 'Mar 5, 2024', sentAt: '1 day ago',
    progress: [0, 1], category: 'Payroll',
    message: 'Please provide the completed W-9 form for your new contractor starting this quarter.',
    uploadedFiles: [],
    requestedItems: [{ name: 'W-9 Form', status: 'PENDING' }],
    discussion: [],
  },
  {
    id: '3', filter: 'sent',
    client: 'Rivera Enterprises', company: 'Rivera Enterprises',
    title: 'Annual Insurance Certificate',
    status: 'OPENED', dueDate: 'Mar 10, 2024', sentAt: '3 days ago',
    progress: [0, 2], category: 'Action Required',
    message: 'Please provide your current business liability insurance certificate for our records.',
    uploadedFiles: [],
    requestedItems: [
      { name: 'Liability Insurance Certificate', status: 'PENDING' },
      { name: 'Workers Comp Certificate', status: 'PENDING' },
    ],
    discussion: [],
  },

  // ── RECEIVED (client requesting from accountant) ──
  {
    id: '4', filter: 'received',
    client: 'Sarah Johnson', company: 'Sarah Designs',
    title: 'Profit & Loss Report — Jan to Dec 2023',
    status: 'OPENED', dueDate: 'Mar 1, 2024', sentAt: '5 hours ago',
    progress: [0, 1], category: 'Client Inquiry',
    message: 'Hi, can you please prepare and send me the full-year Profit & Loss report for Jan–Dec 2023? I need it for a bank loan application.',
    uploadedFiles: [],
    requestedItems: [{ name: 'P&L Report (Jan–Dec 2023)', status: 'PENDING' }],
    discussion: [
      { author: 'Sarah Johnson', date: 'Feb 22, 2024, 9:00 AM', text: 'Please send ASAP — the bank deadline is March 1st.', isMe: false },
    ],
  },
  {
    id: '5', filter: 'received',
    client: 'Michael Chen', company: 'TechFlow Inc.',
    title: 'Q4 2023 Balance Sheet & Cash Flow Statement',
    status: 'UPLOADED', dueDate: 'Feb 25, 2024', sentAt: '1 day ago',
    progress: [2, 2], category: 'Tax',
    message: 'We need the Q4 Balance Sheet and Cash Flow Statement for our investors. Please prepare and attach both documents.',
    uploadedFiles: [],
    requestedItems: [
      { name: 'Q4 2023 Balance Sheet', status: 'UPLOADED' },
      { name: 'Q4 2023 Cash Flow Statement', status: 'UPLOADED' },
    ],
    discussion: [
      { author: 'Michael Chen', date: 'Feb 21, 2024, 3:00 PM', text: 'Investor meeting is on the 26th — need these before then.', isMe: false },
      { author: 'James Patel', date: 'Feb 22, 2024, 10:00 AM', text: 'Both documents are prepared and attached. Let me know if any revisions are needed.', isMe: true },
    ],
  },
  {
    id: '6', filter: 'received',
    client: 'Rivera Enterprises', company: 'Rivera Enterprises',
    title: '2023 Sales Tax Summary by State',
    status: 'OPENED', dueDate: 'Mar 10, 2024', sentAt: '2 hours ago',
    progress: [0, 3], category: 'Tax',
    message: 'Please compile and send us the 2023 sales tax summary broken down by state. We need CA, TX, and FL separately.',
    uploadedFiles: [],
    requestedItems: [
      { name: 'California Sales Tax Summary', status: 'PENDING' },
      { name: 'Texas Sales Tax Summary', status: 'PENDING' },
      { name: 'Florida Sales Tax Summary', status: 'PENDING' },
    ],
    discussion: [],
  },

  // ── OVERDUE ──
  {
    id: '7', filter: 'overdue',
    client: 'Rivera Enterprises', company: 'Rivera Enterprises',
    title: 'Q3 Payroll Records',
    status: 'OVERDUE', dueDate: 'Jan 15, 2024', sentAt: '12 days ago',
    progress: [0, 3], category: 'Payroll',
    message: 'We need the payroll records for Q3 2023 to complete the annual audit.',
    uploadedFiles: [],
    requestedItems: [
      { name: 'July Payroll Report', status: 'PENDING' },
      { name: 'August Payroll Report', status: 'PENDING' },
      { name: 'September Payroll Report', status: 'PENDING' },
    ],
    discussion: [],
  },
  {
    id: '8', filter: 'overdue',
    client: 'Greenfield LLC', company: 'Greenfield LLC',
    title: '2022 Corporate Tax Return Supporting Docs',
    status: 'OVERDUE', dueDate: 'Dec 31, 2023', sentAt: '6 weeks ago',
    progress: [1, 4], category: 'Tax',
    message: 'Please provide all supporting documents for your 2022 corporate tax return filing.',
    uploadedFiles: [{ name: 'EIN_Certificate.pdf' }],
    requestedItems: [
      { name: 'EIN Certificate', status: 'APPROVED' },
      { name: 'Schedule K-1 Forms', status: 'PENDING' },
      { name: 'Fixed Asset Register', status: 'PENDING' },
      { name: 'Loan Statements', status: 'PENDING' },
    ],
    discussion: [
      { author: 'James Patel', date: 'Jan 5, 2024, 10:00 AM', text: 'This is now 5 days overdue. Please upload immediately.', isMe: true },
      { author: 'Greenfield LLC', date: 'Jan 6, 2024, 2:00 PM', text: 'Sorry for the delay, getting these together now.', isMe: false },
    ],
  },
  {
    id: '9', filter: 'overdue',
    client: 'Harper & Sons', company: 'Harper & Sons',
    title: 'Signed Engagement Letter 2024',
    status: 'OVERDUE', dueDate: 'Feb 1, 2024', sentAt: '21 days ago',
    progress: [0, 1], category: 'Client Inquiry',
    message: 'Please return the signed engagement letter for the 2024 tax year before work can commence.',
    uploadedFiles: [],
    requestedItems: [{ name: 'Signed Engagement Letter', status: 'PENDING' }],
    discussion: [],
  },

  // ── COMPLETED ──
  {
    id: '10', filter: 'completed',
    client: 'Orion Imports', company: 'Orion Imports Ltd.',
    title: 'Q2 Sales Tax Documentation',
    status: 'COMPLETED', dueDate: 'Nov 30, 2023', sentAt: '3 months ago',
    progress: [4, 4], category: 'Tax',
    message: 'Please upload all Q2 sales tax documentation including collected tax registers.',
    uploadedFiles: [
      { name: 'Sales_Tax_Register_Q2.xlsx' },
      { name: 'State_Filing_Receipt.pdf' },
      { name: 'Exemption_Certificates.zip' },
      { name: 'Nexus_Summary.pdf' },
    ],
    requestedItems: [
      { name: 'Sales Tax Register', status: 'APPROVED' },
      { name: 'State Filing Receipt', status: 'APPROVED' },
      { name: 'Exemption Certificates', status: 'APPROVED' },
      { name: 'Nexus Summary', status: 'APPROVED' },
    ],
    discussion: [
      { author: 'James Patel', date: 'Dec 1, 2023, 4:00 PM', text: 'All documents reviewed and approved. Great work!', isMe: true },
    ],
  },
  {
    id: '11', filter: 'completed',
    client: 'Sarah Johnson', company: 'Sarah Designs',
    title: '2022 Personal Tax Filing Documents',
    status: 'COMPLETED', dueDate: 'Apr 15, 2023', sentAt: '10 months ago',
    progress: [3, 3], category: 'Tax',
    message: 'Please provide all documents needed to complete your 2022 personal tax return.',
    uploadedFiles: [],
    requestedItems: [
      { name: 'W-2 Form', status: 'APPROVED' },
      { name: '1099-NEC Forms', status: 'APPROVED' },
      { name: 'Mortgage Interest Statement', status: 'APPROVED' },
    ],
    discussion: [],
  },
  {
    id: '12', filter: 'completed',
    client: 'Blue Wave Marketing', company: 'Blue Wave Marketing',
    title: 'Updated Business Address & EIN Verification',
    status: 'COMPLETED', dueDate: 'Jan 20, 2024', sentAt: '1 month ago',
    progress: [2, 2], category: 'Client Inquiry',
    message: 'We need updated business address documentation and EIN verification for our records.',
    uploadedFiles: [],
    requestedItems: [
      { name: 'EIN Verification Letter', status: 'APPROVED' },
      { name: 'Updated Articles of Incorporation', status: 'APPROVED' },
    ],
    discussion: [],
  },

  // ── ARCHIVED ──
  {
    id: '13', filter: 'archived',
    client: 'ClearPath Advisors', company: 'ClearPath Advisors',
    title: '2021 Audit Support Documents',
    status: 'ARCHIVED', dueDate: 'Jun 30, 2022', sentAt: '18 months ago',
    progress: [5, 5], category: 'Tax',
    message: 'Please submit all documentation requested for the 2021 financial audit.',
    uploadedFiles: [],
    requestedItems: [
      { name: 'General Ledger Export', status: 'APPROVED' },
      { name: 'Bank Reconciliations', status: 'APPROVED' },
      { name: 'Fixed Asset Schedule', status: 'APPROVED' },
      { name: 'Accounts Receivable Aging', status: 'APPROVED' },
      { name: 'Accounts Payable Aging', status: 'APPROVED' },
    ],
    discussion: [],
  },
  {
    id: '14', filter: 'archived',
    client: 'Michael Chen', company: 'TechFlow Inc.',
    title: 'Onboarding KYC Documents',
    status: 'ARCHIVED', dueDate: 'Mar 1, 2023', sentAt: '1 year ago',
    progress: [3, 3], category: 'Client Inquiry',
    message: 'To complete your onboarding, please upload the following identity verification documents.',
    uploadedFiles: [],
    requestedItems: [
      { name: 'Government-issued ID', status: 'APPROVED' },
      { name: 'Proof of Address', status: 'APPROVED' },
      { name: 'Articles of Incorporation', status: 'APPROVED' },
    ],
    discussion: [],
  },
  {
    id: '15', filter: 'archived',
    client: 'Maple Street Cafe', company: 'Maple Street Cafe',
    title: 'Loan Application Supporting Docs',
    status: 'ARCHIVED', dueDate: 'Aug 15, 2023', sentAt: '6 months ago',
    progress: [4, 4], category: 'Action Required',
    message: 'Please supply the following documents to support your SBA loan application.',
    uploadedFiles: [],
    requestedItems: [
      { name: '3-Year P&L Statements', status: 'APPROVED' },
      { name: 'Balance Sheet', status: 'APPROVED' },
      { name: 'Cash Flow Projections', status: 'APPROVED' },
      { name: 'Business Plan', status: 'APPROVED' },
    ],
    discussion: [],
  },
]

/* ─── Helpers ────────────────────────────────────────────────── */
const STATUS_COLORS: Record<Status, string> = {
  UPLOADED:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  OPENED:    'bg-sky-50 text-sky-700 border-sky-200',
  OVERDUE:   'bg-red-50 text-red-600 border-red-200',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200',
  ARCHIVED:  'bg-slate-50 text-slate-400 border-slate-200',
}

const ITEM_STATUS: Record<ItemStatus, { label: string; color: string; dot: string }> = {
  APPROVED: { label: 'APPROVED', color: 'text-emerald-600', dot: 'bg-emerald-400' },
  REJECTED: { label: 'REJECTED', color: 'text-red-500',     dot: 'bg-red-400'     },
  PENDING:  { label: 'PENDING',  color: 'text-slate-400',   dot: 'bg-slate-300'   },
  UPLOADED: { label: 'UPLOADED', color: 'text-amber-500',   dot: 'bg-amber-400'   },
}

const CAT_PALETTE = [
  'bg-blue-500', 'bg-emerald-500', 'bg-red-400', 'bg-purple-400',
  'bg-amber-400', 'bg-sky-400', 'bg-pink-400', 'bg-orange-400', 'bg-teal-500', 'bg-indigo-400',
]

const DEFAULT_CATEGORIES: { name: Category; color: string }[] = [
  { name: 'Tax',            color: 'bg-blue-500'    },
  { name: 'Payroll',        color: 'bg-emerald-500' },
  { name: 'Action Required',color: 'bg-red-400'     },
  { name: 'Client Inquiry', color: 'bg-purple-400'  },
]

const FILTER_LABELS: { key: Filter; label: string; icon: string }[] = [
  { key: 'sent',      label: 'Sent',     icon: '➤' },
  { key: 'received',  label: 'Received', icon: '↩' },
  { key: 'overdue',   label: 'Overdue',  icon: '⏰' },
  { key: 'completed', label: 'Completed',icon: '✓' },
  { key: 'archived',  label: 'Archived', icon: '📦' },
]

/* ─── Component ──────────────────────────────────────────────── */
export default function ClientMailPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('sent')
  const [selectedId, setSelectedId] = useState<string>(REQUESTS[0].id)
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [showCatModal, setShowCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(CAT_PALETTE[0])
  // per-request category assignments (id → category name)
  const [reqCategories, setReqCategories] = useState<Record<string, string>>(() =>
    Object.fromEntries(REQUESTS.map(r => [r.id, r.category]))
  )
  const [showCatPicker, setShowCatPicker] = useState(false)
  const [newReqItems, setNewReqItems] = useState<string[]>(['', ''])

  // ── New Request modal behavior (mirrors NewInvoiceForm) ──────────────
  const DISCARD_ANIM_MS = 240
  const [isReqDialogVisible, setIsReqDialogVisible] = useState(false)
  const [reqIsDirty, setReqIsDirty] = useState(false)
  const [showReqDiscard, setShowReqDiscard] = useState(false)
  const [isReqDiscardMounted, setIsReqDiscardMounted] = useState(false)
  const [isReqDiscardVisible, setIsReqDiscardVisible] = useState(false)
  const reqDiscardTimer = useRef<number | null>(null)

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!showNewModal) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [showNewModal])

  // Animate dialog in on open
  useEffect(() => {
    if (!showNewModal) { setIsReqDialogVisible(false); return }
    const t = window.setTimeout(() => setIsReqDialogVisible(true), 10)
    return () => window.clearTimeout(t)
  }, [showNewModal])

  // Discard confirmation mount/unmount with animation
  useEffect(() => {
    if (showReqDiscard) {
      if (reqDiscardTimer.current) { window.clearTimeout(reqDiscardTimer.current); reqDiscardTimer.current = null }
      setIsReqDiscardMounted(true)
      const t = window.setTimeout(() => setIsReqDiscardVisible(true), 10)
      reqDiscardTimer.current = t
      return () => { window.clearTimeout(t); reqDiscardTimer.current = null }
    }
    setIsReqDiscardVisible(false)
    if (isReqDiscardMounted) {
      const t = window.setTimeout(() => { setIsReqDiscardMounted(false); reqDiscardTimer.current = null }, DISCARD_ANIM_MS)
      reqDiscardTimer.current = t
      return () => { window.clearTimeout(t); reqDiscardTimer.current = null }
    }
  }, [showReqDiscard, isReqDiscardMounted, DISCARD_ANIM_MS])

  function startReqClose() {
    setIsReqDialogVisible(false)
    window.setTimeout(() => {
      setShowNewModal(false)
      setNewReqItems(['', ''])
      setReqIsDirty(false)
    }, 300)
  }

  function handleReqClose() {
    if (reqIsDirty) { setShowReqDiscard(true); return }
    startReqClose()
  }

  function cancelReqDiscard() { setShowReqDiscard(false) }
  function confirmReqDiscard() { setShowReqDiscard(false); startReqClose() }

  function onReqKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') { e.preventDefault(); handleReqClose(); return }
    if (e.key === 'Tab') {
      const root = e.currentTarget
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(
        'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      ))
      if (!focusables.length) return
      const first = focusables[0]; const last = focusables[focusables.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus() } }
    }
  }
  // ─────────────────────────────────────────────────────────────────────

  const getCatColor = (name: string) => categories.find(c => c.name === name)?.color ?? 'bg-slate-300'

  const selected = REQUESTS.find(r => r.id === selectedId) ?? REQUESTS[0]

  const filtered = REQUESTS.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.client.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    return r.filter === activeFilter
  })

  const sentCount      = REQUESTS.filter(r => r.filter === 'sent').length
  const receivedCount  = REQUESTS.filter(r => r.filter === 'received').length
  const overdueCount   = REQUESTS.filter(r => r.filter === 'overdue').length
  const completedCount = REQUESTS.filter(r => r.filter === 'completed').length
  const archivedCount  = REQUESTS.filter(r => r.filter === 'archived').length

  return (
    <div
      className="ml-auto transition-all duration-300 ease-out"
      style={{
        marginTop: 'calc(0.5rem + var(--ph-clients-tabbar-offset, 0px))',
        maxWidth: 'var(--ph-page-container-width)',
        marginLeft: 'var(--ph-page-left-margin, auto)',
      }}
    >
      <div
        className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden"
        style={{ height: 'calc(100vh - 8rem)', display: 'flex' }}
      >

        {/* ── Left sidebar ── */}
        <div className="w-52 flex-shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/60">
          {/* New Request */}
          <div className="p-3 border-b border-slate-100">
            <button
              onClick={() => setShowNewModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors"
            >
              <span className="text-base leading-none">+</span> New Request
            </button>
          </div>

          {/* Filters */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
            {FILTER_LABELS.map(f => (
              <button
                key={f.key}
                onClick={() => {
                  setActiveFilter(f.key)
                  const first = REQUESTS.find(r => r.filter === f.key)
                  if (first) setSelectedId(first.id)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === f.key
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{f.icon}</span>
                  {f.label}
                </span>
                {f.key === 'sent'      && sentCount      > 0 && <span className="bg-emerald-600 text-white text-[10px] rounded-full px-1.5 py-0.5">{sentCount}</span>}
                {f.key === 'received'  && receivedCount  > 0 && <span className="bg-emerald-600 text-white text-[10px] rounded-full px-1.5 py-0.5">{receivedCount}</span>}
                {f.key === 'overdue'   && overdueCount   > 0 && <span className="bg-red-500  text-white text-[10px] rounded-full px-1.5 py-0.5">{overdueCount}</span>}
                {f.key === 'completed' && completedCount > 0 && <span className="bg-slate-400 text-white text-[10px] rounded-full px-1.5 py-0.5">{completedCount}</span>}
                {f.key === 'archived'  && archivedCount  > 0 && <span className="bg-slate-300 text-white text-[10px] rounded-full px-1.5 py-0.5">{archivedCount}</span>}
              </button>
            ))}

            {/* Categories */}
            <div className="pt-4 pb-1 px-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Categories</p>
              <button
                aria-label="Manage categories"
                onClick={() => setShowCatModal(true)}
                className="text-slate-300 hover:text-emerald-600 transition-colors rounded-md p-0.5 hover:bg-emerald-50"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
              </button>
            </div>
            {categories.map(cat => (
              <button key={cat.name} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-white/70 hover:text-slate-700 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cat.color}`} />
                {cat.name}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Middle list ── */}
        <div className="w-72 flex-shrink-0 border-r border-slate-100 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filtered.map(req => {
              const pct = req.progress[1] > 0 ? (req.progress[0] / req.progress[1]) * 100 : 0
              return (
                <button
                  key={req.id}
                  onClick={() => setSelectedId(req.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedId === req.id ? 'bg-emerald-50/60 border-l-2 border-l-emerald-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                      {req.client} ({req.company})
                    </p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{req.sentAt}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 mb-2">{req.title}</p>
                  {/* Category chip */}
                  {reqCategories[req.id] && (() => {
                    const catColor = getCatColor(reqCategories[req.id])
                    return (
                      <div className="flex items-center gap-1 mb-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${catColor}`} />
                        <span className="text-[10px] text-slate-400 font-medium">{reqCategories[req.id]}</span>
                      </div>
                    )
                  })()}
                  <div className="flex items-center gap-2">
                    {['COMPLETED','ARCHIVED'].includes(req.status) && (
                      <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                    )}
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400">{req.progress[0]}/{req.progress[1]}</span>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">No requests found.</div>
            )}
          </div>
        </div>

        {/* ── Right detail panel ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
            <button className="flex items-center gap-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              Send Reminder
            </button>
            <div className="flex items-center gap-2">
              <button aria-label="Delete request" className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
              <button aria-label="More options" className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Title + status */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{selected.title}</h1>
              {['COMPLETED','ARCHIVED'].includes(selected.status) && (
                <span className={`flex-shrink-0 text-xs font-bold border rounded-full px-3 py-1 ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="font-medium text-slate-700">{selected.client} ({selected.company})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Due {selected.dueDate}</span>
              </span>
              <span className="text-emerald-600 font-medium">Sent to Client</span>

              {/* Category selector */}
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowCatPicker(v => !v)}
                  className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1 hover:border-emerald-400 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getCatColor(reqCategories[selected.id] ?? '')}`} />
                  <span className="text-xs font-medium text-slate-600">{reqCategories[selected.id] ?? 'No Category'}</span>
                  <svg className="h-3 w-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {showCatPicker && (
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 w-44">
                    {categories.map(cat => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setReqCategories(prev => ({ ...prev, [selected.id]: cat.name }))
                          setShowCatPicker(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${
                          reqCategories[selected.id] === cat.name ? 'text-emerald-700 font-semibold' : 'text-slate-600'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cat.color}`} />
                        {cat.name}
                        {reqCategories[selected.id] === cat.name && (
                          <svg className="h-3 w-3 ml-auto text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setReqCategories(prev => { const n = { ...prev }; delete n[selected.id]; return n })
                          setShowCatPicker(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 transition-colors"
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-slate-200" />
                        No Category
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Your request */}
            <section>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                {selected.filter === 'received' ? "Client's Request" : 'Your Request'}
              </p>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 text-sm text-slate-700 leading-relaxed">
                {selected.message}
              </div>
            </section>

            {/* Requested items */}
            {selected.requestedItems.length > 0 && (() => {
              const isReceived = selected.filter === 'received'
              const approvedCount = selected.requestedItems.filter(i => i.status === 'APPROVED').length
              const attachedCount = selected.requestedItems.filter(i => i.status === 'UPLOADED' || i.status === 'APPROVED').length
              return (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Document Checklist</p>
                    <span className="text-[10px] text-slate-400">
                      {isReceived
                        ? `${attachedCount} of ${selected.requestedItems.length} attached`
                        : `${approvedCount} of ${selected.requestedItems.length} approved`
                      }
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selected.requestedItems.map(item => {
                      const s = ITEM_STATUS[item.status]
                      const hasFile   = item.status === 'UPLOADED' || item.status === 'APPROVED' || item.status === 'REJECTED'
                      const canReview = item.status === 'UPLOADED' && !isReceived
                      const canAttach = item.status === 'PENDING' && isReceived
                      return (
                        <div key={item.name} className="flex items-center gap-3 border border-slate-100 rounded-xl px-4 py-3 bg-white">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />

                          {/* Name + status */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                            <p className={`text-[10px] font-semibold uppercase tracking-wide ${s.color}`}>
                              {isReceived
                                ? (item.status === 'PENDING'  ? 'Not Yet Attached' :
                                   item.status === 'UPLOADED' ? '✓ Attached — Awaiting Client Approval' :
                                   item.status === 'APPROVED' ? '✓ Client Approved' :
                                   'Revision Requested by Client')
                                : (item.status === 'PENDING'  ? 'Awaiting Upload' :
                                   item.status === 'UPLOADED' ? 'Submitted — Needs Review' :
                                   item.status === 'APPROVED' ? '✓ Approved' :
                                   'Re-upload Requested')
                              }
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {hasFile && (
                              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                View File
                              </button>
                            )}
                            {canAttach && (
                              <button className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-lg px-3 py-1.5 transition-colors">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                                Attach File
                              </button>
                            )}
                            {canReview && (
                              <>
                                <button className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5 transition-colors">
                                  Approve
                                </button>
                                <button className="text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors">
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })()}

            {/* Discussion */}
            <section>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Discussion</p>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="max-h-56 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                  {selected.discussion.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No messages yet.</p>
                  )}
                  {selected.discussion.map((msg, i) => (
                    <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.isMe ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                        <div className={`text-[10px] font-semibold mb-1 uppercase tracking-wide ${msg.isMe ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {msg.author} &nbsp;·&nbsp; {msg.date}
                        </div>
                        <p className="text-xs">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Reply input */}
                <div className="border-t border-slate-100 bg-white px-4 py-3 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 py-2 text-xs font-medium transition-colors">Send</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── New Category Modal ── */}
      {showCatModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-800">Manage Categories</h2>
              <button aria-label="Close" onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Existing categories */}
            <div className="space-y-1.5 mb-5 max-h-40 overflow-y-auto">
              {categories.map(cat => (
                <div key={cat.name} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-50 group">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cat.color}`} />
                    <span className="text-sm text-slate-700">{cat.name}</span>
                  </div>
                  <button
                    aria-label={`Remove ${cat.name}`}
                    onClick={() => setCategories(prev => prev.filter(c => c.name !== cat.name))}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add new */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">Add New Category</p>
              <input
                type="text"
                placeholder="Category name"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 mb-3 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              {/* Color picker */}
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-2">Color</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {CAT_PALETTE.map(color => (
                  <button
                    key={color}
                    aria-label={`Select color ${color}`}
                    onClick={() => setNewCatColor(color)}
                    className={`w-6 h-6 rounded-full ${color} transition-transform hover:scale-110 ${newCatColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  const name = newCatName.trim()
                  if (!name) return
                  if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return
                  setCategories(prev => [...prev, { name, color: newCatColor }])
                  setNewCatName('')
                  setNewCatColor(CAT_PALETTE[0])
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl py-2 transition-colors disabled:opacity-40"
              >
                + Add Category
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── New Request Modal ── */}
      {showNewModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-hidden="true" onClick={handleReqClose} />

          {/* Dialog card */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="req-modal-title"
            onKeyDown={onReqKeyDown}
            className={`absolute flex flex-col bg-white rounded-2xl border border-slate-200/60 shadow-[0_12px_24px_rgba(15,23,42,0.18),_0_36px_72px_rgba(15,23,42,0.20)] inset-0 m-auto w-[calc(100%-2rem)] max-w-lg h-fit max-h-[calc(100vh-2rem)] transition-all duration-300 ease-out transform ${
              isReqDialogVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-200 shrink-0">
              <h2 id="req-modal-title" className="text-lg font-semibold text-slate-900">New Document Request</h2>
              <button
                aria-label="Close modal"
                onClick={handleReqClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">

              {/* Client */}
              <div>
                <label htmlFor="req-client" className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <select aria-label="Client"
                  id="req-client"
                  onChange={() => setReqIsDirty(true)}
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-400/50"
                >
                  <option value="">Select client…</option>
                  <option>Sarah Johnson (Sarah Designs)</option>
                  <option>Michael Chen (TechFlow Inc.)</option>
                  <option>Rivera Enterprises</option>
                </select>
              </div>

              {/* Subject + Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="req-subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input aria-label="Subject"
                    id="req-subject"
                    type="text"
                    placeholder="e.g. Q4 Bank Statements"
                    onChange={() => setReqIsDirty(true)}
                    className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-400/50 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="req-deadline" className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                  <input aria-label="Deadline"
                    id="req-deadline"
                    type="date"
                    onChange={() => setReqIsDirty(true)}
                    className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-400/50"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="req-message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea aria-label="Message"
                  id="req-message"
                  rows={3}
                  placeholder="Describe what you need from the client…"
                  onChange={() => setReqIsDirty(true)}
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-400/50 resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Requested Items */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Requested Items</label>
                <div className="space-y-2">
                  {newReqItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={e => { setNewReqItems(prev => prev.map((v, i) => i === idx ? e.target.value : v)); setReqIsDirty(true) }}
                        placeholder={idx === 0 ? 'e.g. Bank statements' : `Item ${idx + 1}`}
                        className="flex-1 rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-400/50 placeholder:text-slate-400"
                      />
                      {newReqItems.length > 1 && (
                        <button
                          aria-label="Remove item"
                          onClick={() => setNewReqItems(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setNewReqItems(prev => [...prev, '']); setReqIsDirty(true) }}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 text-sm font-medium text-sky-600 border border-dashed border-slate-300 rounded-xl py-2 hover:bg-slate-50 transition-colors"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
              <button
                onClick={handleReqClose}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startReqClose}
                className="text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>

          {/* Discard confirmation (portal, mirrors invoice discard modal) */}
          {isReqDiscardMounted && typeof document !== 'undefined' && createPortal(
            <>
              <div
                className={`fixed inset-0 z-[210] bg-black/40 transition-opacity duration-200 ${
                  isReqDiscardVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={cancelReqDiscard}
              />
              <div className="fixed left-1/2 top-[40%] z-[220] w-[min(480px,94%)] -translate-x-1/2 -translate-y-1/2">
                <div
                  className={`bg-white rounded-xl shadow-[0_30px_80px_rgba(2,6,23,0.55),_0_16px_40px_rgba(2,6,23,0.36)] p-5 border border-slate-200 transition-all duration-[240ms] ease-out transform ${
                    isReqDiscardVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                  }`}
                >
                  <h2 className="text-base font-semibold text-slate-900">Discard this request?</h2>
                  <p className="text-sm text-slate-600 mt-2">You have unsaved changes. If you discard, your edits will be lost.</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={cancelReqDiscard}
                      className="text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors"
                    >
                      Keep editing
                    </button>
                    <button
                      onClick={confirmReqDiscard}
                      className="text-sm font-semibold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
