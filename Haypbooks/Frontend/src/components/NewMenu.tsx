'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'
import { usePermissions } from '@/hooks/usePermissions'

export default function NewMenu() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [navError, setNavError] = useState<string | null>(null)
  const [menuTop, setMenuTop] = useState(0)
  const router = useRouter()
  const { loading, has } = usePermissions()
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', handle)
    return () => window.removeEventListener('mousedown', handle)
  }, [open])

  // Update menu position when opened
  useEffect(() => {
    if (open && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      setMenuTop(rect.bottom)
    }
  }, [open])

  const navigate = useCallback((path: string) => {
    setNavError(null)
    setBusy(true)
    setOpen(false)
      try {
      router.push(toHref(path))
    } catch (e: any) {
      setNavError(e?.message || 'Navigation failed')
    } finally {
      setTimeout(() => setBusy(false), 250)
    }
  }, [router])

  const columns = [
    {
      title: 'Customers',
      items: [
        { key: 'invoice', label: 'Invoice', perm: 'invoices:write' as const, path: '/invoices/new' },
        { key: 'payment-links', label: 'Payment links', perm: 'invoices:write' as const, path: '/sales/payment-links/new' },
        { key: 'receive-payment', label: 'Receive payment', perm: 'invoices:write' as const, path: '/payments/new' },
        { key: 'statement', label: 'Statement', perm: 'customers:write' as const, path: '/sales/statements/new' },
        { key: 'estimate', label: 'Estimate', perm: 'invoices:write' as const, path: '/sales/estimates/new' },
        { key: 'sales-order', label: 'Sales order', perm: 'invoices:write' as const, path: '/sales/sales-orders/new' },
        { key: 'credit-memo', label: 'Credit memo', perm: 'invoices:write' as const, path: '/sales/credit-memos/new' },
        { key: 'sales-receipt', label: 'Sales receipt', perm: 'invoices:write' as const, path: '/sales-receipts/new' },
        { key: 'recurring-payment', label: 'Recurring payment', perm: 'invoices:write' as const, path: '/sales/recurring-payments/new' },
        { key: 'shipping-label', label: 'Shipping label', perm: 'invoices:write' as const, path: '/sales/shipping/new' },
        { key: 'refund-receipt', label: 'Refund receipt', perm: 'invoices:write' as const, path: '/refunds/customer/new' },
        { key: 'delayed-credit', label: 'Delayed credit', perm: 'invoices:write' as const, path: '/sales/delayed-credits/new' },
        { key: 'delayed-charge', label: 'Delayed charge', perm: 'invoices:write' as const, path: '/sales/delayed-charges/new' },
        { key: 'add-customer', label: 'Add customer', perm: 'customers:write' as const, path: '/customers/new' },
        { key: 'contract', label: 'Contract', perm: 'customers:write' as const, path: '/sales/contracts/new' }
      ]
    },
    {
      title: 'Vendors',
      items: [
        { key: 'expense', label: 'Expense', perm: 'journal:write' as const, path: '/expenses/new' },
        { key: 'check', label: 'Check', perm: 'bills:write' as const, path: '/checks/new' },
        { key: 'bill', label: 'Bill', perm: 'bills:write' as const, path: '/bills/new' },
        { key: 'pay-bills', label: 'Pay bills', perm: 'bills:write' as const, path: '/bills/pay' },
        { key: 'purchase-order', label: 'Purchase order', perm: 'bills:write' as const, path: '/purchase-orders/new' },
        { key: 'vendor-credit', label: 'Vendor credit', perm: 'bills:write' as const, path: '/vendor-credits/new' },
        { key: 'credit-card-credit', label: 'Credit card credit', perm: 'journal:write' as const, path: '/expenses/credit-card-credit/new' },
        { key: 'print-checks', label: 'Print checks', perm: 'bills:write' as const, path: '/checks/print' },
        { key: 'add-vendor', label: 'Add vendor', perm: 'vendors:write' as const, path: '/vendors/new' }
      ]
    },
    {
      title: 'Team',
      items: [
        { key: 'payroll', label: 'Payroll', perm: 'journal:write' as const, path: '/payroll/new' },
        { key: 'single-time-activity', label: 'Single time activity', perm: 'journal:write' as const, path: '/time/activities/new' },
        { key: 'weekly-timesheet', label: 'Weekly timesheet', perm: 'journal:write' as const, path: '/time/timesheet/new' },
        { key: 'review-time', label: 'Review time', perm: 'journal:write' as const, path: '/time/review' },
        { key: 'add-contractor', label: 'Add contractor', perm: 'vendors:write' as const, path: '/contractors/new' }
      ]
    },
    {
      title: 'Projects',
      items: [
        { key: 'project', label: 'Project', perm: 'journal:write' as const, path: '/projects/new' },
        { key: 'project-estimate', label: 'Project estimate', perm: 'invoices:write' as const, path: '/projects/estimates/new' }
      ]
    },
    {
      title: 'Other',
      items: [
        { key: 'task', label: 'Task', perm: 'journal:write' as const, path: '/tasks/new' },
        { key: 'bank-deposit', label: 'Bank deposit', perm: 'journal:write' as const, path: '/bank-transactions/new-deposit' },
        { key: 'transfer', label: 'Transfer', perm: 'journal:write' as const, path: '/transfers/new' },
        { key: 'journal-entry', label: 'Journal entry', perm: 'journal:write' as const, path: '/journal/new' },
        { key: 'inventory-qty-adjustment', label: 'Inventory qty adjustment', perm: 'journal:write' as const, path: '/inventory/adjustments/new' },
        { key: 'batch-transactions', label: 'Batch transactions', perm: 'journal:write' as const, path: '/transactions/batch' },
        { key: 'pay-down-credit-card', label: 'Pay down credit card', perm: 'journal:write' as const, path: '/expenses/pay-down-card/new' },
        { key: 'apply-for-capital', label: 'Apply for Capital', perm: 'journal:write' as const, path: '/capital/apply' },
        { key: 'add-product-service', label: 'Add product/service', perm: 'journal:write' as const, path: '/sales/products-services/new' }
      ]
    }
  ]

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return
    const focusable = Array.from(menuRef.current?.querySelectorAll('button[data-menu-item="true"]') || []) as HTMLButtonElement[]
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!focusable.length) return
    const index = focusable.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = focusable[(index + 1) % focusable.length]
      next?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = focusable[(index - 1 + focusable.length) % focusable.length]
      prev?.focus()
    }
  }

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKey}>
      <button
        aria-haspopup="menu"
        className="btn-secondary !px-3 !py-1.5 text-sm w-full"
        onClick={() => setOpen(o => !o)}
        disabled={busy}
      >
        + New
      </button>
      {open && (
        <>
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        {/* Menu positioned outside sidebar */}
        <div
          role="menu"
          aria-label="Create new"
          className="fixed left-[220px] z-50 rounded-xl border border-slate-200 bg-white shadow-2xl p-3"
          style={{ top: `${menuTop}px` }}
        >
          <div className="grid grid-cols-5 gap-4 min-w-[700px]">
            {columns.map((col, colIdx) => (
              <div key={col.title}>
                <div className="text-xs font-semibold text-slate-700 mb-2 px-2">{col.title}</div>
                <div className="space-y-0.5">
                  {col.items.map((item, idx) => {
                    const canAccess = has(item.perm)
                    if (!canAccess) return null
                    return (
                      <button
                        key={item.key}
                        role="menuitem"
                        data-menu-item="true"
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-50 focus:bg-slate-100 focus:outline-none text-slate-700"
                        onClick={() => navigate(item.path)}
                        disabled={busy}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          {navError && <div className="px-3 py-2 text-sm text-red-600 mt-2">{navError}</div>}
        </div>
        </>
      )}
    </div>
  )
}

