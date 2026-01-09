const counts: Map<string, number> = new Map()

export function increment(metricName: string) {
  counts.set(metricName, (counts.get(metricName) || 0) + 1)
  // Lightweight log so the metric increment is visible in logs during debugging
  // eslint-disable-next-line no-console
  console.info(`[METRIC] ${metricName} -> ${counts.get(metricName)}`)
}

// Helpers for tests and diagnostics
export function getCount(metricName: string) {
  return counts.get(metricName) || 0
}

export function resetCounts() {
  counts.clear()
}
