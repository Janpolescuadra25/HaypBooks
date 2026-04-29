import { useState, useEffect, useMemo, useCallback } from 'react'
import { SortingState, ColumnOrderState, VisibilityState, ColumnSizingState } from '@tanstack/react-table'

interface TablePersistedState {
  sorting?: SortingState
  columnOrder?: ColumnOrderState
  columnVisibility?: VisibilityState
  columnSizing?: ColumnSizingState
}

export function useTablePersistence(tableId: string) {
  const storageKey = useMemo(() => `haypbooks_${tableId}_table_config`, [tableId])
  const [savedConfig, setSavedConfig] = useState<TablePersistedState | null>(null)

  const loadState = useCallback((): TablePersistedState | null => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }, [storageKey])

  useEffect(() => {
    setSavedConfig(loadState())
  }, [loadState])

  const saveState = useCallback((state: TablePersistedState) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [storageKey])

  const clearState = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // ignore
    }
  }, [storageKey])

  return { savedConfig, saveState, clearState }
}
