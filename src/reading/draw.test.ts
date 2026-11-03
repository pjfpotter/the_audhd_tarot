import { describe, expect, test } from 'vitest'
import { cards } from '../content/cards'
import { type Random, readingFrom, selectUnities } from './draw'
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

describe('readingFrom', () => {
  test('is exactly the cards chosen, in the order chosen', () => {
    const reading = readingFrom(cards, [17, 3, 0], seeded(5))
    expect(reading.map((drawn) => drawn.number)).toEqual([17, 3, 0])
  })

  test('has each card\'s unities chosen from that card', () => {
    const reading = readingFrom(cards, [9, 21, 5], seeded(6))
    for (const drawn of reading) {
      const card = cards.find((candidate) => candidate.number === drawn.number)!
      expect(drawn.unities.length === 2 || drawn.unities.length === 3).toBe(true)
      for (const unity of drawn.unities) expect(card.unities).toContain(unity)
    }
  })

  test('refuses a card that is not in the deck', () => {
    expect(() => readingFrom(cards, [1, 2, 99], seeded(7))).toThrow()
  })

  test('the spread names the three positions in order', () => {
    expect(threeCardSpread.positions).toEqual([
      'Where I am',
      'How I should travel',
      "Where I'm going next",
    ])
  })
})
