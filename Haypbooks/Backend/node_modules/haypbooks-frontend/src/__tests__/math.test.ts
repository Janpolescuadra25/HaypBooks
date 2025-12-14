import { bankersRound, toTwo } from '@/lib/math'

describe('math helpers', () => {
  it('banker rounds ties to even for integer ties and respects normal rounding nearby', () => {
    // integer half ties are exact in binary and make stable assertions
    expect(bankersRound(12.5, 0)).toBe(12) // 12 is even -> stays
    expect(bankersRound(13.5, 0)).toBe(14) // 13 odd -> round to even 14
    expect(bankersRound(-1.5, 0)).toBe(-2) // negative tie rounds to even -2
    // nearby non-tie decimals
    expect(bankersRound(2.344, 2)).toBe(2.34)
    expect(bankersRound(2.346, 2)).toBe(2.35)
  })

  it('toTwo keeps two-decimal stable rounding', () => {
    expect(toTwo(2.345)).toBe(2.35)
    expect(toTwo(2.3449)).toBe(2.34)
    expect(toTwo(1.005)).toBe(1.01)
  })
})
