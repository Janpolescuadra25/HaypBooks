'use client'

import { useEffect, useRef, KeyboardEvent } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import type { NavTab } from '@/config/operations-navigation'

interface ContentTabBarProps {
  tabs: NavTab[]
  activeId: string
  /** Called with tab ID when user clicks a tab or navigates with keyboard */
  onNavigate: (tabId: string) => void
}

export function ContentTabBar({ tabs, activeId, onNavigate }: ContentTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIdx = tabs.findIndex((t) => t.id === activeId)

  useEffect(() => {
    if (!containerRef.current) return
    const active = containerRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [activeId])

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const count = tabs.length
    if (count === 0) return

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      onNavigate(tabs[(activeIdx + 1) % count].id)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onNavigate(tabs[(activeIdx - 1 + count) % count].id)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onNavigate(tabs[0].id)
    } else if (e.key === 'End') {
      e.preventDefault()
      onNavigate(tabs[count - 1].id)
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabs.map((t) => t.id).join('-')}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        ref={containerRef}
        role="tablist"
        aria-label="Content navigation"
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1 overflow-x-auto bg-slate-50 border-b border-slate-200 px-4 py-1.5 no-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId

          return (
            <Link
              key={tab.id}
              href={tab.path}
              role="tab"
              aria-selected={isActive}
              data-active={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(tab.id)
              }}
              className={`relative px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}
