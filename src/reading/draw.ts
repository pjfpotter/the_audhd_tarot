import type { CardText, Unity } from '../content/types'
import type { Spread } from './spread'
import type { Reading } from './state'

/** Returns a whole number from 0 up to, but not including, `limit`, each equally likely. */
export type Random = (limit: number) => number

/**
 * Randomness from the person's own device. Values that would favour the low
 * numbers are thrown away and drawn again, so every outcome is equally likely.
 */
export const deviceRandom: Random = (limit) => {
  const range = 0x1_0000_0000
  const ceiling = range - (range % limit)
  const value = new Uint32Array(1)
  do {
    crypto.getRandomValues(value)
  } while (value[0]! >= ceiling)
  return value[0]! % limit
}

/** Picks `count` different items in random order. */
function pick<T>(items: readonly T[], count: number, random: Random): T[] {
  const pool = [...items]
  const picked: T[] = []
  while (picked.length < count && pool.length > 0) {
    picked.push(...pool.splice(random(pool.length), 1))
  }
  return picked
}

/** Draws `count` different cards from the deck and returns their numbers in the order drawn. */
export function drawCards(deck: readonly CardText[], count: number, random: Random): number[] {
  return pick(deck, count, random).map((card) => card.number)
}

/**
 * Chooses which of a card's unities a reading shows: two or three, at random.
 * The position and the other cards are not used yet; they are here so that
 * position-aware selection can replace this without touching its callers.
 */
export function selectUnities(
  card: CardText,
  _positionIndex: number,
  _cardNumbers: readonly number[],
  random: Random,
): Unity[] {
  const count = Math.min(card.unities.length, 2 + random(2))
  return pick(card.unities, count, random)
}

/** Draws a whole reading: one card for each position, with its unities chosen once. */
export function drawReading(deck: readonly CardText[], spread: Spread, random: Random): Reading {
  const numbers = drawCards(deck, spread.positions.length, random)
  return numbers.map((number, positionIndex) => ({
    number,
    unities: selectUnities(deck.find((card) => card.number === number)!, positionIndex, numbers, random),
  }))
}
