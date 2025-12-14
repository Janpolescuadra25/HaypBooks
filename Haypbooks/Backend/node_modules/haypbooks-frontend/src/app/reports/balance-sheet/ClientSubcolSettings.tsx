"use client"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

const BSColumnSettings = ({ current }: { current: Array<'curr'|'prev'|'delta'|'pct'> }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const toggleSubcol = (key: 'curr'|'prev'|'delta'|'pct') => {
    let next = [...current]
    if (key === 'curr') return // Current column is required
    if (next.includes(key)) {
      next = next.filter(k => k !== key)
    } else {
      next.push(key)
    }
    // Ensure curr is always first
    if (next.includes('curr') && next[0] !== 'curr') {
      next = ['curr', ...next.filter(k => k !== 'curr')]
    }
    const sp = new URLSearchParams(searchParams.toString())
    if (next.length === 4) {
      sp.delete('subcols') // Use default when all are selected
    } else {
      sp.set('subcols', next.join(','))
    }
    router.push((pathname + '?' + sp.toString()) as any)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="btn-secondary !text-xs !px-2 !py-1"
        aria-label="Column settings"
      >
        Columns
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-3 z-50 min-w-40">
          <div className="text-xs font-medium text-slate-700 mb-2">Show columns:</div>
          <div className="space-y-1.5">
            {[
              { key: 'curr' as const, label: 'Current', required: true },
              { key: 'prev' as const, label: 'Previous', required: false },
              { key: 'delta' as const, label: 'Change (Δ)', required: false },
              { key: 'pct' as const, label: 'Percent (%)', required: false },
            ].map(({ key, label, required }) => (
              <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={current.includes(key)}
                  onChange={() => toggleSubcol(key)}
                  disabled={required}
                  className="text-sky-600"
                />
                <span className={required ? 'text-slate-500' : ''}>{label}</span>
                {required && <span className="text-slate-400">(required)</span>}
              </label>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t">
            <button 
              onClick={() => setOpen(false)}
              className="text-xs text-slate-600 hover:text-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BSClientSubcolSettings({ current }: { current: Array<'curr'|'prev'|'delta'|'pct'> }) {
  return (
    <Suspense fallback={<div className="btn-secondary !text-xs !px-2 !py-1 opacity-50">Columns</div>}>
      <BSColumnSettings current={current} />
    </Suspense>
  )
}