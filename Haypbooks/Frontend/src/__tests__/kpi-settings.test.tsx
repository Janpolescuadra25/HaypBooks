import { evaluateKpi, defaultKpiThresholds } from '@/lib/kpi-benchmarks'

describe('kpi thresholds', () => {
  it('evaluateKpi respects custom thresholds', () => {
    // With defaults, A/R 40 => warn
    expect(evaluateKpi('A/R days', [40]).status).toBe('warn')
    // Tighten warn to 38; 40 becomes bad
    expect(evaluateKpi('A/R days', [40], undefined, { arDaysMaxWarn: 38 }).status).toBe('bad')
    // Loosen good to 40; 40 becomes good
    expect(evaluateKpi('A/R days', [40], undefined, { arDaysMaxGood: 40, arDaysMaxWarn: 50 }).status).toBe('good')
  })

  it('defaults are sane', () => {
    expect(defaultKpiThresholds.churnMaxGood).toBe(3)
    expect(defaultKpiThresholds.apDaysMinGood).toBeLessThan(defaultKpiThresholds.apDaysMaxGood)
  })
})
