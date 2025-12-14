import { getBaseUrl } from '@/lib/server-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { BackButton } from '@/components/BackButton'
import { formatAsOf, formatDateRange } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { CompareHeader } from '@/components/CompareHeader'
import Amount from '@/components/Amount'
import { Suspense } from 'react'
import BSClientSubcolSettings from './ClientSubcolSettings'

export default async function BalanceSheetPage({ searchParams }: { searchParams: { period?: string; compare?: string; start?: string; end?: string; subcols?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.period) sp.set('period', searchParams.period)
  if (searchParams?.compare === '1') sp.set('compare', '1')
  if (searchParams?.start) sp.set('start', searchParams.start)
  if (searchParams?.end) sp.set('end', searchParams.end)
  const res = await fetch(`${getBaseUrl()}/api/reports/balance-sheet${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <div className="glass-card print:hidden">
          <div className="flex items-center justify-between gap-2">
            <BackButton ariaLabel="Back to Reports" />
          </div>
        </div>
        <div className="glass-card">
          <p className="text-slate-800">Access denied. You don’t have permission to view this report.</p>
        </div>
      </div>
    )
  }
  const data = await res.json()
  const compare = searchParams?.compare === '1'
  
  // Determine which subcolumns to render when compare is enabled
  const defaultSubcols: Array<'curr'|'prev'|'delta'|'pct'> = ['curr','prev','delta','pct']
  const validSub = new Set(['curr','prev','delta','pct'])
  const selectedSubcols = (searchParams?.subcols && searchParams.subcols.split(',').map(s => s.trim()).filter(s => validSub.has(s))) as Array<'curr'|'prev'|'delta'|'pct'> | undefined
  const subcols: Array<'curr'|'prev'|'delta'|'pct'> = compare
    ? (selectedSubcols && selectedSubcols.length > 0 ? (selectedSubcols.includes('curr') ? selectedSubcols : (['curr', ...selectedSubcols.filter(s => s !== 'curr')] as any)) : defaultSubcols)
    : ['curr']
  
  const assets = data.assets as { name: string; amount: number }[]
  const liabilities = data.liabilities as { name: string; amount: number }[]
  const equity = data.equity as { name: string; amount: number }[]
  const fmt = (n: number) => Number(n)
  const pctFmt = (p: number) => `${p.toFixed(1)}%`
  const pctClass = (p: number) => {
    const emph = Math.abs(p) >= 10 ? 'font-medium' : ''
    return `${p < 0 ? 'text-rose-800' : 'text-emerald-700'} ${emph}`
  }
  const diff = Number(data.totals.assets - (data.totals.liabilities + data.totals.equity))
  const toTdbUrl = (accounts: string[]) => {
    const sp = new URLSearchParams()
    if (searchParams?.period) sp.set('period', searchParams.period)
    if (searchParams?.start) sp.set('start', searchParams.start)
    if (searchParams?.end) sp.set('end', searchParams.end)
    for (const a of accounts) sp.append('account', a)

    // Origin path including compare if present
    const origin = new URL('https://app.local/reports/balance-sheet')
    if (searchParams?.period) origin.searchParams.set('period', searchParams.period)
    if (searchParams?.compare === '1') origin.searchParams.set('compare', '1')
    if (searchParams?.start) origin.searchParams.set('start', searchParams.start)
    if (searchParams?.end) origin.searchParams.set('end', searchParams.end)
    const from = `${origin.pathname}${origin.search ? origin.search : ''}`
    sp.set('from', from)

    return `/reports/transaction-detail-by-account${sp.size ? `?${sp.toString()}` : ''}`
  }
  const accountMap: Record<string, string[]> = {
    'Cash': ['1000'],
    'Accounts Receivable': ['1010'],
    'Inventory': ['1100'],
    'Accounts Payable': ['2000'],
    'Credit Card': ['2200'],
    'Accrued Expenses': ['2100'],
    'Owner’s Equity': ['3000'],
    'Retained Earnings': ['3100'],
  }
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back to Reports" />
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0" role="toolbar" aria-label="Report actions">
            <ReportPeriodSelect value={data.period} showCompare />
            <RefreshButton />
            <ExportCsvButton exportPath="/api/reports/balance-sheet/export" />
            <PrintButton />
            {/* Column settings visible only when compare is enabled */}
            {compare && (
              <Suspense>
                <BSClientSubcolSettings current={subcols as any} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Balance Sheet</div>
            <div className="text-xs text-slate-600">{(searchParams?.start && searchParams?.end) ? formatDateRange(searchParams.start, searchParams.end) : formatAsOf(data.asOf)}</div>
            <div className="sr-only" aria-live="polite">
              Totals updated. Assets {formatCurrency(Number(data?.totals?.assets || 0))}; Liabilities {formatCurrency(Number(data?.totals?.liabilities || 0))}; Equity {formatCurrency(Number(data?.totals?.equity || 0))}.
            </div>
          </caption>
          <CompareHeader
            className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600"
            fixed={{ label: 'Account', align: 'center' }}
            {...(!compare
              ? { columns: [{ label: 'Amount', align: 'center' }] }
              : { groups: [{ label: 'Amount', subLabels: subcols.map(s => s === 'curr' ? 'Current' : s === 'prev' ? 'Previous' : s === 'delta' ? 'Δ' : '%'), align: 'center' }] })}
          />
          <tbody>
            {/* Assets Section */}
            <tr className="border-t border-slate-200 bg-slate-50/60">
              <td colSpan={2} className="px-3 py-2 text-slate-700 font-semibold">Assets</td>
            </tr>
            {assets.map((a: any, i: number) => {
              const prev = data.prev?.assets?.[i]?.amount ?? undefined
              const cur = Number(a.amount ?? 0)
              const delta = prev !== undefined ? cur - Number(prev) : 0
              const pct = prev !== undefined && prev !== 0 ? (delta / Math.abs(Number(prev))) * 100 : 0
              return (
                <tr key={`a-${i}`} className="border-t border-slate-200 align-top">
                  <td className="px-3 py-2 text-slate-800 text-center">
                    {accountMap[a.name] ? (
                      <a href={toTdbUrl(accountMap[a.name])} className="text-sky-700 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-0.5">{a.name}</a>
                    ) : a.name}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className={`tabular-nums ${cur < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={fmt(cur)} /></div>
                    {compare && prev !== undefined && (
                      <div className="mt-1 space-y-0.5 text-xs">
                        <div className="flex items-baseline justify-between text-slate-600">
                          <span>Prev</span>
                          <span className={`tabular-nums ${Number(prev) < 0 ? 'text-rose-700' : 'text-emerald-600'}`}><Amount value={Number(prev)} /></span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-slate-600">Δ / %</span>
                          <span className="tabular-nums flex items-baseline gap-2">
                            <span className={`${delta < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={delta} /></span>
                            <span className={pctClass(pct)}>{pctFmt(pct)}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-center">
                <a href={toTdbUrl(assets.map(a => accountMap[a.name]).filter(Boolean).flat())} className="text-sky-700 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-0.5" aria-label="Drill down to all asset accounts in Transaction Detail by Account">Total Assets</a>
              </td>
              <td className="px-3 py-2 text-center">
                <div className="tabular-nums font-medium text-slate-900"><Amount value={Number(data.totals.assets)} /></div>
                {compare && (() => {
                  const cur = Number(data.totals.assets ?? 0)
                  const prev = Number(data.prev?.totals?.assets ?? 0)
                  const delta = cur - prev
                  const pct = prev !== 0 ? (delta / Math.abs(prev)) * 100 : 0
                  return (
                    <div className="mt-1 space-y-0.5 text-xs">
                      <div className="flex items-baseline justify-between text-slate-600">
                        <span>Prev</span>
                        <span className="tabular-nums"><Amount value={prev} /></span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-600">Δ / %</span>
                        <span className="tabular-nums flex items-baseline gap-2">
                          <span className={`${delta < 0 ? 'text-rose-600' : 'text-emerald-700'}`}><Amount value={delta} /></span>
                          <span className={pctClass(pct)}>{pctFmt(pct)}</span>
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </td>
            </tr>

            {/* Liabilities Section */}
            <tr className="border-t border-slate-200 bg-slate-50/60">
              <td colSpan={2} className="px-3 py-2 text-slate-700 font-semibold">Liabilities</td>
            </tr>
            {liabilities.map((l: any, i: number) => {
              const prev = data.prev?.liabilities?.[i]?.amount ?? undefined
              const cur = Number(l.amount ?? 0)
              const delta = prev !== undefined ? cur - Number(prev) : 0
              const pct = prev !== undefined && prev !== 0 ? (delta / Math.abs(Number(prev))) * 100 : 0
              return (
                <tr key={`l-${i}`} className="border-t border-slate-200 align-top">
                  <td className="px-3 py-2 text-slate-800 text-center">
                    {accountMap[l.name] ? (
                      <a href={toTdbUrl(accountMap[l.name])} className="text-sky-700 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-0.5">{l.name}</a>
                    ) : l.name}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className={`tabular-nums ${cur < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={fmt(cur)} /></div>
                    {compare && prev !== undefined && (
                      <div className="mt-1 space-y-0.5 text-xs">
                        <div className="flex items-baseline justify-between text-slate-600">
                          <span>Prev</span>
                          <span className={`tabular-nums ${Number(prev) < 0 ? 'text-rose-700' : 'text-emerald-600'}`}><Amount value={Number(prev)} /></span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-slate-600">Δ / %</span>
                          <span className="tabular-nums flex items-baseline gap-2">
                            <span className={`${delta < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={delta} /></span>
                            <span className={pctClass(pct)}>{pctFmt(pct)}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-center">
                <a href={toTdbUrl(liabilities.map(l => accountMap[l.name]).filter(Boolean).flat())} className="text-sky-700 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-0.5" aria-label="Drill down to all liability accounts in Transaction Detail by Account">Total Liabilities</a>
              </td>
              <td className="px-3 py-2 text-center">
                <div className="tabular-nums font-medium text-slate-900"><Amount value={Number(data.totals.liabilities)} /></div>
                {compare && (() => {
                  const cur = Number(data.totals.liabilities ?? 0)
                  const prev = Number(data.prev?.totals?.liabilities ?? 0)
                  const delta = cur - prev
                  const pct = prev !== 0 ? (delta / Math.abs(prev)) * 100 : 0
                  return (
                    <div className="mt-1 space-y-0.5 text-xs">
                      <div className="flex items-baseline justify-between text-slate-600">
                        <span>Prev</span>
                        <span className="tabular-nums"><Amount value={prev} /></span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-600">Δ / %</span>
                        <span className="tabular-nums flex items-baseline gap-2">
                          <span className={`${delta < 0 ? 'text-rose-600' : 'text-emerald-700'}`}><Amount value={delta} /></span>
                          <span className={pctClass(pct)}>{pctFmt(pct)}</span>
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </td>
            </tr>

            {/* Equity Section */}
            <tr className="border-t border-slate-200 bg-slate-50/60">
              <td colSpan={2} className="px-3 py-2 text-slate-700 font-semibold">Equity</td>
            </tr>
            {equity.map((e: any, i: number) => {
              const prev = data.prev?.equity?.[i]?.amount ?? undefined
              const cur = Number(e.amount ?? 0)
              const delta = prev !== undefined ? cur - Number(prev) : 0
              const pct = prev !== undefined && prev !== 0 ? (delta / Math.abs(Number(prev))) * 100 : 0
              return (
                <tr key={`e-${i}`} className="border-t border-slate-200 align-top">
                  <td className="px-3 py-2 text-slate-800 text-center">
                    {accountMap[e.name] ? (
                      <a href={toTdbUrl(accountMap[e.name])} className="text-sky-700 hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-0.5">{e.name}</a>
                    ) : e.name}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className={`tabular-nums ${cur < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={fmt(cur)} /></div>
                    {compare && prev !== undefined && (
                      <div className="mt-1 space-y-0.5 text-xs">
                        <div className="flex items-baseline justify-between text-slate-600">
                          <span>Prev</span>
                          <span className={`tabular-nums ${Number(prev) < 0 ? 'text-rose-700' : 'text-emerald-600'}`}><Amount value={Number(prev)} /></span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-slate-600">Δ / %</span>
                          <span className="tabular-nums flex items-baseline gap-2">
                            <span className={`${delta < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={delta} /></span>
                            <span className={pctClass(pct)}>{pctFmt(pct)}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900 text-center">
                <a href={toTdbUrl(equity.map(e => accountMap[e.name]).filter(Boolean).flat())} className="text-sky-700 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-0.5" aria-label="Drill down to all equity accounts in Transaction Detail by Account">Total Equity</a>
              </td>
              <td className="px-3 py-2 text-center">
                <div className="tabular-nums font-medium text-slate-900"><Amount value={Number(data.totals.equity)} /></div>
                {compare && (() => {
                  const cur = Number(data.totals.equity ?? 0)
                  const prev = Number(data.prev?.totals?.equity ?? 0)
                  const delta = cur - prev
                  const pct = prev !== 0 ? (delta / Math.abs(prev)) * 100 : 0
                  return (
                    <div className="mt-1 space-y-0.5 text-xs">
                      <div className="flex items-baseline justify-between text-slate-600">
                        <span>Prev</span>
                        <span className="tabular-nums"><Amount value={prev} /></span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-600">∆ / %</span>
                        <span className="tabular-nums flex items-baseline gap-2">
                          <span className={`${delta < 0 ? 'text-rose-800' : 'text-emerald-700'}`}><Amount value={delta} /></span>
                          <span className={pctClass(pct)}>{pctFmt(pct)}</span>
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </td>
            </tr>
            {!data.balanced && (
              <tr className="border-t border-slate-300 bg-amber-50">
                <td className="px-3 py-2 font-medium text-amber-800 text-center">Out of balance</td>
                <td className="px-3 py-2 text-center tabular-nums text-amber-800">∆ <Amount value={Number(diff)} /></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
