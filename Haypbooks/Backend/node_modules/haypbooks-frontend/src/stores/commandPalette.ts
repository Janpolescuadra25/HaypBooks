import { create } from 'zustand'
import type { Route } from 'next'

export interface CommandItem {
  id: string
  label: string
  hint?: string
  group: string
  action: () => void
  keywords?: string
}

interface CommandPaletteState {
  open: boolean
  query: string
  items: CommandItem[]
  recent: string[]
  setItems: (items: CommandItem[]) => void
  openPalette: () => void
  closePalette: () => void
  toggle: () => void
  setQuery: (q: string) => void
  register: (item: Omit<CommandItem, 'id'> & { id?: string }) => void
  unregister: (id: string) => void
  markUsed: (id: string) => void
}

// Simple in-memory id counter for registrations that omit custom id
let autoId = 0

export const useCommandPalette = create<CommandPaletteState>((set, get) => ({
  open: false,
  query: '',
  items: [],
  recent: [],
  setItems: (items) => set({ items }),
  openPalette: () => set({ open: true }),
  closePalette: () => set({ open: false, query: '' }),
  toggle: () => set((s) => ({ open: !s.open })),
  setQuery: (q) => set({ query: q }),
  register: (item) => {
    const id = item.id || `cmd_${++autoId}`
    const cur = get().items
    if (cur.find((c) => c.id === id)) {
      set({ items: cur.map((c) => (c.id === id ? { ...c, ...item, id } : c)) })
    } else {
      set({ items: [...cur, { ...item, id }] })
    }
  },
  unregister: (id) => set({ items: get().items.filter((c) => c.id !== id) }),
  markUsed: (id) => {
    const recent = get().recent.filter((r) => r !== id)
    recent.unshift(id)
    set({ recent: recent.slice(0, 10) })
  },
}))

export function buildDefaultCommands(push: (href: Route) => void): CommandItem[] {
  return [
    { id: 'nav:dashboard', label: 'Go to Dashboard', group: 'Navigation', action: () => push('/dashboard' as Route), keywords: 'home main dashboard' },
    { id: 'nav:reports', label: 'Open Reports', group: 'Navigation', action: () => push('/reports' as Route), keywords: 'financial statements' },
    { id: 'nav:invoices', label: 'View Invoices', group: 'Navigation', action: () => push('/invoices' as Route), keywords: 'sales ar receivable' },
    { id: 'nav:bills', label: 'View Bills', group: 'Navigation', action: () => push('/bills' as Route), keywords: 'ap payables vendor' },
    { id: 'create:invoice', label: 'New Invoice', group: 'Create', action: () => push('/invoices/new' as Route), keywords: 'sales ar receivable' },
    { id: 'create:bill', label: 'New Bill', group: 'Create', action: () => push('/bills/new' as Route), keywords: 'ap payable vendor expense' },
    { id: 'nav:customers', label: 'Customers', group: 'Navigation', action: () => push('/customers' as Route), keywords: 'client' },
    { id: 'nav:vendors', label: 'Vendors', group: 'Navigation', action: () => push('/vendors' as Route), keywords: 'supplier payee' },
  { id: 'nav:bank-transactions', label: 'Transactions', group: 'Navigation', action: () => push('/bank-transactions' as Route), keywords: 'transactions bank feed review categorize' },
  // Backward compatibility command id (could be removed later)
  { id: 'nav:transactions', label: 'Transactions (legacy)', group: 'Navigation', action: () => push('/bank-transactions' as Route), keywords: 'activity ledger journal legacy' },
    { id: 'nav:journal', label: 'Journal Entries', group: 'Navigation', action: () => push('/journal' as Route), keywords: 'general ledger manual' },
  ]
}

// Lightweight fuzzy scoring (case-insensitive) giving prefix > substring > keyword match
export function scoreCommand(q: string, item: CommandItem): number {
  if (!q) return 1
  const hay = item.label.toLowerCase()
  const keys = (item.keywords || '').toLowerCase()
  const needle = q.toLowerCase().trim()
  if (!needle) return 1
  if (hay.startsWith(needle)) return 100 - (hay.length - needle.length)
  if (hay.includes(needle)) return 50 - (hay.indexOf(needle))
  if (keys.includes(needle)) return 10 - keys.indexOf(needle)
  // progressive subset scoring
  let p = 0
  let lastIndex = -1
  for (const ch of needle) {
    const idx = hay.indexOf(ch, lastIndex + 1)
    if (idx === -1) return -1
    p += 0.5
    lastIndex = idx
  }
  return p
}

export function filterAndRank(items: CommandItem[], query: string, recent: string[]): CommandItem[] {
  if (!query) {
    // show recent first then rest
    const map = new Map(items.map(i => [i.id, i] as const))
    const rec = recent.map(r => map.get(r)).filter(Boolean) as CommandItem[]
    const rest = items.filter(i => !recent.includes(i.id))
    return [...rec, ...rest]
  }
  const scored = items.map(i => ({ i, s: scoreCommand(query, i) })).filter(r => r.s >= 0)
  scored.sort((a, b) => b.s - a.s)
  return scored.map(r => r.i)
}
