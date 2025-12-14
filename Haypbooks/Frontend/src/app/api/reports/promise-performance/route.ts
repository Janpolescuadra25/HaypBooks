import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'
import { db, seedIfNeeded } from '@/mock/db'
import { evaluatePromises } from '@/lib/promise-eval'

type Row = {
  customerId: string
  customer: string
  open: number
  kept: number
  broken: number
  keptOnTimePct: number // 0..100
  avgDaysToKeep: number | null
  openExposure: number
  brokenExposure: number
  nextPromiseDate?: string | null
  promiseAgingDays?: number | null
}

function daysBetween(aIso: string | undefined, bIso: string | undefined): number | null {
  if (!aIso || !bIso) return null
  const a = new Date(aIso.slice(0,10) + 'T00:00:00Z')
  const b = new Date(bIso.slice(0,10) + 'T00:00:00Z')
  if (isNaN(a.valueOf()) || isNaN(b.valueOf())) return null
  return Math.floor((b.getTime() - a.getTime()) / 86400000)
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const customerIdFilter = url.searchParams.get('customerId') || undefined
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end
  try { seedIfNeeded() } catch {}
  const asOfIso: string = end || new Date().toISOString().slice(0,10)
  // Normalize promise statuses as-of end date
  try { evaluatePromises(asOfIso) } catch {}

  const inWindow = (promIso: string) => {
    if (start && promIso < start) return false
    if (end && promIso > end) return false
    return true
  }

  const rows: Row[] = []
  for (const cust of db.customers) {
    if (customerIdFilter && cust.id !== customerIdFilter) continue
    const promises = (db.promises || []).filter(p => p.customerId === cust.id && inWindow(p.promisedDate))
    if (promises.length === 0) continue
    let open = 0, kept = 0, broken = 0
    let keptOnTime = 0
    let sumDaysToKeep = 0, keptWithDays = 0
    let openExposure = 0, brokenExposure = 0
    let nextPromiseDate: string | null = null
    let promiseAgingDays: number | null = null
    for (const p of promises) {
      if (p.status === 'open') {
        open++
        openExposure += Number(p.amount || 0)
        if (!nextPromiseDate || p.promisedDate < nextPromiseDate) nextPromiseDate = p.promisedDate
      } else if (p.status === 'kept') {
        kept++
        const onTime = (p.keptAt && p.keptAt.slice(0,10) <= p.promisedDate)
        if (onTime) keptOnTime++
        const d = daysBetween(p.createdAt, p.keptAt)
        if (d != null) { sumDaysToKeep += d; keptWithDays++ }
      } else if (p.status === 'broken') {
        broken++
        brokenExposure += Number(p.amount || 0)
        const daysPast = daysBetween(p.promisedDate, asOfIso)
        if (daysPast != null) {
          if (promiseAgingDays == null || daysPast > promiseAgingDays) promiseAgingDays = daysPast
        }
      }
    }
    const keptOnTimePct = kept > 0 ? Number(((keptOnTime / kept) * 100).toFixed(1)) : 0
    const avgDaysToKeep = keptWithDays > 0 ? Number((sumDaysToKeep / keptWithDays).toFixed(1)) : null
    rows.push({
      customerId: cust.id,
      customer: cust.name,
      open,
      kept,
      broken,
      keptOnTimePct,
      avgDaysToKeep,
      openExposure: Number(openExposure.toFixed(2)),
      brokenExposure: Number(brokenExposure.toFixed(2)),
      nextPromiseDate: nextPromiseDate || null,
      promiseAgingDays: promiseAgingDays ?? null,
    })
  }
  // Sort: worst performance first (higher broken, lower keptOnTime) then larger exposure
  rows.sort((a,b) => {
    if (b.broken !== a.broken) return b.broken - a.broken
    if (a.keptOnTimePct !== b.keptOnTimePct) return a.keptOnTimePct - b.keptOnTimePct
    const expB = (b.openExposure + b.brokenExposure) - (a.openExposure + a.brokenExposure)
    if (expB !== 0) return expB
    return String(a.customer).localeCompare(String(b.customer))
  })
  const totals = rows.reduce((acc, r) => {
    acc.open += r.open
    acc.kept += r.kept
    acc.broken += r.broken
    acc.openExposure += r.openExposure
    acc.brokenExposure += r.brokenExposure
    return acc
  }, { open: 0, kept: 0, broken: 0, openExposure: 0, brokenExposure: 0 })
  const keptOnTimePctTotal = ((): number => {
    let keptCount = 0, keptOnTimeCount = 0
    for (const cust of db.customers) {
      if (customerIdFilter && cust.id !== customerIdFilter) continue
      const promises = (db.promises || []).filter(p => p.customerId === cust.id && inWindow(p.promisedDate) && p.status === 'kept')
      for (const p of promises) {
        keptCount++
        if (p.keptAt && p.keptAt.slice(0,10) <= p.promisedDate) keptOnTimeCount++
      }
    }
    return keptCount > 0 ? Number(((keptOnTimeCount / keptCount) * 100).toFixed(1)) : 0
  })()
  return NextResponse.json({ rows, totals: { ...totals, keptOnTimePct: keptOnTimePctTotal }, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
