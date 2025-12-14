"use client"
import { useRouter, useSearchParams } from 'next/navigation'

const PERIODS = [
  { key: 'YTD', label: 'YTD' },
  { key: 'MTD', label: 'MTD' },
  { key: 'QTD', label: 'QTD' },
  { key: 'LastMonth', label: 'Last Mo' },
  { key: 'LastQuarter', label: 'Last Q' },
  { key: 'Last12', label: 'Last 12' },
]

export default function PeriodSwitcher({ current }: { current: string }) {
  const router = useRouter()
  const params = useSearchParams()

  function setPeriod(p: string) {
    const newParams = new URLSearchParams(params?.toString() || '')
    newParams.set('period', p)
    router.push(`/?${newParams.toString()}`)
  }

  return (
    <div role="group" aria-label="Period" className="inline-flex rounded-lg border border-slate-200 bg-white overflow-hidden">
      {PERIODS.map((p) => {
        const active = (current || 'YTD') === p.key
        return active ? (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className="px-3 py-1.5 text-sm bg-slate-900 text-white"
            aria-pressed="true"
          >
            {p.label}
          </button>
        ) : (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            aria-pressed="false"
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
