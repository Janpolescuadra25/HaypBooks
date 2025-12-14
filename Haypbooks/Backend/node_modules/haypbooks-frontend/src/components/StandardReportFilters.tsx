"use client"

import usePersistedFilterParams from '../hooks/usePersistedFilterParams'
import FilterStatusIndicator from '@/components/FilterStatusIndicator'
import { useCallback, useMemo } from 'react'

type Props = { slug: string }

interface SlugConfigBase { key: string; label: string }
interface SelectConfig extends SlugConfigBase { type: 'select'; options: string[] }
interface NumberConfig extends SlugConfigBase { type: 'number'; min?: number; max?: number }
type SlugConfig = SelectConfig | NumberConfig

// Declarative map of slug -> filter definition
const SLUG_MAP: Record<string, SlugConfig> = {
  'retail-sales-by-channel': { key: 'channel', label: 'Channel', type: 'select', options: ['Online','POS','Marketplace','Wholesale','Other'] },
  'construction-job-profitability': { key: 'minMargin', label: 'Min margin %', type: 'number', min: 0, max: 100 },
  'psa-utilization': { key: 'minUtil', label: 'Min util %', type: 'number', min: 0, max: 100 },
  'healthcare-revenue-cycle': { key: 'view', label: 'View', type: 'select', options: ['financial-only'] },
  'manufacturing-wip-inventory': { key: 'minTurn', label: 'Min turns', type: 'number', min: 0, max: 50 },
  'saas-mrr-churn': { key: 'segment', label: 'Segment', type: 'select', options: ['SMB','Mid-Market','Enterprise'] },
  'non-profit-fund-activity': { key: 'restriction', label: 'Restriction', type: 'select', options: ['Unrestricted','Temporarily Restricted','Permanently Restricted'] },
  'government-fund-balance': { key: 'program', label: 'Program', type: 'select', options: ['Public Safety','Public Works','Health & Human Services','Parks & Rec','General Government'] },
  'education-grant-spend-vs-budget': { key: 'program', label: 'Program', type: 'select', options: ['STEM','Arts','Athletics'] },
  'hospitality-occupancy-revpar': { key: 'property', label: 'Property', type: 'select', options: ['Downtown Hotel','Airport Hotel','Resort','Conference Center'] },
  'ecommerce-return-rate-by-category': { key: 'category', label: 'Category', type: 'select', options: ['Apparel','Electronics','Home & Garden','Beauty','Sports'] },
}

export default function StandardReportFilters({ slug }: Props) {
  const cfg = SLUG_MAP[slug]
  const reportKey = `standard:${slug}`

  const specs = useMemo(() => cfg ? [{ key: cfg.key }] : [], [cfg])
  const { values, setValues, apply, clear, status, updatedAt, error } = usePersistedFilterParams<Record<string,string>>({
    reportKey,
    specs,
  })

  const currentVal = cfg ? values[cfg.key] || '' : ''
  const anyActive = !!currentVal

  const handleSelectChange = useCallback((val: string) => {
    setValues((v: Record<string,string>) => ({ ...v, [cfg!.key]: val }))
    // Immediate apply for selects
    apply()
  }, [setValues, apply, cfg])

  const handleNumberCommit = useCallback(() => {
    apply()
  }, [apply])

  const reset = useCallback(() => {
    clear()
  }, [clear])

  if (!cfg) return null

  return (
    <div className="flex items-center gap-1">
      <label className="inline-flex items-center gap-1 text-sm">
        <span className="text-slate-600">{cfg.label}</span>
        {cfg.type === 'select' && (
          <select
            className="rounded-lg border border-slate-200 bg-white px-2 py-1"
            value={currentVal}
            onChange={(e) => handleSelectChange(e.target.value)}
          >
            <option value="">All</option>
            {cfg.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        {cfg.type === 'number' && (
          <input
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 w-20"
            type="number"
            min={cfg.min}
            max={cfg.max}
            value={currentVal}
            onChange={(e) => setValues((v: Record<string,string>) => ({ ...v, [cfg.key]: e.target.value }))}
            onBlur={handleNumberCommit}
          />
        )}
      </label>
      {anyActive && (
        <button
          type="button"
          className="ml-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-white"
          onClick={reset}
        >Reset</button>
      )}
  <FilterStatusIndicator saving={status === 'saving'} error={error} />
      <span className="sr-only" aria-live="polite">{anyActive ? 'Filter active' : 'No filters active'}</span>
    </div>
  )
}
