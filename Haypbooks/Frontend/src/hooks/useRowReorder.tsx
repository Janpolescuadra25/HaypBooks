import { useState, useCallback, useRef } from 'react'

export default function useRowReorder(onMove: (from: number, to: number) => void) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const lastFromRef = useRef<number | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDraggingIdx(idx)
    lastFromRef.current = idx
    try { e.dataTransfer?.setData('text/plain', String(idx)) } catch {}
    // useful for screen readers
    e.currentTarget.setAttribute('aria-grabbed', 'true')
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, to: number) => {
    e.preventDefault()
    let from = draggingIdx
    if (from == null) {
      const parsed = parseInt(e.dataTransfer?.getData('text/plain') || '', 10)
      from = isNaN(parsed) ? null : parsed
    }
    if (from != null && from !== to) {
      onMove(from, to)
    }
    setDraggingIdx(null)
    setDragOverIdx(null)
    lastFromRef.current = null
  }, [draggingIdx, onMove])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggingIdx(null)
    setDragOverIdx(null)
    try { e.currentTarget.setAttribute('aria-grabbed', 'false') } catch {}
    lastFromRef.current = null
  }, [])

  // keyboard helpers for accessibility (move with buttons)
  const moveUp = useCallback((idx: number) => {
    if (idx <= 0) return
    onMove(idx, idx - 1)
  }, [onMove])
  const moveDown = useCallback((idx: number, maxIndex: number) => {
    if (idx >= maxIndex) return
    onMove(idx, idx + 1)
  }, [onMove])

  return {
    draggingIdx,
    dragOverIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    moveUp,
    moveDown,
  }
}
