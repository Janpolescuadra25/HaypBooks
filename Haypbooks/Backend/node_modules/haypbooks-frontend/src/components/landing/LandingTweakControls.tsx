"use client"
import { useEffect, useState } from 'react'

export default function LandingTweakControls() {
  // This component no longer renders controls in the UI but persists
  // any inline CSS variables that were set (e.g. by a previous tweak)
  // and applies stored tweaks from localStorage so the user's last
  // configuration is preserved across reloads.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const doc = document.documentElement
      const inlineHero = doc.style.getPropertyValue('--hero-nudge')?.trim()
      const inlineHeader = doc.style.getPropertyValue('--header-bg-opacity')?.trim()

      const storageKey = 'hayp:landing:tweaks'
      const storedRaw = localStorage.getItem(storageKey)
      let stored = storedRaw ? JSON.parse(storedRaw) : {}

      // If there are inline values (user recently tweaked), persist them
      if (inlineHero) {
        stored.heroNudge = inlineHero
      }
      if (inlineHeader) {
        stored.headerOpacity = inlineHeader
      }

      // Apply stored values immediately
      if (stored.heroNudge) {
        doc.style.setProperty('--hero-nudge', stored.heroNudge)
      }
      if (stored.headerOpacity) {
        doc.style.setProperty('--header-bg-opacity', stored.headerOpacity)
      }

      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(stored))
    } catch (err) {
      // ignore storage errors
    }
  }, [])

  // Return null to remove the visible tweak UI
  return null
}
