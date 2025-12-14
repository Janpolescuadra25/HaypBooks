"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import usePersistedFilterParams from '@/hooks/usePersistedFilterParams'
import FilterStatusIndicator from '@/components/FilterStatusIndicator'

type Tag = { id: string; name: string; group?: string | null }

export default function TagSelect() {
  const pathname = usePathname()
  const reportKey = `filters:${pathname}`
  const { values, setValues, apply, status, error } = usePersistedFilterParams<{ tag: string }>({
    reportKey,
    specs: [{ key: 'tag' }],
    mode: 'push',
  })
  const applyRef = useRef(apply)
  useEffect(() => { applyRef.current = apply }, [apply])

  const [tags, setTags] = useState<Tag[]>([])
  const current = values.tag || ''

  useEffect(() => {
    let alive = true
    fetch('/api/tags', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!alive) return; setTags(Array.isArray(d?.tags) ? d.tags : []) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    setValues(p => ({ ...p, tag: v }))
    // Defer apply to next tick so state is committed before reading values
    setTimeout(() => { applyRef.current() }, 0)
  }

  const groups = useMemo(() => {
    const map = new Map<string, Tag[]>()
    for (const t of tags) {
      const g = t.group || 'Other'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(t)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [tags])

  return (
    <div className="inline-flex items-center gap-2">
      <label htmlFor="filter-tag" className="inline-flex items-center gap-2">
        <span className="text-sm text-slate-700">Tag</span>
        <select id="filter-tag" aria-describedby="filter-status-live" value={current} onChange={onChange} className="max-w-56 truncate rounded-lg border border-slate-200 bg-white px-2 py-1">
          <option key="none" value="">All tags</option>
          {groups.map(([groupName, list]) => (
            <optgroup key={groupName} label={groupName}>
              {list.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <FilterStatusIndicator saving={status === 'saving'} error={error} liveRegionId="filter-status-live" />
    </div>
  )
}
