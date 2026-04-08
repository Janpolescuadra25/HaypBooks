'use client'

import {
  Clock,
  Package,
  Landmark,
  ShoppingCart,
  Receipt,
  FolderKanban,
  ArrowDownToLine,
  RefreshCw,
  FileText,
  CreditCard,
  Wallet,
  Settings,
  BarChart2,
  FileSearch,
  Archive,
  Building2,
  Repeat,
  Smartphone,
  TrendingUp,
  Calendar,
} from 'lucide-react'

/** Map of common tab slugs → icon component */
const ICON_MAP: Record<string, React.ElementType> = {
  'bank-transactions': Landmark,
  deposits: ArrowDownToLine,
  'reconciliation-hub': RefreshCw,
  reconcile: RefreshCw,
  history: FileSearch,
  'statement-archive': Archive,
  'bank-accounts': Building2,
  'credit-cards': CreditCard,
  'petty-cash': Wallet,
  'clearing-accounts': Settings,
  'transaction-rules': Settings,
  'recurring-transactions': Repeat,
  'app-transactions': Smartphone,
  'cash-position': BarChart2,
  'cash-flow-projection': TrendingUp,
  'short-term-forecast': Calendar,
  default: FileText,
}

interface TabPlaceholderProps {
  tabName: string
  sectionName: string
  /** Lucide icon key — falls back to FileText if not found */
  iconName?: string
}

export function TabPlaceholder({ tabName, sectionName, iconName }: TabPlaceholderProps) {
  // Prefer explicit iconName, else try to derive from tabName slug
  const slug = iconName ?? tabName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const Icon = ICON_MAP[slug] ?? ICON_MAP.default

  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] px-8 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5 shadow-sm">
        <Icon size={28} className="text-emerald-500" />
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-2">{tabName}</h2>

      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
        This feature is coming soon to <span className="font-medium text-slate-700">{sectionName}</span>.
        We&apos;re building something great — stay tuned!
      </p>

      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Coming Soon
      </span>
    </div>
  )
}
