"use client"

import { useEffect, useState } from 'react'

/**
 * Persist and restore a set of visible column keys for a report or table.
 * Uses localStorage under the provided storageKey.
 */
export function usePersistedColumns(storageKey: string, defaultKeys: string[]) {
  const [keys, setKeys] = useState<string[]>(defaultKeys)

  // Load on mount
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.every(k => typeof k === 'string')) {
          setKeys(parsed)
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Persist on change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(keys))
      }
    } catch {}
  }, [storageKey, keys])

  return [keys, setKeys] as const
}
