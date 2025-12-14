"use client"
import { useEffect, useMemo, useState } from 'react'

type Preset = 'YTD' | 'ThisMonth' | 'MTD' | 'ThisQuarter' | 'QTD' | 'Last30' | 'Last12' | 'Custom'

const suggested: Array<{ title: string; slug: string }> = [
  { title: 'Profit and loss', slug: 'profit-and-loss' },
  { title: 'Balance sheet', slug: 'balance-sheet' },
  { title: 'Statement of Cash Flows', slug: 'cash-flow' },
  { title: 'A/R Aging Summary', slug: 'ar-aging-summary' },
  { title: 'A/P Aging Summary', slug: 'ap-aging-summary' },
]

const presets = [
  { name: 'Monthly Executive Pack', reports: ['profit-and-loss', 'balance-sheet', 'cash-flow'] },
  { name: 'Receivables & Payables Health', reports: ['ar-aging-summary', 'ap-aging-summary'] },
]

export default function ManagementReportsPage() {
  const [selected, setSelected] = useState<string[]>(suggested.map((s) => s.slug))
  const [preset, setPreset] = useState<Preset>('YTD')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [savedName, setSavedName] = useState('')
  const [savedPresets, setSavedPresets] = useState<Array<{ name: string; reports: string[]; period?: { preset: Preset; start?: string; end?: string } }>>([])
  const [activeSavedName, setActiveSavedName] = useState('')
  const canApply = useMemo(() => (preset === 'Custom' ? !!start && !!end && start <= end : true), [preset, start, end])
  useEffect(() => {
    try {
  const saved = JSON.parse(localStorage.getItem('reportsHubPeriod') || 'null') as { preset?: Preset; start?: string; end?: string } | null
      if (saved?.preset) {
        setPreset(saved.preset as Preset)
        if (saved.preset === 'Custom') { if (saved.start) setStart(saved.start); if (saved.end) setEnd(saved.end) }
      }
  const pack = JSON.parse(localStorage.getItem('managementPack') || 'null') as { selected?: string[] } | null
  if (pack?.selected) setSelected(pack.selected.filter((s) => suggested.some((x) => x.slug === s)))
  const named = JSON.parse(localStorage.getItem('managementPackPresets') || '[]') as Array<{ name: string; reports: string[]; period?: { preset: Preset; start?: string; end?: string } }>
  if (Array.isArray(named)) setSavedPresets(named)
    } catch {}
  }, [])

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      try { localStorage.setItem('managementPack', JSON.stringify({ selected: next })) } catch {}
      return next
    })
  }
  function qs(): string {
    const sp = new URLSearchParams()
    sp.set('preset', preset)
    if (preset === 'Custom') { if (start) sp.set('start', start); if (end) sp.set('end', end) }
    sp.set('reports', selected.join(','))
    return sp.toString()
  }
  function applyPreset(names: string[]) {
    setSelected(() => {
      const next = names
      try { localStorage.setItem('managementPack', JSON.stringify({ selected: next })) } catch {}
      return next
    })
  }

  function saveCurrentAsNamedPreset() {
    if (!savedName.trim() || selected.length === 0 || !canApply) return
    const entry = {
      name: savedName.trim(),
      reports: [...selected],
      period: { preset, start: preset === 'Custom' ? start : undefined, end: preset === 'Custom' ? end : undefined },
    }
    setSavedPresets((prev) => {
      const withoutDupes = prev.filter((p) => p.name.toLowerCase() !== entry.name.toLowerCase())
      const next = [entry, ...withoutDupes].slice(0, 20)
      try { localStorage.setItem('managementPackPresets', JSON.stringify(next)) } catch {}
      return next
    })
    setSavedName('')
  }

  function loadNamedPreset(name: string) {
    const p = savedPresets.find((x) => x.name === name)
    if (!p) return
    const filteredReports = p.reports.filter((s) => suggested.some((x) => x.slug === s))
    setSelected(filteredReports)
  setActiveSavedName(name)
    try { localStorage.setItem('managementPack', JSON.stringify({ selected: filteredReports })) } catch {}
    if (p.period?.preset) {
      setPreset(p.period.preset)
      if (p.period.preset === 'Custom') {
        setStart(p.period.start || '')
        setEnd(p.period.end || '')
      }
    }
  }

  function deleteNamedPreset(name: string) {
    setSavedPresets((prev) => {
      const next = prev.filter((p) => p.name !== name)
      try { localStorage.setItem('managementPackPresets', JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="glass-card">
        <h2 className="text-slate-900 font-semibold mb-2">Management reports</h2>
        <p className="text-sm text-slate-600">Build a pack with a common period and export as one file (mock).</p>
        <div className="mt-2">
          <h3 className="font-medium text-slate-900 mb-2">Quick presets</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            {presets.map((p) => (
              <button key={p.name} className="btn-secondary !px-2 !py-1" onClick={() => applyPreset(p.reports)}>{p.name}</button>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-medium text-slate-900 mb-2">Saved presets</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <input
              type="text"
              value={savedName}
              onChange={(e) => setSavedName(e.target.value)}
              placeholder="Preset name (e.g., Board Pack QTD)"
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 min-w-[16rem]"
              aria-label="Preset name"
            />
            <button
              className={`btn-primary !px-2 !py-1 ${selected.length === 0 || !canApply || !savedName.trim() ? 'pointer-events-none opacity-60' : ''}`}
              onClick={saveCurrentAsNamedPreset}
            >Save preset</button>
            {savedPresets.length > 0 && (
              <>
                <span className="text-slate-500">or</span>
                <label className="inline-flex items-center gap-1">
                  <span className="sr-only">Load preset</span>
                  <select value={activeSavedName} onChange={(e) => loadNamedPreset(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 min-w-[12rem]">
                    <option value="">Load preset…</option>
                    {savedPresets.map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </div>
          {savedPresets.length > 0 && (
            <ul className="mt-2 divide-y rounded-lg border border-slate-200 bg-white/70">
              {savedPresets.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{p.name}</div>
                    <div className="text-xs text-slate-600 truncate">{p.reports.join(', ')}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <button className="btn-secondary !px-2 !py-1" onClick={() => loadNamedPreset(p.name)}>Load</button>
                    <button className="btn-secondary !px-2 !py-1" onClick={() => deleteNamedPreset(p.name)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-slate-900 mb-2">Choose reports</h3>
            <div className="space-y-2">
              {suggested.map((r) => (
                <label key={r.slug} className="flex items-center gap-2">
                  <input type="checkbox" checked={selected.includes(r.slug)} onChange={() => toggle(r.slug)} />
                  <span>{r.title}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-2">Period</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <label className="inline-flex items-center gap-2">
                <span className="sr-only">Preset</span>
                <select aria-label="Preset" value={preset} onChange={(e) => setPreset(e.target.value as Preset)} className="rounded-lg border border-slate-200 bg-white px-2 py-1">
                <option value="YTD">Year to Date (YTD)</option>
                <option value="ThisMonth">This Month</option>
                <option value="MTD">Month to Date (MTD)</option>
                <option value="ThisQuarter">This Quarter</option>
                <option value="QTD">Quarter to Date (QTD)</option>
                <option value="Last30">Last 30 Days</option>
                <option value="Last12">Last 12 Months</option>
                <option value="Custom">Custom…</option>
                </select>
              </label>
              {preset === 'Custom' && (
                <>
                  <label className="inline-flex items-center gap-1">
                    <span className="sr-only">Start</span>
                    <input aria-label="Start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1" />
                  </label>
                  <span>to</span>
                  <label className="inline-flex items-center gap-1">
                    <span className="sr-only">End</span>
                    <input aria-label="End" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1" />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {(() => {
            const disabled = selected.length === 0 || !canApply
            return (
              <>
                <a
                  className={`btn-primary ${disabled ? 'pointer-events-none opacity-60' : ''}`}
                  href={`/api/reports/pack/export?${qs()}${activeSavedName ? `&name=${encodeURIComponent(activeSavedName)}` : ''}`}
                  role="button"
                >Export pack (CSV)</a>
                <a
                  className={`btn-secondary ${disabled ? 'pointer-events-none opacity-60' : ''}`}
                  href={`/api/reports/pack/export?format=pdf&${qs()}${activeSavedName ? `&name=${encodeURIComponent(activeSavedName)}` : ''}`}
                  role="button"
                >Export pack (PDF)</a>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
