export async function trackEvent(eventName: string, payload: Record<string, any> = {}) {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).sendBeacon) {
      const url = '/api/analytics/event'
      const body = JSON.stringify({ event: eventName, payload, timestamp: new Date().toISOString() })
      try { (navigator as any).sendBeacon(url, body) } catch (e) { /* ignore */ }
      return
    }
    // Fallback to fetch
    await fetch('/api/analytics/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: eventName, payload, timestamp: new Date().toISOString() }) }).catch(() => {})
  } catch (e) {
    // swallow analytics errors
    console.warn('[analytics] failed to track event', e)
  }
}