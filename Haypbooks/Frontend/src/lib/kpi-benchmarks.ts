export type KpiName = 'Revenue (K)' | 'Gross margin (K)' | 'Cash (K)' | 'MRR (K)' | 'Churn (%)' | 'A/R days' | 'A/P days'

export type KpiStatus = 'good' | 'warn' | 'bad'

export type KpiThresholds = {
  // Churn thresholds (lower is better)
  churnMaxGood: number
  churnMaxWarn: number
  // A/R days (lower is better)
  arDaysMaxGood: number
  arDaysMaxWarn: number
  // A/P days (balanced band is best)
  apDaysMinGood: number
  apDaysMaxGood: number
  apDaysMinWarn: number
  apDaysMaxWarn: number
  // For positive-is-good metrics (revenue, mrr, cash, margin)
  // Good if pct >= 0, warn if pct >= positiveWarnFloorPct, else bad
  positiveWarnFloorPct: number
}

export const defaultKpiThresholds: Readonly<KpiThresholds> = {
  churnMaxGood: 3,
  churnMaxWarn: 5,
  arDaysMaxGood: 35,
  arDaysMaxWarn: 45,
  apDaysMinGood: 20,
  apDaysMaxGood: 35,
  apDaysMinWarn: 15,
  apDaysMaxWarn: 50,
  positiveWarnFloorPct: -5,
}

export function evaluateKpi(
  name: KpiName,
  currentSeries: number[],
  prevSeries?: number[],
  thresholds: Partial<KpiThresholds> = {}
): { status: KpiStatus; deltaPct?: number; explainer: string } {
  const t: KpiThresholds = { ...defaultKpiThresholds, ...thresholds }
  const cur = Number(currentSeries.at(-1) ?? 0)
  const prev = Number((prevSeries && prevSeries.at(-1) !== undefined) ? prevSeries.at(-1) : currentSeries.at(-2) ?? currentSeries.at(-1) ?? 0)
  const delta = cur - prev
  const pct = prev !== 0 ? (delta / Math.abs(prev)) * 100 : 0

  function statusForPositiveIsGood(): KpiStatus {
    if (pct >= 0) return 'good'
    if (pct >= t.positiveWarnFloorPct) return 'warn'
    return 'bad'
  }

  switch (name) {
    case 'Churn (%)': {
      const v = cur
      const status: KpiStatus = v <= t.churnMaxGood ? 'good' : v <= t.churnMaxWarn ? 'warn' : 'bad'
      return { status, deltaPct: Number(pct.toFixed(2)), explainer: 'Lower churn means more customer retention.' }
    }
    case 'A/R days': {
      const v = cur
      const status: KpiStatus = v <= t.arDaysMaxGood ? 'good' : v <= t.arDaysMaxWarn ? 'warn' : 'bad'
      return { status, deltaPct: Number(pct.toFixed(2)), explainer: 'Lower A/R days improves cash collection speed.' }
    }
    case 'A/P days': {
      const v = cur
      // Target moderate range; extremes can indicate risk
      const status: KpiStatus = (v >= t.apDaysMinGood && v <= t.apDaysMaxGood) ? 'good' : (v >= t.apDaysMinWarn && v <= t.apDaysMaxWarn) ? 'warn' : 'bad'
      return { status, deltaPct: Number(pct.toFixed(2)), explainer: 'Balanced A/P days optimizes cash without straining vendors.' }
    }
    case 'Revenue (K)':
    case 'MRR (K)':
    case 'Cash (K)':
    case 'Gross margin (K)': {
      const status = statusForPositiveIsGood()
      const metric = name.replace(' (K)', '')
      return { status, deltaPct: Number(pct.toFixed(2)), explainer: `${status === 'good' ? 'Growing' : status === 'warn' ? 'Flat' : 'Declining'} ${metric} compared to previous period.` }
    }
  }
}

export function statusColor(status: KpiStatus): string {
  return status === 'good' ? 'text-emerald-700' : status === 'warn' ? 'text-amber-600' : 'text-rose-600'
}

export function statusBg(status: KpiStatus): string {
  return status === 'good' ? 'bg-emerald-100' : status === 'warn' ? 'bg-amber-100' : 'bg-rose-100'
}

export function statusDot(status: KpiStatus): string {
  return status === 'good' ? 'bg-emerald-500' : status === 'warn' ? 'bg-amber-500' : 'bg-rose-500'
}
