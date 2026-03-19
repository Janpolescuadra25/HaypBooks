"use client"

/**
 * RightGapAdjuster – invisible spacer that ensures the topbar's right edge
 * never overlaps the browser's scrollbar or OS chrome on the Practice Hub.
 * Renders a zero-height element that reads/writes the --ph-pbar-mr CSS variable.
 */

import { useEffect } from 'react'

export default function RightGapAdjuster() {
  useEffect(() => {
    // Measure scrollbar width and apply as right margin for the primary topbar
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.documentElement.style.setProperty('--ph-pbar-mr', `${scrollbarWidth}px`)
      document.documentElement.style.setProperty('--ph-sbar-mr', `${scrollbarWidth}px`)
    }
    return () => {
      document.documentElement.style.removeProperty('--ph-pbar-mr')
      document.documentElement.style.removeProperty('--ph-sbar-mr')
    }
  }, [])

  return null
}
