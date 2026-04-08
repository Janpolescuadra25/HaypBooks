'use client'

import { useEffect, useRef, KeyboardEvent } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import type { NavSubsection } from '@/config/operations-navigation'

interface SectionTabBarProps {
  subsections: NavSubsection[]
  activeId: string
  /** Called with subsection ID when user clicks a tab or navigates with keyboard */
  onNavigate: (subsectionId: string) => void
}

export function SectionTabBar({ subsections, activeId, onNavigate }: SectionTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIdx = subsections.findIndex((s) => s.id === activeId)

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (!containerRef.current) return
    const active = containerRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [activeId])

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const count = subsections.length
    if (count === 0) return

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = subsections[(activeIdx + 1) % count]
      onNavigate(next.id)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = subsections[(activeIdx - 1 + count) % count]
      onNavigate(prev.id)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onNavigate(subsections[0].id)
    } else if (e.key === 'End') {
      e.preventDefault()
      onNavigate(subsections[count - 1].id)
    }
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Section navigation"
      onKeyDown={handleKeyDown}
      className="flex items-end gap-0 overflow-x-auto border-b border-slate-200 bg-white px-4 no-scrollbar"
    >
      {subsections.map((subsection) => {
        const isActive = subsection.id === activeId
        const defaultTab = subsection.tabs[0]

        return (
          <Link
            key={subsection.id}
            href={defaultTab?.path ?? '#'}
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={(e) => {
              e.preventDefault()
              onNavigate(subsection.id)
            }}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 rounded-t-lg ${
              isActive
                ? 'text-emerald-700 font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {subsection.label}

            {/* Animated underline */}
            {isActive && (
              <motion.span
                layoutId="section-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full"
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}
