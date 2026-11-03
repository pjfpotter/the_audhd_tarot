import { describe, expect, test } from 'vitest'
import { deviceFraction, deviceRandom, shuffled } from './random'

describe('deviceRandom', () => {
  test('gives whole numbers below the limit', () => {
    for (let i = 0; i < 2000; i++) {
      const value = deviceRandom(22)
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(22)
    }
  })

  test('fractions are in [0, 1)', () => {
    for (let i = 0; i < 2000; i++) {
      const value = deviceFraction()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('shuffled', () => {
  const numbers = Array.from({ length: 22 }, (_, i) => i)

  test('keeps every item exactly once and leaves the original alone', () => {
    const result = shuffled(numbers, deviceRandom)
    expect([...result].sort((a, b) => a - b)).toEqual(numbers)
    expect(numbers).toEqual(Array.from({ length: 22 }, (_, i) => i))
  })

  test('starts in a different place each time', () => {
    const firsts = new Set(Array.from({ length: 60 }, () => shuffled(numbers, deviceRandom).join(',')))
    expect(firsts.size).toBeGreaterThan(55)
  })

  test('puts every card in every place about equally often', () => {
    const runs = 44_000
    const counts = numbers.map(() => new Array<number>(22).fill(0))
    for (let i = 0; i < runs; i++) shuffled(numbers, deviceRandom).forEach((n, place) => counts[place]![n]!++)
    const expected = runs / 22
    for (const place of counts) {
      for (const count of place) {
        expect(count).toBeGreaterThan(expected * 0.88)
        expect(count).toBeLessThan(expected * 1.12)
      }
    }
  })
})
