'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, Star } from 'lucide-react'
import { navigationData, NavSection, NavItem } from './ownerNavConfig'
import { useCompany } from '@/hooks/use-company'
import { motion, AnimatePresence } from 'motion/react'


// ─── X Icon ──────────────────────────────────────────────────────────────────
function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ─── Recursive Nav Item ───────────────────────────────────────────────────────
function RecursiveNavItem({
  item,
  activePath,
  depth = 0,
}: {
  item: NavItem
  activePath: string
  depth?: number
}) {
  const isGroup = !item.path && !!item.items
  const isActive = !!item.path && activePath === item.path

  const [isOpen, setIsOpen] = useState(() => {
    if (!item.items) return false
    const hasActive = (items: NavItem[]): boolean =>
      items.some((i) => {
        if (i.path && activePath === i.path) return true
        if (i.items) return hasActive(i.items)
        return false
      })
    return hasActive(item.items)
  })

  if (isGroup) {
    return (
      <div className={depth === 0 ? '' : 'ml-2'}>
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-emerald-800 hover:bg-emerald-50 transition-colors group"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 group-hover:text-emerald-900">
            {item.title}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={12} className="text-emerald-400" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-0.5 pl-2 border-l-2 border-emerald-100 ml-2">
                {item.items!.map((child, idx) => (
                  <RecursiveNavItem
                    key={idx}
                    item={child}
                    activePath={activePath}
                    depth={depth + 1}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Leaf item
  return (
    <Link
      href={item.path!}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive
          ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
          : 'text-slate-600 hover:bg-green-50 hover:text-green-800'
      }`}
    >
      <span className="text-xs leading-tight flex-1 min-w-0 break-words">
        {item.title}
      </span>
      {item.isEnterprise && (
        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full shrink-0">
          ENT
        </span>
      )}
    </Link>
  )
}

// ─── Navigation visibility helpers ─────────────────────────────────────────
function matchesCountry(item: { countries?: string[] }, country?: string) {
  if (!country) return true
  if (!item.countries || item.countries.length === 0) return true
  const upper = country.toUpperCase()
  return item.countries.some((c) => c.toUpperCase() === upper)
}

function filterNavItems(items: NavItem[], country?: string): NavItem[] {
  return items
    .map((item) => {
      if (!matchesCountry(item, country)) return null
      if (!item.items) return item
      const filtered = filterNavItems(item.items, country)
      if (filtered.length === 0) return null
      return { ...item, items: filtered }
    })
    .filter(Boolean) as NavItem[]
}

function filterNavigationData(data: NavSection[], country?: string): NavSection[] {
  return data
    .map((section) => {
      if (!matchesCountry(section, country)) return null
      const filteredItems = filterNavItems(section.items, country)
      if (filteredItems.length === 0) return null
      return { ...section, items: filteredItems }
    })
    .filter(Boolean) as NavSection[]
}

// ─── Owner Sidebar ────────────────────────────────────────────────────────────
export default function OwnerSidebar() {
  const { company } = useCompany()
  const country = company?.country?.toUpperCase()
  const filteredNavigation = useMemo(
    () => filterNavigationData(navigationData, country),
    [country]
  )
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState<NavSection>(
    filteredNavigation[0]
  )
  const [isSecondaryVisible, setIsSecondaryVisible] = useState(true)

  // Refs for each rail button so we can measure exact position for the indicator
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const railRef = useRef<HTMLElement | null>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number }>({
    top: 0,
    height: 0,
  })

  const activeIndex = filteredNavigation.findIndex(
    (s) => s.title === activeSection.title
  )

  useEffect(() => {
    if (!filteredNavigation.length) return
    if (!activeSection || !filteredNavigation.find((s) => s.title === activeSection.title)) {
      setActiveSection(filteredNavigation[0])
    }
  }, [filteredNavigation, activeSection])

  // Measure the active button and position the indicator to match exactly
  useEffect(() => {
    const rail = railRef.current
    const btn = btnRefs.current[activeIndex]
    if (!rail || !btn) return

    // getBoundingClientRect is viewport-relative; subtract rail top, then add
    // rail's own scrollTop to get the true offset from the rail's content top.
    const railRect = rail.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    const top = (btnRect.top - railRect.top) + rail.scrollTop

    setIndicatorStyle({ top, height: btn.offsetHeight })
  }, [activeIndex])

  return (
    <div className="flex h-full z-40 relative">
      {/* ── Primary Icon Rail ── */}
      <aside
        ref={railRef}
        className="rail-scrollbar w-20 bg-emerald-950 flex flex-col items-center py-4 gap-2 border-r border-emerald-900 shadow-2xl shrink-0 relative z-10 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#047857_transparent]"
      >
        {/* Single indicator pill — sits outside buttons so overflow never clips it */}
        {indicatorStyle.height > 0 && (
          <motion.div
            className="absolute left-0 w-[5px] bg-emerald-300 rounded-r-full z-20 pointer-events-none"
            style={{ boxShadow: '3px 0 14px 2px rgba(110,231,183,0.85)' }}
            animate={{
              top: indicatorStyle.top + indicatorStyle.height / 2 - 18,
              height: 36,
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          />
        )}

        <div className="flex-1 w-full flex flex-col items-center gap-2 px-2">
          {filteredNavigation.map((section, idx) => {
            const Icon = section.icon
            const isActive = activeSection.title === section.title

            return (
              <button
                key={section.title}
                ref={(el) => { btnRefs.current[idx] = el }}
                onClick={() => {
                  setActiveSection(section)
                  setIsSecondaryVisible(true)
                }}
                className={`w-16 flex flex-col items-center justify-center py-3 rounded-xl transition-all relative group shrink-0 ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-lg ring-1 ring-emerald-600/40'
                    : 'text-white hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <Icon
                  size={20}
                  className={
                    isActive ? 'text-emerald-200' : 'text-white/80'
                  }
                />
                <span
                  className={`text-[8px] mt-1.5 font-black uppercase tracking-tight text-center leading-[1.1] px-0.5 break-words w-full ${
                    isActive ? 'text-emerald-100' : 'text-white/80'
                  }`}
                >
                  {section.label ?? section.title.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Secondary Panel ── */}
      <AnimatePresence mode="wait">
        {isSecondaryVisible && (
          <motion.aside
            key={activeSection.title}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white border-r border-emerald-100 overflow-y-auto overflow-x-hidden relative shadow-sm flex flex-col shrink-0"
          >
            <div className="p-3 min-w-[220px]">
              {/* Section header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-100/50">
                <div className="flex flex-col min-w-0 flex-1 mr-1">
                  <h2 className="text-xs font-black text-emerald-950 uppercase tracking-tight flex items-center gap-2">
                    <div className="p-1 bg-emerald-50 rounded-lg shrink-0">
                      {(() => {
                        const Icon = activeSection.icon
                        return (
                          <Icon size={13} className="text-emerald-600" />
                        )
                      })()}
                    </div>
                    <span className="leading-tight break-words min-w-0">{activeSection.title}</span>
                  </h2>
                </div>
                <button
                  onClick={() => setIsSecondaryVisible(false)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all shrink-0"
                  aria-label="Collapse sidebar"
                >
                  <XIcon size={14} />
                </button>
              </div>

              {/* Nav items */}
              <div className="space-y-4">
                {activeSection.items.map((item, idx) => (
                  <RecursiveNavItem
                    key={idx}
                    item={item}
                    activePath={pathname ?? ''}
                  />
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Re-open chevron ── */}
      {!isSecondaryVisible && (
        <button
          onClick={() => setIsSecondaryVisible(true)}
          className="absolute top-[15px] left-[79px] z-50 flex items-center justify-center p-1.5 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white rounded-lg shadow-lg shadow-green-500/30 transition-all"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={13} />
        </button>
      )}
    </div>
  )
}
