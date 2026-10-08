import type { Random } from '../reading/draw'

/**
 * The hidden number that picks the cards: two 32-bit lanes and a count of the
 * inputs folded in. Only the person's input changes it; the device adds nothing.
 */
export interface HiddenNumber {
  readonly a: number
  readonly b: number
  readonly inputs: number
}

/** The kinds of input, which lead each fold so that a tap and a key at the same moment differ. */
export const INPUT = { beat: 1, stir: 2, key: 3, sway: 4, draw: 5 } as const

const GLYPHS = '△▽◇○□☆×∴∵≡∞⊕⊗⊙◈◎'

/** The number every shuffle starts from. */
export const start = (): HiddenNumber => ({ a: 0x811c9dc5 | 0, b: 0x01000193, inputs: 0 })

/** Folds one input, given as whole numbers, into the number. */
export function fold(number: HiddenNumber, ...values: number[]): HiddenNumber {
  let { a, b } = number
  for (const value of values) {
    const v = Math.floor(value) | 0
    a = Math.imul(a ^ v, 0x01000193)
    b = Math.imul(b ^ (v >>> 7) ^ a, 0x85ebca6b)
    b ^= b >>> 13
  }
  return { a, b, inputs: number.inputs + 1 }
}

/** The number as eight symbols, to be watched and not read. */
export function glyphs(number: HiddenNumber): string {
  let row = ''
  for (let i = 0; i < 4; i++) row += GLYPHS[(number.a >>> (i * 4)) & 15]
  for (let i = 0; i < 4; i++) row += GLYPHS[(number.b >>> (i * 4)) & 15]
  return row
}

/** A source of randomness seeded by the number alone (mulberry32), for the draw. */
export function toRandom(number: HiddenNumber): Random {
  let a = number.a ^ Math.imul(number.b, 0x9e3779b1)
  return (limit) => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * limit)
  }
}

/** The present moment in millionths of a second, as finely as the browser reports it. */
export const moment = () => performance.now() * 1000
