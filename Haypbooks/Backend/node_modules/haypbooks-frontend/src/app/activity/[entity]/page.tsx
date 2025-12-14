"use client"
import AuditEventsPanel from '@/components/AuditEventsPanel'
import { BackButton } from '@/components/BackButton'
import { Suspense, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'

export default function EntityActivityPage({ params }: { params: { entity: string } }) {
  return (
    <Suspense fallback={<div className="glass-card">Loading…</div>}>
      <EntityActivityInner entity={params.entity} />
    </Suspense>
  )
}

function EntityActivityInner({ entity }: { entity: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [start, setStart] = useState<string>(searchParams.get('start') || '')
  const [end, setEnd] = useState<string>(searchParams.get('end') || '')

  useEffect(() => {
    setStart(searchParams.get('start') || '')
    setEnd(searchParams.get('end') || '')
  }, [searchParams])

  const updateQuery = (nextStart: string, nextEnd: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (nextStart) sp.set('start', nextStart); else sp.delete('start')
    if (nextEnd) sp.set('end', nextEnd); else sp.delete('end')
    const qs = sp.toString()
    const href = (qs ? `${pathname}?${qs}` : pathname) as Route
    router.replace(href)
  }

  const onStartChange = (v: string) => {
    setStart(v)
    updateQuery(v, end)
  }
  const onEndChange = (v: string) => {
    setEnd(v)
    updateQuery(start, v)
  }

  const title = `${entity.toUpperCase()} Activity`
  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <div className="flex items-center gap-2">
            <BackButton />
          </div>
        </div>
        <p className="text-slate-600 text-sm mt-1">Recent {entity} audit events</p>
        <div className="mt-3 flex items-end gap-2 text-sm">
          <div className="flex flex-col">
            <label htmlFor="entity-activity-start" className="block text-slate-600 mb-1">Start</label>
            <input id="entity-activity-start" type="date" value={start} onChange={(e) => onStartChange(e.target.value)} className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="entity-activity-end" className="block text-slate-600 mb-1">End</label>
            <input id="entity-activity-end" type="date" value={end} onChange={(e) => onEndChange(e.target.value)} className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" />
          </div>
          <div aria-live="polite" className="sr-only">
            {(start ? `Start ${start}. ` : 'No start date. ') + (end ? `End ${end}.` : 'No end date.')}
          </div>
        </div>
      </div>
      <AuditEventsPanel entity={entity} title={`Recent ${entity} activity`} limit={50} start={start || undefined} end={end || undefined} />
    </div>
  )
}
