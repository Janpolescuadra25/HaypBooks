"use client"
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'

export default function Breadcrumbs() {
  const pathname = usePathname()
  if (!pathname || pathname === '/') return null
  const parts = pathname.split('/').filter(Boolean)
  const items = parts.map((seg, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/')
    const label = toLabel(seg)
    const isLast = idx === parts.length - 1
    return { href, label, isLast }
  })
  return (
    <nav aria-label="Breadcrumb" className="mb-2 text-sm text-slate-600">
      <ol className="flex items-center gap-2 flex-wrap">
        <li><Link href="/" className="hover:underline">Home</Link></li>
        {items.map((it, i) => (
          <li key={it.href} className="flex items-center gap-2">
            <span aria-hidden className="text-slate-400">/</span>
            {it.isLast ? (
              <span aria-current="page" className="font-medium text-slate-800 truncate max-w-[24ch] inline-block align-bottom">{it.label}</span>
            ) : (
              <Link href={it.href as Route} className="hover:underline truncate max-w-[24ch] inline-block align-bottom">{it.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function toLabel(seg: string) {
  // Map known entity routes to friendly labels; fall back to title case
  const map: Record<string, string> = {
    'ap-aging': 'A/P Aging',
    'ar-aging': 'A/R Aging',
    'profit-loss': 'Profit & Loss',
    'balance-sheet': 'Balance Sheet',
    'cash-flow': 'Cash Flow',
    'sales-receipts': 'Sales Receipts',
  }
  if (map[seg]) return map[seg]
  if (seg === 'new') return 'New'
  // treat ids as short ids
  if (/^[a-z0-9\-]{10,}$/.test(seg)) return `#${seg.slice(0, 8)}`
  // title-case
  return seg
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}
