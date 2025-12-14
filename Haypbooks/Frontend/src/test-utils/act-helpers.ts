import { act } from 'react'

/**
 * flushAsync
 * Await resolution of microtasks, pending promises, and queued timers (one tick)
 * Useful after triggering state updates that schedule work with setTimeout/Promises.
 */
export async function flushAsync(extraTicks: number = 0, opts?: { runTimers?: boolean }) {
  await act(async () => {
    // Resolve queued microtasks
    await Promise.resolve()
    // Run timers stepwise (only if explicitly requested and fake timers are enabled)
    if (opts?.runTimers && typeof jest !== 'undefined') {
      try {
        const anyJest: any = jest as any
        if (anyJest?.getTimerCount && anyJest.getTimerCount() > 0) {
          anyJest.runOnlyPendingTimers()
        }
      } catch {
        // ignore if real timers are active
      }
    }
    // Optional extra ticks for debounced logic
    for (let i = 0; i < extraTicks; i++) {
      if (opts?.runTimers && typeof jest !== 'undefined') {
        try {
          const anyJest: any = jest as any
          if (anyJest?.getTimerCount && anyJest.getTimerCount() > 0) {
            anyJest.advanceTimersByTime(1)
          }
        } catch {
          // ignore if real timers are active
        }
      }
      await Promise.resolve()
    }
  })
}

/**
 * withinAct - ensures provided callback is wrapped in React act and flushes follow-up async.
 */
export async function withinAct(cb: () => void | Promise<void>, opts: { flush?: boolean; ticks?: number } = {}) {
  await act(async () => { await cb() })
  if (opts.flush) {
    await flushAsync(opts.ticks)
  }
}

/**
 * interceptActWarnings - intercepts React act() warnings so tests can fail loudly or suppress based on env.
 * By default we throw on first warning mentioning act to enforce proper usage.
 */
let restoreConsole: (() => void) | null = null
export function interceptActWarnings({ mode = 'throw' }: { mode?: 'throw' | 'collect' | 'silent' } = {}) {
  if (restoreConsole) return
  const originalError = console.error
  const originalWarn = console.warn
  const collected: string[] = []
  const handler = (orig: (...args: any[]) => void) => (...args: any[]) => {
    const msg = args[0] && String(args[0])
    if (msg && /not wrapped in act|act\(/i.test(msg)) {
      collected.push(msg)
      if (mode === 'throw') {
        throw new Error('React act() warning intercepted: ' + msg)
      }
      // In 'collect' mode we gather the warnings but suppress console noise.
      // In 'silent' mode we also suppress output entirely.
      if (mode === 'collect' || mode === 'silent') return
    }
    orig(...args)
  }
  console.error = handler(originalError)
  console.warn = handler(originalWarn)
  restoreConsole = () => {
    console.error = originalError
    console.warn = originalWarn
    restoreConsole = null
  }
  return collected
}

export function restoreActWarningInterception() {
  if (restoreConsole) restoreConsole()
}
