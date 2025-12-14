import { buildCsvFilename } from '@/lib/csv'

describe('buildCsvFilename helper', () => {
  it('period mode: Custom with start/end and tokens-after', () => {
    const name = buildCsvFilename('retail-sales-by-channel', {
      period: 'Custom',
      start: '2025-01-01',
      end: '2025-01-31',
      tokens: ['ch-marketplace'],
    })
    expect(name).toBe('retail-sales-by-channel-Custom_2025-01-01_to_2025-01-31_ch-marketplace.csv')
  })

  it('period mode: tokens-before without dates', () => {
    const name = buildCsvFilename('cash-flow', {
      period: 'YTD',
      tokens: ['compare'],
      tokenPosition: 'before',
    })
    expect(name).toBe('cash-flow-compare-YTD.csv')
  })

  it('as-of/range mode: explicit start/end without tokens', () => {
    const name = buildCsvFilename('invoices', {
      start: '2025-01-01',
      end: '2025-01-31',
    })
    expect(name).toBe('invoices-2025-01-01_to_2025-01-31.csv')
  })

  it('as-of mode: tokens-before with as-of date', () => {
    const name = buildCsvFilename('balance-sheet', {
      asOfIso: '2025-09-04',
      tokens: ['YTD-compare'],
      tokenPosition: 'before',
    })
    expect(name).toBe('balance-sheet-YTD-compare-asof-2025-09-04.csv')
  })

  it('as-of mode: tokens-after with as-of date', () => {
    const name = buildCsvFilename('customers', {
      asOfIso: '2025-03-01',
      tokens: ['extra'],
      tokenPosition: 'after',
    })
    expect(name).toBe('customers-asof-2025-03-01_extra.csv')
  })
})
