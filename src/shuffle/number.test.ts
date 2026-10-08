import { describe, expect, test } from 'vitest'
import { cards } from '../content/cards'
import { drawCards } from '../reading/draw'
import { type HiddenNumber, INPUT, fold, glyphs, start, toRandom } from './number'

/** A repeatable source of fractions (mulberry32), standing in for people's varied input. */
function fractions(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const beats = (moments: number[], from: HiddenNumber = start()) =>
  moments.reduce((number, at) => fold(number, INPUT.beat, at, 180, 420), from)

describe('fold', () => {
  test('the same inputs give the same number', () => {
    expect(beats([1_200_000, 1_650_250, 2_010_005])).toEqual(beats([1_200_000, 1_650_250, 2_010_005]))
  })

  test('one millionth of a second gives a different number', () => {
    const one = beats([1_200_000, 1_650_250, 2_010_005])
    const other = beats([1_200_000, 1_650_251, 2_010_005])
    expect([other.a, other.b]).not.toEqual([one.a, one.b])
    expect(glyphs(other)).not.toBe(glyphs(one))
  })

  test('counts its inputs and leaves the number it was given alone', () => {
    const first = start()
    const second = fold(first, INPUT.key, 5_000, 97, 1)
    expect(first).toEqual(start())
    expect(second.inputs).toBe(1)
  })

  test('the kind of input matters', () => {
    expect(fold(start(), INPUT.beat, 5_000, 1, 1)).not.toEqual(fold(start(), INPUT.key, 5_000, 1, 1))
  })
})

describe('glyphs', () => {
  test('are eight symbols with no letters or digits', () => {
    const random = fractions(7)
    let number = start()
    for (let i = 0; i < 500; i++) {
      const row = [...glyphs(number)]
      expect(row).toHaveLength(8)
      expect(row.join('')).not.toMatch(/[\p{L}\p{N}]/u)
      number = fold(number, INPUT.beat, random() * 1e9, random() * 400, random() * 800)
    }
  })

  test('change with an input', () => {
    expect(glyphs(fold(start(), INPUT.draw, 3_000_000))).not.toBe(glyphs(start()))
  })
})

describe('toRandom', () => {
  test('draws the same three different cards for the same number', () => {
    const number = beats([900_000, 1_300_000])
    const drawn = drawCards(cards, 3, toRandom(number))
    expect(new Set(drawn).size).toBe(3)
    expect(drawCards(cards, 3, toRandom(number))).toEqual(drawn)
  })
})

/**
 * One simulated shuffle: some beats, keys and stirs, then the draw. Timings
 * are either spread evenly or clustered the way a person's are: a steady
 * rhythm from a common starting point, in the same part of the screen, on a
 * clock coarsened to a tenth of a millisecond or a whole one.
 */
function simulate(random: () => number, clustered: boolean): HiddenNumber {
  const grain = clustered ? (random() < 0.5 ? 100 : 1000) : 1
  const at = (microseconds: number) => Math.floor(microseconds / grain) * grain
  let clock = clustered ? 800_000 + random() * 4_000_000 : random() * 600_000_000
  const tempo = 180_000 + random() * 320_000
  const inputs = random() < 0.15 ? 0 : Math.floor(random() * 40)
  let number = start()
  for (let i = 0; i < inputs; i++) {
    clock += clustered ? tempo + (random() - 0.5) * 30_000 : random() * 2_000_000
    const kind = random()
    if (kind < 0.6) {
      const x = clustered ? 180 + random() * 24 : random() * 400
      const y = clustered ? 400 + random() * 24 : random() * 800
      number = fold(number, INPUT.beat, at(clock), x, y)
    } else if (kind < 0.85) {
      number = fold(number, INPUT.key, at(clock), clustered ? 32 : 97 + random() * 26, 1)
    } else {
      number = fold(number, INPUT.stir, at(clock), random() * 400, random() * 800)
    }
  }
  clock += clustered ? 600_000 + random() * 900_000 : random() * 5_000_000
  return fold(number, INPUT.draw, at(clock))
}

describe('the draw from a shuffle', () => {
  test.each([
    ['evenly spread', false],
    ['clustered', true],
  ])('every card appears in every position about equally often with %s timings', (_name, clustered) => {
    const random = fractions(clustered ? 11 : 12)
    const shuffles = 66_000
    const counts = [0, 1, 2].map(() => new Array<number>(22).fill(0))
    for (let i = 0; i < shuffles; i++) {
      const drawn = drawCards(cards, 3, toRandom(simulate(random, clustered)))
      expect(new Set(drawn).size).toBe(3)
      drawn.forEach((number, position) => counts[position]![number]!++)
    }
    const expected = shuffles / 22
    for (const position of counts) {
      for (const count of position) {
        expect(count).toBeGreaterThan(expected * 0.9)
        expect(count).toBeLessThan(expected * 1.1)
      }
    }
  })
})
