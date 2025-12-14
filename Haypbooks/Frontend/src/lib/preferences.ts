type Filters = Record<string, string>
type Pref = { filters: Filters; updatedAt: string }

const isBrowser = typeof window !== 'undefined'

export async function getReportFilters(reportKey: string): Promise<Pref> {
  try {
    const res = await fetch(`/api/user/preferences/report-filters?reportKey=${encodeURIComponent(reportKey)}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(String(res.status))
    return (await res.json()) as Pref
  } catch {
    // Fallback: localStorage in mock mode or offline
    if (isBrowser) {
      const raw = localStorage.getItem(`prefs:${reportKey}`)
      if (raw) {
        try { return JSON.parse(raw) as Pref } catch {}
      }
    }
    return { filters: {}, updatedAt: new Date(0).toISOString() }
  }
}

export async function setReportFilters(reportKey: string, filters: Filters): Promise<Pref> {
  const body = JSON.stringify({ reportKey, filters })
  try {
    const res = await fetch('/api/user/preferences/report-filters', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })
    if (!res.ok) throw new Error(String(res.status))
    const pref = (await res.json()) as Pref
    if (isBrowser) localStorage.setItem(`prefs:${reportKey}`, JSON.stringify(pref))
    return pref
  } catch {
    const pref: Pref = { filters, updatedAt: new Date().toISOString() }
    if (isBrowser) localStorage.setItem(`prefs:${reportKey}`, JSON.stringify(pref))
    return pref
  }
}
