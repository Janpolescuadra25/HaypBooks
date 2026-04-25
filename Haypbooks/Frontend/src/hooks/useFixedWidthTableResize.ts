'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, MutableRefObject } from 'react'

type WidthColumn = {
  key: string
  width: number
  visible?: boolean
}

type MinWidthConfig = number | Record<string, number>

const EPSILON = 0.5

function roundWidth(value: number): number {
  return Math.round(value * 100) / 100
}

function sumWidths(widths: number[]): number {
  return widths.reduce((sum, width) => sum + width, 0)
}

function getVisibleIndices<T extends WidthColumn>(columns: T[]): number[] {
  return columns.reduce<number[]>((indices, column, index) => {
    if (column.visible !== false) indices.push(index)
    return indices
  }, [])
}

function resolveMinWidth(key: string, minWidth: MinWidthConfig, fallback: number): number {
  if (typeof minWidth === 'number') return minWidth
  return minWidth[key] ?? fallback
}

function growWidthsToTarget(widths: number[], targetWidth: number): number[] {
  const totalWidth = sumWidths(widths)
  const extraWidth = targetWidth - totalWidth
  if (extraWidth <= EPSILON || widths.length === 0) return widths

  if (totalWidth <= EPSILON) {
    const increment = extraWidth / widths.length
    return widths.map(width => width + increment)
  }

  return widths.map(width => width + (extraWidth * width) / totalWidth)
}

function shrinkWidthsToTarget(widths: number[], minWidths: number[], targetWidth: number): number[] {
  const nextWidths = [...widths]
  let remaining = sumWidths(nextWidths) - targetWidth

  while (remaining > EPSILON) {
    const adjustable = nextWidths
      .map((width, index) => ({ index, room: width - minWidths[index] }))
      .filter(item => item.room > EPSILON)

    if (adjustable.length === 0) break

    const totalRoom = adjustable.reduce((sum, item) => sum + item.room, 0)
    if (totalRoom <= EPSILON) break

    let removed = 0
    for (const item of adjustable) {
      const reduction = Math.min(item.room, (remaining * item.room) / totalRoom)
      nextWidths[item.index] -= reduction
      removed += reduction
    }

    if (removed <= EPSILON) break
    remaining -= removed
  }

  return nextWidths
}

function fitWidthsToTarget(widths: number[], minWidths: number[], targetWidth: number): number[] {
  if (widths.length === 0 || targetWidth <= EPSILON) return widths

  const minTotal = sumWidths(minWidths)
  if (targetWidth <= minTotal + EPSILON) {
    return minWidths.map(roundWidth)
  }

  const totalWidth = sumWidths(widths)
  if (Math.abs(totalWidth - targetWidth) <= EPSILON) {
    return widths.map(roundWidth)
  }

  let nextWidths = totalWidth <= EPSILON
    ? minWidths.map(minWidth => minWidth + (targetWidth - minTotal) / widths.length)
    : widths.map((width, index) => Math.max(minWidths[index], (width * targetWidth) / totalWidth))

  const nextTotal = sumWidths(nextWidths)
  if (nextTotal > targetWidth + EPSILON) {
    nextWidths = shrinkWidthsToTarget(nextWidths, minWidths, targetWidth)
  } else if (nextTotal < targetWidth - EPSILON) {
    nextWidths = growWidthsToTarget(nextWidths, targetWidth)
  }

  return nextWidths.map(roundWidth)
}

function sameWidths(left: number[], right: number[]): boolean {
  if (left.length !== right.length) return false
  return left.every((width, index) => Math.abs(width - right[index]) <= EPSILON)
}

function fitVisibleColumnsToWidth<T extends WidthColumn>(columns: T[], targetWidth: number, minWidth: number): T[] {
  const visibleIndices = getVisibleIndices(columns)
  if (visibleIndices.length === 0) return columns

  const currentWidths = visibleIndices.map(index => columns[index].width)
  const minWidths = visibleIndices.map(() => minWidth)
  const nextWidths = fitWidthsToTarget(currentWidths, minWidths, targetWidth)

  if (sameWidths(currentWidths, nextWidths)) return columns

  const widthMap = new Map<number, number>()
  visibleIndices.forEach((index, position) => {
    widthMap.set(index, nextWidths[position])
  })

  return columns.map((column, index) => {
    const nextWidth = widthMap.get(index)
    return nextWidth == null ? column : { ...column, width: nextWidth }
  })
}

function resizeVisibleColumnsWithAdjacent<T extends WidthColumn>(
  columns: T[],
  key: string,
  deltaX: number,
  minWidth: number,
): T[] {
  const visibleIndices = getVisibleIndices(columns)
  const leftPosition = visibleIndices.findIndex(index => columns[index].key === key)
  if (leftPosition === -1 || leftPosition >= visibleIndices.length - 1) return columns

  const leftIndex = visibleIndices[leftPosition]
  const rightIndex = visibleIndices[leftPosition + 1]
  const leftColumn = columns[leftIndex]
  const rightColumn = columns[rightIndex]

  const maxIncrease = rightColumn.width - minWidth
  const maxDecrease = leftColumn.width - minWidth
  const clampedDelta = Math.max(-maxDecrease, Math.min(deltaX, maxIncrease))

  if (Math.abs(clampedDelta) <= EPSILON) return columns

  const nextLeftWidth = roundWidth(leftColumn.width + clampedDelta)
  const nextRightWidth = roundWidth(rightColumn.width - clampedDelta)

  return columns.map((column, index) => {
    if (index === leftIndex) return { ...column, width: nextLeftWidth }
    if (index === rightIndex) return { ...column, width: nextRightWidth }
    return column
  })
}

function fitWidthMapToWidth(
  widths: Record<string, number>,
  order: string[],
  targetWidth: number,
  minWidth: MinWidthConfig,
  fallbackMinWidth: number,
): Record<string, number> {
  if (order.length === 0 || targetWidth <= EPSILON) return widths

  const currentWidths = order.map(key => widths[key] ?? 0)
  const minWidths = order.map(key => resolveMinWidth(key, minWidth, fallbackMinWidth))
  const nextWidths = fitWidthsToTarget(currentWidths, minWidths, targetWidth)

  if (sameWidths(currentWidths, nextWidths)) return widths

  const next = { ...widths }
  order.forEach((key, index) => {
    next[key] = nextWidths[index]
  })
  return next
}

function resizeWidthMapWithAdjacent(
  widths: Record<string, number>,
  order: string[],
  key: string,
  deltaX: number,
  minWidth: MinWidthConfig,
  fallbackMinWidth: number,
): Record<string, number> {
  const leftPosition = order.indexOf(key)
  if (leftPosition === -1 || leftPosition >= order.length - 1) return widths

  const leftKey = order[leftPosition]
  const rightKey = order[leftPosition + 1]
  const leftWidth = widths[leftKey] ?? 0
  const rightWidth = widths[rightKey] ?? 0
  const leftMinWidth = resolveMinWidth(leftKey, minWidth, fallbackMinWidth)
  const rightMinWidth = resolveMinWidth(rightKey, minWidth, fallbackMinWidth)

  const maxIncrease = rightWidth - rightMinWidth
  const maxDecrease = leftWidth - leftMinWidth
  const clampedDelta = Math.max(-maxDecrease, Math.min(deltaX, maxIncrease))

  if (Math.abs(clampedDelta) <= EPSILON) return widths

  return {
    ...widths,
    [leftKey]: roundWidth(leftWidth + clampedDelta),
    [rightKey]: roundWidth(rightWidth - clampedDelta),
  }
}

function getArrayMinTotalWidth<T extends WidthColumn>(columns: T[], minWidth: number, fixedWidth: number): number {
  const visibleCount = getVisibleIndices(columns).length
  return visibleCount * minWidth + fixedWidth
}

function getWidthMapMinTotalWidth(order: string[], minWidth: MinWidthConfig, fallbackMinWidth: number, fixedWidth: number): number {
  const contentMinWidth = order.reduce((sum, key) => sum + resolveMinWidth(key, minWidth, fallbackMinWidth), 0)
  return contentMinWidth + fixedWidth
}

function normalizeResizableCell(cell: HTMLTableCellElement) {
  cell.classList.add('overflow-hidden', 'truncate')

  if (cell.style.overflow !== 'hidden') cell.style.overflow = 'hidden'
  if (cell.style.textOverflow !== 'ellipsis') cell.style.textOverflow = 'ellipsis'
  if (cell.style.whiteSpace !== 'nowrap') cell.style.whiteSpace = 'nowrap'

  const text = cell.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  if (text && !cell.getAttribute('title')) {
    cell.setAttribute('title', text)
  }
}

function applyResizableTableContract(containerEl: HTMLDivElement | null) {
  if (!containerEl) return

  const tables = Array.from(containerEl.querySelectorAll('table'))
  for (const table of tables) {
    if (table.style.tableLayout !== 'fixed') table.style.tableLayout = 'fixed'
    if (table.style.width !== '100%') table.style.width = '100%'

    const bodyCells = table.querySelectorAll<HTMLTableCellElement>('tbody td')
    bodyCells.forEach(normalizeResizableCell)
  }
}

type ArrayHookOptions<T extends WidthColumn> = {
  columns: T[]
  columnsRef: MutableRefObject<T[]>
  saveColumns: (next: T[]) => void
  fixedWidth?: number
  minWidth?: number
}

export function useFixedWidthResizableColumns<T extends WidthColumn>({
  columns,
  columnsRef,
  saveColumns,
  fixedWidth = 0,
  minWidth = 80,
}: ArrayHookOptions<T>) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const saveColumnsRef = useRef(saveColumns)
  const resizeRef = useRef<{ key: string; startX: number; snapshot: T[] } | null>(null)

  useEffect(() => {
    saveColumnsRef.current = saveColumns
  }, [saveColumns])

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node)
  }, [])

  const updateOverflow = useCallback(() => {
    if (!containerEl) return
    const minTotal = getArrayMinTotalWidth(columnsRef.current, minWidth, fixedWidth)
    setIsOverflowing(containerEl.clientWidth < minTotal - EPSILON)
  }, [containerEl, columnsRef, fixedWidth, minWidth])

  const syncToContainer = useCallback(() => {
    if (!containerEl) return
    const next = fitVisibleColumnsToWidth(columnsRef.current, Math.max(containerEl.clientWidth - fixedWidth, 0), minWidth)
    if (next !== columnsRef.current) saveColumnsRef.current(next)
    applyResizableTableContract(containerEl)
    updateOverflow()
  }, [columnsRef, containerEl, fixedWidth, minWidth, updateOverflow])

  useEffect(() => {
    syncToContainer()
  }, [syncToContainer])

  useEffect(() => {
    if (!containerEl || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(() => syncToContainer())
    observer.observe(containerEl)
    return () => observer.disconnect()
  }, [containerEl, syncToContainer])

  useEffect(() => {
    if (!containerEl) return undefined

    let frameId: number | null = null

    const scheduleApply = () => {
      if (frameId != null) return
      frameId = window.requestAnimationFrame(() => {
        frameId = null
        applyResizableTableContract(containerEl)
      })
    }

    scheduleApply()

    if (typeof MutationObserver === 'undefined') {
      return () => {
        if (frameId != null) window.cancelAnimationFrame(frameId)
      }
    }

    const observer = new MutationObserver(() => scheduleApply())
    observer.observe(containerEl, { childList: true, subtree: true, characterData: true })

    return () => {
      if (frameId != null) window.cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [containerEl])

  const startResize = useCallback((event: ReactMouseEvent, key: string) => {
    event.preventDefault()
    event.stopPropagation()
    const snapshot = columnsRef.current
    resizeRef.current = { key, startX: event.clientX, snapshot }
    document.body.style.cursor = 'col-resize'

    const onMove = (moveEvent: MouseEvent) => {
      const active = resizeRef.current
      if (!active) return
      const next = resizeVisibleColumnsWithAdjacent(active.snapshot, active.key, moveEvent.clientX - active.startX, minWidth)
      if (next !== active.snapshot) saveColumnsRef.current(next)
    }

    const onUp = () => {
      resizeRef.current = null
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [columnsRef, minWidth])

  return { containerRef, startResize, isOverflowing }
}

type WidthMapHookOptions = {
  widths: Record<string, number>
  widthsRef: MutableRefObject<Record<string, number>>
  order: string[]
  saveWidths: (next: Record<string, number>) => void
  fixedWidth?: number
  minWidth?: MinWidthConfig
  fallbackMinWidth?: number
}

export function useFixedWidthResizableMap({
  widths,
  widthsRef,
  order,
  saveWidths,
  fixedWidth = 0,
  minWidth = 80,
  fallbackMinWidth = 80,
}: WidthMapHookOptions) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const saveWidthsRef = useRef(saveWidths)
  const resizeRef = useRef<{ key: string; startX: number; snapshot: Record<string, number> } | null>(null)

  useEffect(() => {
    saveWidthsRef.current = saveWidths
  }, [saveWidths])

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node)
  }, [])

  const updateOverflow = useCallback(() => {
    if (!containerEl) return
    const minTotal = getWidthMapMinTotalWidth(order, minWidth, fallbackMinWidth, fixedWidth)
    setIsOverflowing(containerEl.clientWidth < minTotal - EPSILON)
  }, [containerEl, fixedWidth, fallbackMinWidth, minWidth, order])

  const syncToContainer = useCallback(() => {
    if (!containerEl) return
    const next = fitWidthMapToWidth(widthsRef.current, order, Math.max(containerEl.clientWidth - fixedWidth, 0), minWidth, fallbackMinWidth)
    if (next !== widthsRef.current) saveWidthsRef.current(next)
    applyResizableTableContract(containerEl)
    updateOverflow()
  }, [containerEl, fallbackMinWidth, fixedWidth, minWidth, order, updateOverflow, widthsRef])

  useEffect(() => {
    syncToContainer()
  }, [syncToContainer])

  useEffect(() => {
    if (!containerEl || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(() => syncToContainer())
    observer.observe(containerEl)
    return () => observer.disconnect()
  }, [containerEl, syncToContainer])

  useEffect(() => {
    if (!containerEl) return undefined

    let frameId: number | null = null

    const scheduleApply = () => {
      if (frameId != null) return
      frameId = window.requestAnimationFrame(() => {
        frameId = null
        applyResizableTableContract(containerEl)
      })
    }

    scheduleApply()

    if (typeof MutationObserver === 'undefined') {
      return () => {
        if (frameId != null) window.cancelAnimationFrame(frameId)
      }
    }

    const observer = new MutationObserver(() => scheduleApply())
    observer.observe(containerEl, { childList: true, subtree: true, characterData: true })

    return () => {
      if (frameId != null) window.cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [containerEl])

  const startResize = useCallback((event: ReactMouseEvent, key: string) => {
    event.preventDefault()
    event.stopPropagation()
    const snapshot = widthsRef.current
    resizeRef.current = { key, startX: event.clientX, snapshot }
    document.body.style.cursor = 'col-resize'

    const onMove = (moveEvent: MouseEvent) => {
      const active = resizeRef.current
      if (!active) return
      const next = resizeWidthMapWithAdjacent(active.snapshot, order, active.key, moveEvent.clientX - active.startX, minWidth, fallbackMinWidth)
      if (next !== active.snapshot) saveWidthsRef.current(next)
    }

    const onUp = () => {
      resizeRef.current = null
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [fallbackMinWidth, minWidth, order, widthsRef])

  return { containerRef, startResize, isOverflowing }
}