/**
 * Module color palette
 * Each module has a consistent Tailwind color used across page headers,
 * icons, CTAs, and accent elements. Import and use these constants to
 * ensure visual consistency across the entire app.
 *
 * Usage:
 *   import { MODULE_COLORS } from '@/lib/moduleColors'
 *   const c = MODULE_COLORS.accounting
 *   // c.accent  → 'emerald'
 *   // c.icon    → 'text-emerald-600'
 *   // c.btn     → 'bg-emerald-600 hover:bg-emerald-700'
 *   // c.badge   → 'bg-emerald-100 text-emerald-700'
 *   // c.ring    → 'focus:ring-emerald-400'
 */

export interface ModuleColor {
  accent: string
  icon: string
  btn: string
  btnLight: string
  badge: string
  ring: string
  border: string
  bg: string
}

function mc(color: string): ModuleColor {
  return {
    accent:   color,
    icon:     `text-${color}-600`,
    btn:      `bg-${color}-600 hover:bg-${color}-700`,
    btnLight: `bg-${color}-50 text-${color}-700 hover:bg-${color}-100`,
    badge:    `bg-${color}-100 text-${color}-700`,
    ring:     `focus:ring-${color}-400`,
    border:   `border-${color}-200`,
    bg:       `bg-${color}-50`,
  }
}

export const MODULE_COLORS = {
  /** Core Accounting — emerald */
  accounting:      mc('emerald'),
  /** Accounts Receivable / Sales — blue */
  ar:              mc('blue'),
  sales:           mc('blue'),
  /** Accounts Payable / Expenses — orange */
  ap:              mc('orange'),
  expenses:        mc('orange'),
  /** Banking & Cash — sky */
  banking:         mc('sky'),
  /** Payroll — violet */
  payroll:         mc('violet'),
  /** Inventory — teal */
  inventory:       mc('teal'),
  /** Projects — indigo */
  projects:        mc('indigo'),
  /** Tax — amber */
  tax:             mc('amber'),
  /** Time Tracking — cyan */
  time:            mc('cyan'),
  /** Reporting — purple */
  reporting:       mc('purple'),
  /** Automation — fuchsia */
  automation:      mc('fuchsia'),
  /** Compliance — rose */
  compliance:      mc('rose'),
  /** Organization — slate */
  organization:    mc('slate'),
  /** AI & Analytics — violet (same rail as payroll but different module) */
  ai:              mc('violet'),
  /** Settings — slate */
  settings:        mc('slate'),
  /** Home / Dashboard — indigo */
  home:            mc('indigo'),
  /** Tasks & Approvals — amber */
  tasks:           mc('amber'),
  /** Financial Services — green */
  financialServices: mc('green'),
  /** Philippine Tax — red */
  philippineTax:   mc('red'),
} as const

export type ModuleName = keyof typeof MODULE_COLORS
