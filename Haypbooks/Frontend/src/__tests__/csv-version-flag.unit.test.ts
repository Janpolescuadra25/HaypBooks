import { parseCsvVersionFlag } from '../lib/csv'

describe('parseCsvVersionFlag', () => {
  const base = 'http://x.test/api?'
  const t = (q: string) => new Request(base + q)

  it('returns false when absent', () => {
    expect(parseCsvVersionFlag(t(''))).toBe(false)
  })

  it('accepts aliases', () => {
    expect(parseCsvVersionFlag(t('csvVersion=1'))).toBe(true)
    expect(parseCsvVersionFlag(t('csv-version=1'))).toBe(true)
    expect(parseCsvVersionFlag(t('csv_version=1'))).toBe(true)
    expect(parseCsvVersionFlag(t('csv=1'))).toBe(true)
    expect(parseCsvVersionFlag(t('version=1'))).toBe(true)
  })

  it('treats falsy strings as false (case-insensitive)', () => {
    for (const k of ['csvVersion','csv-version','csv_version','csv','version']) {
      expect(parseCsvVersionFlag(t(`${k}=0`))).toBe(false)
      expect(parseCsvVersionFlag(t(`${k}=false`))).toBe(false)
      expect(parseCsvVersionFlag(t(`${k}=no`))).toBe(false)
      expect(parseCsvVersionFlag(t(`${k}=off`))).toBe(false)
      expect(parseCsvVersionFlag(t(`${k}=NULL`))).toBe(false)
      expect(parseCsvVersionFlag(t(`${k}=Undefined`))).toBe(false)
      expect(parseCsvVersionFlag(t(`${k}=`))).toBe(false)
    }
  })

  it('treats arbitrary truthy values as true', () => {
    expect(parseCsvVersionFlag(t('csv=yes'))).toBe(true)
    expect(parseCsvVersionFlag(t('csv=true'))).toBe(true)
    expect(parseCsvVersionFlag(t('csv=on'))).toBe(true)
    expect(parseCsvVersionFlag(t('csv=2'))).toBe(true)
    expect(parseCsvVersionFlag(t('csv=latest'))).toBe(true)
  })
})
