import React from 'react'

type Props = { snapshot: any; onConfirm: () => void }

function toLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

function summarizeValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '--'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None'
    return `${value.length} item${value.length === 1 ? '' : 's'}`
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const preferredKeys = ['name', 'label', 'title', 'email', 'id']
    for (const key of preferredKeys) {
      const candidate = record[key]
      if (typeof candidate === 'string' && candidate.trim()) return candidate
    }
    const keys = Object.keys(record)
    if (keys.length === 0) return 'Configured'
    return `${keys.length} fields configured`
  }
  return String(value)
}

export default function Review({ snapshot, onConfirm }: Props) {
  const rows =
    snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot)
      ? Object.entries(snapshot as Record<string, unknown>)
      : []

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Review & Confirm</h3>
      <div className="max-h-60 overflow-auto rounded-md border border-slate-200 bg-slate-50">
        {rows.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-500">No setup data captured yet.</p>
        ) : (
          rows.map(([key, value]) => {
            const nestedKeys =
              value && typeof value === 'object' && !Array.isArray(value)
                ? Object.keys(value as Record<string, unknown>).slice(0, 3)
                : []
            return (
              <div key={key} className="border-t border-slate-200 px-3 py-2 first:border-t-0">
                <p className="text-[11px] font-semibold text-slate-600">{toLabel(key)}</p>
                <p className="text-xs text-slate-800">{summarizeValue(value)}</p>
                {nestedKeys.length > 0 && (
                  <p className="text-[11px] text-slate-500">Includes: {nestedKeys.map(toLabel).join(', ')}</p>
                )}
              </div>
            )
          })
        )}
      </div>
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 rounded-md bg-emerald-600 text-white" onClick={onConfirm}>Finish setup</button>
      </div>
    </div>
  )
}
