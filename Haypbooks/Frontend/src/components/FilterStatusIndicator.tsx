"use client"
import { useEffect, useRef, useState } from 'react'

interface Props {
  saving?: boolean
  error?: string
  // Optional ID to bind with aria-describedby from a control
  liveRegionId?: string
}

// UX: No persistent timestamps; announce state changes via aria-live politely.
export function FilterStatusIndicator({ saving, error, liveRegionId }: Props) {
  const [liveMessage, setLiveMessage] = useState<string>("")
  const prevSavingRef = useRef<boolean>(false)

  // Announce when saving starts, errors occur, and when save completes.
  useEffect(() => {
    const prevSaving = prevSavingRef.current
    prevSavingRef.current = !!saving

    if (error) {
      setLiveMessage('Error saving filters')
      return
    }
    if (saving) {
      setLiveMessage('Saving filters')
      return
    }
    // Transition: saving -> idle (no error)
    if (prevSaving && !saving) {
      setLiveMessage('Filters saved')
      // Clear the message after a brief period to avoid stale SR reads
      const t = setTimeout(() => setLiveMessage(''), 1500)
      return () => clearTimeout(t)
    }
    // Idle with no notable update
    setLiveMessage('')
  }, [saving, error])

  return (
    <span className="inline-flex items-center gap-2">
      {error ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600" title={error}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" aria-hidden="true" />
          Error
        </span>
      ) : saving ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-600" title="Saving filters…">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" aria-hidden="true" />
          Saving…
        </span>
      ) : null}
      {/* Persistent live region for screen readers */}
      <span id={liveRegionId} className="sr-only" aria-live="polite">{liveMessage}</span>
    </span>
  )
}

export default FilterStatusIndicator