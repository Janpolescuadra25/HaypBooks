import { evaluateKpi } from '@/lib/kpi-benchmarks'

describe('kpi-benchmarks', () => {
  test('churn lower is better', () => {
    const cur = [4.0]
    const prev = [5.0]
    const r = evaluateKpi('Churn (%)', cur, prev)
    expect(r.status === 'good' || r.status === 'warn').toBe(true)
  })
  test('A/R days thresholds', () => {
    expect(evaluateKpi('A/R days', [34]).status).toBe('good')
    expect(evaluateKpi('A/R days', [40]).status).toBe('warn')
    expect(evaluateKpi('A/R days', [60]).status).toBe('bad')
  })
  test('A/P days band', () => {
    expect(evaluateKpi('A/P days', [25]).status).toBe('good')
    expect(evaluateKpi('A/P days', [12]).status).toBe('bad')
  })
  test('Revenue positive trend is good', () => {
    const r = evaluateKpi('Revenue (K)', [10, 11])
    expect(r.status).toBe('good')
  })
})
