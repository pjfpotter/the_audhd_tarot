import { describe, expect, test } from 'vitest'
import { cards } from '../content/cards'
import { type Random, deviceRandom, drawCards, drawReading, selectUnities } from './draw'
import { threeCardSpread } from './spread'

/** A repeatable random source (mulberry32), so results do not vary between runs. */
function seeded(seed: number): Random {
  let a = seed
  return (limit) => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * limit)
  }
}

describe('drawCards', () => {
  test('draws three different cards', () => {
    const random = seeded(1)
    for (let i = 0; i < 2000; i++) {
      const drawn = drawCards(cards, 3, random)
      expect(drawn).toHaveLength(3)
      expect(new Set(drawn).size).toBe(3)
    }
  })

  test('every card appears in every position about equally often', () => {
    const random = seeded(2)
    const draws = 66_000
    const counts = [0, 1, 2].map(() => new Array<number>(22).fill(0))
    for (let i = 0; i < draws; i++) {
      drawCards(cards, 3, random).forEach((number, position) => counts[position]![number]!++)
    }
    const expected = draws / 22
    for (const position of counts) {
      for (const count of position) {
        expect(count).toBeGreaterThan(expected * 0.9)
        expect(count).toBeLessThan(expected * 1.1)
      }
    }
  })

  test('successive draws differ', () => {
    const random = seeded(3)
    const draws = new Set(Array.from({ length: 50 }, () => drawCards(cards, 3, random).join(',')))
    expect(draws.size).toBeGreaterThan(40)
  })
})

describe('deviceRandom', () => {
  test('stays within the limit and reaches every value', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 2000; i++) {
      const value = deviceRandom(22)
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(22)
      seen.add(value)
    }
    expect(seen.size).toBe(22)
  })
})

describe('selectUnities', () => {
  test('chooses two or three different unities of the card', () => {
    const random = seeded(4)
    const sizes = new Set<number>()
    for (const card of cards) {
      for (let i = 0; i < 50; i++) {
        const chosen = selectUnities(card, 0, [card.number], random)
        sizes.add(chosen.length)
        expect(new Set(chosen).size).toBe(chosen.length)
        for (const unity of chosen) expect(card.unities).toContain(unity)
      }
    }
    expect([...sizes].sort()).toEqual([2, 3])
  })
})

describe('drawReading', () => {
  test('has one card for each position, each with its unities chosen', () => {
    const reading = drawReading(cards, threeCardSpread, seeded(5))
    expect(reading).toHaveLength(threeCardSpread.positions.length)
    expect(new Set(reading.map((drawn) => drawn.number)).size).toBe(3)
    for (const drawn of reading) {
      expect(drawn.unities.length === 2 || drawn.unities.length === 3).toBe(true)
    }
  })

  test('the spread names the three positions in order', () => {
    expect(threeCardSpread.positions).toEqual([
      'Where I am',
      'How I should travel',
      "Where I'm going next",
    ])
  })
})
