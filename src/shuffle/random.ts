import type { Random } from '../reading/draw'

/** A fraction from 0 up to, but not including, 1, from the device's own source of randomness. */
export function deviceFraction(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]! / 4294967296
}

/** Returns a whole number from 0 up to, but not including, `limit`, from the device's own randomness. */
export const deviceRandom: Random = (limit) => Math.floor(deviceFraction() * limit)

/** The items in a random order (Fisher–Yates), leaving the original alone. */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = random(i + 1)
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}
