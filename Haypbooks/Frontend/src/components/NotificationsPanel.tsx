'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// ── Types ─────────────────────────────────────────────────────────────────────
type Priority = 'high' | 'warning' | 'success' | 'info'

interface Notification {
  id: string
  priority: Priority
  title: string
  description: string
  timeAgo: string
  amount?: string
  ref?: string
  read: boolean
  group: 'yesterday' | 'thisweek' | 'older'
  Icon: () => JSX.Element
}

// ── Priority colour maps ──────────────────────────────────────────────────────
const STRIP: Record<Priority, string> = {
  high:    'bg-rose-500',
  warning: 'bg-amber-400',
  success: 'bg-emerald-500',
  info:    'bg-sky-400',
}
const ICON_BG: Record<Priority, string> = {
  high:    'bg-rose-50 text-rose-500',
  warning: 'bg-amber-50 text-amber-500',
  success: 'bg-emerald-50 text-emerald-600',
  info:    'bg-sky-50 text-sky-500',
}

// ── Icon components ───────────────────────────────────────────────────────────
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}
function IconDollar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  )
}
function IconBox() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    </svg>
  )
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    priority: 'high',
    title: 'Purchase Order Approval Required',
    description: 'Purchase Order #PO-2024-0892 for $15,450.00 requires your approval before processing.',
    timeAgo: '32m ago',
    amount: '$15,450.00',
    ref: 'PO-2024-0892',
    read: false,
    group: 'yesterday',
    Icon: IconDollar,
  },
  {
    id: '2',
    priority: 'warning',
    title: 'Bill Overdue Notice',
    description: 'Bill #BILL-2024-088 from Tech Supplies Inc. for $8,750.00 is 3 days overdue.',
    timeAgo: '1h ago',
    amount: '$8,750.00',
    ref: 'BILL-2024-088',
    read: false,
    group: 'yesterday',
    Icon: IconAlert,
  },
  {
    id: '3',
    priority: 'success',
    title: 'Payment Received',
    description: 'Payment of $12,500.00 from ABC Corporation has been successfully processed and deposited.',
    timeAgo: '2h ago',
    amount: '$12,500.00',
    ref: 'PAY-2024-092',
    read: false,
    group: 'yesterday',
    Icon: IconCheck,
  },
  {
    id: '4',
    priority: 'info',
    title: 'Low Stock Alert',
    description: 'Item "Office Supplies Kit" is running low. Current stock: 5 units.',
    timeAgo: '5h ago',
    ref: 'INV-2024-044',
    read: false,
    group: 'yesterday',
    Icon: IconAlert,
  },
  {
    id: '5',
    priority: 'success',
    title: 'Inventory Restocked',
    description: 'Purchase Order #PO-2024-0890 has been received. 500 units of Office Supplies added to inventory.',
    timeAgo: '1d ago',
    ref: 'REC-2024-046',
    read: true,
    group: 'thisweek',
    Icon: IconBox,
  },
  {
    id: '6',
    priority: 'high',
    title: 'Invoice Overdue',
    description: 'Invoice #INV-2024-0567 for $22,300.00 from Global Tech Ltd. is 7 days overdue.',
    timeAgo: '2d ago',
    amount: '$22,300.00',
    ref: 'INV-2024-0567',
    read: true,
    group: 'thisweek',
    Icon: IconAlert,
  },
  {
    id: '7',
    priority: 'info',
    title: 'Bank Feed Sync Complete',
    description: '47 transactions imported from First National Bank. 12 require categorization.',
    timeAgo: '3d ago',
    read: true,
    group: 'thisweek',
    Icon: IconCheck,
  },
]

// ── NotificationsPanel ────────────────────────────────────────────────────────
interface Props {
  open: boolean
  anchorRef: React.RefObject<HTMLButtonElement>
  onClose: () => void
}

export default function NotificationsPanel({ open, anchorRef, onClose }: Props) {
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [items, setItems] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const panelRef = useRef<HTMLDivElement>(null)

  const unreadCount = items.filter((n) => !n.read).length
  const highPriority = items.filter((n) => n.priority === 'high' && !n.read).length
  const pendingApprovals = items.filter((n) => n.title.toLowerCase().includes('approval') && !n.read).length
  const warnings = items.filter((n) => n.priority === 'warning' && !n.read).length

  const visible = tab === 'unread' ? items.filter((n) => !n.read) : items

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const t = e.target as Node
      if (panelRef.current && !panelRef.current.contains(t) &&
          anchorRef.current && !anchorRef.current.contains(t)) onClose()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, onClose, anchorRef])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function markAllRead() { setItems((prev) => prev.map((n) => ({ ...n, read: true }))) }
  function markRead(id: string) { setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)) }

  if (!open) return null

  const groups: { key: Notification['group']; label: string }[] = [
    { key: 'yesterday', label: 'YESTERDAY' },
    { key: 'thisweek', label: 'THIS WEEK' },
    { key: 'older', label: 'OLDER' },
  ]

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      className="flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-[380px] max-h-[calc(100dvh-80px)]"
      // eslint-disable-next-line react/forbid-dom-props
      style={{ position: 'fixed', top: 68, right: 16, zIndex: 9999 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="text-[15px] font-semibold text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-[12px] text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 px-4 pb-2 shrink-0 border-b border-slate-100">
        <button
          onClick={() => setTab('all')}
          className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
            tab === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setTab('unread')}
          className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
            tab === 'unread'
              ? 'bg-slate-800 text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* ── Priority summary ── */}
      {unreadCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 shrink-0 text-[11.5px] text-slate-500 border-b border-slate-100">
          {highPriority > 0 && (
            <span className="text-rose-500 font-medium">● {highPriority} high priority</span>
          )}
          {pendingApprovals > 0 && (
            <span className="text-amber-500 font-medium">● {pendingApprovals} pending approvals</span>
          )}
          {warnings > 0 && (
            <span className="text-slate-700 font-medium">● {warnings} warnings</span>
          )}
        </div>
      )}

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="text-sm">You&apos;re all caught up!</span>
          </div>
        ) : (
          groups.map(({ key, label }) => {
            const group = visible.filter((n) => n.group === key)
            if (group.length === 0) return null
            return (
              <div key={key}>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                {group.map((n) => (
                  <NotifRow key={n.id} n={n} onRead={markRead} />
                ))}
              </div>
            )
          })
        )}
        {tab === 'all' && visible.length > 3 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <button className="text-[12px] text-emerald-600 hover:text-emerald-700 font-medium">
              +{Math.max(0, MOCK_NOTIFICATIONS.length - 4)} more
            </button>
          </div>
        )}
      </div>

    </div>
  )
  return typeof document !== 'undefined' ? createPortal(panel, document.body) : null
}

// ── Single row ────────────────────────────────────────────────────────────────
function NotifRow({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${n.read ? 'opacity-70' : ''}`}
      onClick={() => onRead(n.id)}
    >
      {/* Left priority strip */}
      <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${STRIP[n.priority]}`} aria-hidden="true" />

      {/* Icon chip */}
      <div className={`shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full ${ICON_BG[n.priority]}`}>
        <n.Icon />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[12.5px] leading-snug ${n.read ? 'font-normal text-slate-600' : 'font-semibold text-slate-800'}`}>
            {n.title}
          </p>
          {!n.read && <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-emerald-500" aria-label="Unread" />}
        </div>
        <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.description}</p>
        <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-slate-400">
          <span>{n.timeAgo}</span>
          {n.amount && <><span>·</span><span className="font-medium text-slate-600">{n.amount}</span></>}
          {n.ref && <><span>·</span><span className="font-mono text-slate-400">{n.ref}</span></>}
        </div>
      </div>
    </div>
  )
}
