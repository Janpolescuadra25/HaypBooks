import React from 'react'
import { Package, FileText, Users, Inbox } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Preset = 'default' | 'invoices' | 'employees' | 'items' | 'projects' | 'vendors' | 'reports'

interface EmptyStateProps {
  /** Main title (defaults to "No data found") */
  title?: string
  /** Subtext description */
  description?: string
  /** Custom icon element — overrides preset */
  icon?: React.ReactNode
  /** Convenience preset icon */
  preset?: Preset
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Optional secondary action */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  /** Extra className on the container */
  className?: string
}

// ─── Preset icons ──────────────────────────────────────────────────────────

const PRESET_ICONS: Record<Preset, React.ReactNode> = {
  default:   <Inbox   size={36} className="text-slate-300" />,
  invoices:  <FileText size={36} className="text-slate-300" />,
  employees: <Users   size={36} className="text-slate-300" />,
  items:     <Package size={36} className="text-slate-300" />,
  projects:  <Package size={36} className="text-slate-300" />,
  vendors:   <Users   size={36} className="text-slate-300" />,
  reports:   <FileText size={36} className="text-slate-300" />,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmptyState({
  title = 'No data found',
  description,
  icon,
  preset = 'default',
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  const iconEl = icon ?? PRESET_ICONS[preset]

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="mb-4 opacity-80">{iconEl}</div>
      <p className="text-slate-600 font-semibold text-sm">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-5 flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
