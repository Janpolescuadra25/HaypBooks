"use client"

import { useEffect, useMemo, useState } from 'react'
import { formatMMDDYYYY } from '@/lib/date'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import toHref from '@/lib/route'
import { flags } from '@/lib/flags'

type Props = { slug: string }

const LABELS: Record<string, (v: string) => string> = {
  start: (v) => `Start: ${formatMMDDYYYY(v)}`,
  end: (v) => `End: ${formatMMDDYYYY(v)}`,
  type: (v) => `Type: ${v}`,
  status: (v) => `Status: ${v.replace(/\b\w/g, (m) => m.toUpperCase())}`,
  channel: (v) => `Channel: ${v}`,
  minMargin: (v) => `Min margin %: ${v}`,
  minUtil: (v) => `Min util %: ${v}`,
  view: (v) => `View: ${v.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())}`,
  minTurn: (v) => `Min turns: ${v}`,
  segment: (v) => `Segment: ${v}`,
  restriction: (v) => `Restriction: ${v}`,
  program: (v) => `Program: ${v}`,
  // Reports: detail filters
  customer: (v) => `Customer: ${v}`,
  vendor: (v) => `Vendor: ${v}`,
  vendorId: (v) => `Vendor: ${v}`,
  product: (v) => `Product: ${v}`,
  item: (v) => `Item: ${v}`,
  bucket: (v) => {
    const label = v === 'current' ? 'Current' : v === '30' ? '1-30' : v === '60' ? '31-60' : v === '90' ? '61-90' : v === '120+' ? '91+' : v
    return `Aging: ${label}`
  },
  tag: (v) => `Tag: ${v}`,
}

const RECOGNIZED = Object.keys(LABELS)

export default function ActiveFilterChips({ slug }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [expanded, setExpanded] = useState(false)
  const [tagMap, setTagMap] = useState<Record<string, string>>({})
  useEffect(() => {
    if (!flags.tags) return
    let alive = true
    fetch('/api/tags', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then((d) => {
        if (!alive) return
        const map: Record<string, string> = {}
        for (const t of (Array.isArray(d?.tags) ? d.tags : [])) {
          const label = t.group ? `${t.group}: ${t.name}` : t.name
          map[t.id] = label
        }
        setTagMap(map)
      })
    return () => { alive = false }
  }, [])
  const pairs = useMemo(() => {
    const s = new URLSearchParams(sp?.toString() || '')
    const list: Array<{ key: string; value: string; label: string }> = []
    const hasVendorName = !!s.get('vendor')
    RECOGNIZED.forEach((k) => {
      const v = s.get(k)
      if (v) {
        // If vendor name is present, suppress vendorId chip to avoid duplicate vendor filters
        if (k === 'vendorId' && hasVendorName) {
          return
        }
        if (k === 'tag' && flags.tags) {
          const friendly = tagMap[v] || v
          list.push({ key: k, value: v, label: `Tag: ${friendly}` })
        } else {
          list.push({ key: k, value: v, label: LABELS[k](v) })
        }
      }
    })
    return list
  }, [sp, tagMap])

  if (!pairs.length) return null

  function clearKey(key: string) {
    const next = new URLSearchParams(sp?.toString() || '')
    next.delete(key)
    const qs = next.toString()
    router.push(toHref(`${pathname || '/'}${qs ? `?${qs}` : ''}`))
  }

  function clearAll() {
    const next = new URLSearchParams(sp?.toString() || '')
    // Remove only the keys we are actively displaying to avoid nuking unrelated params
    pairs.forEach(({ key }) => next.delete(key))
    const qs = next.toString()
    router.push(toHref(`${pathname || '/'}${qs ? `?${qs}` : ''}`))
  }

  const MAX_VISIBLE = 3
  const hasOverflow = pairs.length > MAX_VISIBLE
  const visible = expanded || !hasOverflow ? pairs : pairs.slice(0, MAX_VISIBLE)
  const hiddenCount = hasOverflow ? pairs.length - MAX_VISIBLE : 0

  return (
    <div className="flex flex-wrap items-center gap-1" id="active-filter-chips">
      {visible.map(({ key, label }) => (
        <span key={key} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700">
          <span>{label}</span>
          <button
            type="button"
            aria-label={`Clear ${label}`}
            className="rounded-full p-0.5 hover:bg-slate-100"
            onClick={() => clearKey(key)}
          >
            ×
          </button>
        </span>
      ))}
      {hasOverflow && !expanded && (
        <button
          type="button"
          aria-label={`Show ${hiddenCount} more filters`}
          aria-expanded="false"
          aria-controls="active-filter-chips"
          className="ml-1 inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
          onClick={() => setExpanded(true)}
        >
          +{hiddenCount} more
        </button>
      )}
      {hasOverflow && expanded && (
        <button
          type="button"
          aria-label="Show fewer filters"
          aria-expanded="true"
          aria-controls="active-filter-chips"
          className="ml-1 inline-flex items-center rounded-full border border-transparent bg-transparent px-2 py-0.5 text-xs text-slate-600 underline-offset-2 hover:underline"
          onClick={() => setExpanded(false)}
        >
          Show less
        </button>
      )}
      {pairs.length > 1 && (
        <button
          type="button"
          aria-label="Clear all filters"
          className="ml-1 inline-flex items-center rounded-full border border-transparent bg-transparent px-2 py-0.5 text-xs text-slate-600 underline-offset-2 hover:underline"
          onClick={clearAll}
        >
          Clear all
        </button>
      )}
    </div>
  )
}
