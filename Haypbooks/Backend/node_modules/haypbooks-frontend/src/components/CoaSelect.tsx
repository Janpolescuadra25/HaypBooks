"use client"
import { useEffect, useRef, useState } from 'react'
import { CoaAccount, listMockCoa, filterCoa } from '@/lib/mock-coa'

interface CoaSelectProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CoaSelect({ label, value, onChange, placeholder, disabled }: CoaSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [accounts, setAccounts] = useState<CoaAccount[]>([])
  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dev = (process.env.NEXT_PUBLIC_DEV_UI === '1' || process.env.NEXT_PUBLIC_GATEWAY_MOCK === '1')

  useEffect(() => { setAccounts(listMockCoa()) }, [])
  const filtered = filterCoa(query, accounts).slice(0, 40)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const items = Array.from(listRef.current?.querySelectorAll('[data-opt]') || []) as HTMLElement[]
        if (!items.length) return
        const currentIndex = items.findIndex(i => i.classList.contains('bg-emerald-600'))
        let next = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1
        if (next < 0) next = items.length - 1
        if (next >= items.length) next = 0
        items.forEach(i => i.classList.remove('bg-emerald-600', 'text-white'))
        items[next].classList.add('bg-emerald-600', 'text-white')
        items[next].scrollIntoView({ block: 'nearest' })
      }
      if (e.key === 'Enter') {
        const active = listRef.current?.querySelector('.bg-emerald-600[data-opt]') as HTMLElement | null
        if (active) {
          const val = active.getAttribute('data-id') || ''
          const acc = accounts.find(a => a.id === val)
          if (acc) onSelect(acc)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, accounts, query])

  function onSelect(acc: CoaAccount) {
    onChange(acc.name)
    setOpen(false)
    setQuery('')
    try { (window as any).toast?.(`${label} set to ${acc.name}`) } catch {}
  }

  return (
    <label className="block text-xs font-medium text-slate-700">
      <span>{label}</span>
      {dev ? (
        <div className="relative mt-1">
          <input
            ref={inputRef}
            value={value}
            onChange={e=>onChange(e.target.value)}
            onFocus={()=>setOpen(true)}
            placeholder={placeholder || 'Search or select account'}
            disabled={disabled}
            className="input text-sm pr-8"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={label}
          />
          <button type="button" onClick={()=>{ setOpen(o=>!o); if (!open) setTimeout(()=>inputRef.current?.focus(),0) }} className="absolute right-1 top-1.5 rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-600 hover:bg-slate-50">{open ? '▾' : '▴'}</button>
          {open && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-300 bg-white shadow-lg">
              <div className="p-1"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filter accounts" className="input text-xs" aria-label="Filter accounts" /></div>
              <div ref={listRef} role="listbox" className="max-h-56 overflow-auto text-xs">
                {filtered.map(acc => (
                  <div
                    key={acc.id}
                    data-opt
                    data-id={acc.id}
                    onClick={()=>onSelect(acc)}
                    className="cursor-pointer px-2 py-1 hover:bg-emerald-50 flex justify-between gap-2"
                  >
                    <span className="truncate" title={acc.name}>{acc.name}</span>
                    <span className="text-[10px] text-slate-500">{acc.type}</span>
                  </div>
                ))}
                {!filtered.length && <div className="px-2 py-2 text-slate-500">No matches</div>}
              </div>
            </div>
          )}
        </div>
      ) : (
        <input value={value} onChange={e=>onChange(e.target.value)} className="input mt-1 text-sm" placeholder={placeholder || 'Account'} disabled={disabled} />
      )}
    </label>
  )
}
export default CoaSelect
