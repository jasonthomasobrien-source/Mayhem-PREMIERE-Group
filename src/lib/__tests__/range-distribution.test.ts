import { distributeAcrossDays } from '../range-distribution'

describe('distributeAcrossDays', () => {
  it('distributes evenly', () => {
    const result = distributeAcrossDays(35, 0, 7)
    expect(result).toHaveLength(7)
    expect(result.every((r) => r.attempts === 5)).toBe(true)
    expect(result.reduce((sum, r) => sum + r.attempts, 0)).toBe(35)
  })

  it('handles remainder by adding to last day', () => {
    const result = distributeAcrossDays(36, 2, 7)
    expect(result).toHaveLength(7)
    expect(result.slice(0, 6).every((r) => r.attempts === 5)).toBe(true)
    expect(result[6].attempts).toBe(6)
    expect(result.reduce((sum, r) => sum + r.attempts, 0)).toBe(36)
  })

  it('handles single day', () => {
    const result = distributeAcrossDays(10, 2, 1)
    expect(result).toEqual([{ attempts: 10, leads: 2 }])
  })
})
