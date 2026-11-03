import type { CardText, Unity } from '../content/types'
import type { Reading } from './state'

/** Returns a whole number from 0 up to, but not including, `limit`, each equally likely. */
export type Random = (limit: number) => number

/** Picks `count` different items in random order. */
function pick<T>(items: readonly T[], count: number, random: Random): T[] {
  const pool = [...items]
  const picked: T[] = []
  while (picked.length < count && pool.length > 0) {
    picked.push(...pool.splice(random(pool.length), 1))
  }
  return picked
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

/**
 * Makes a reading from the cards a person chose, one for each position of the
 * spread, in that order. The cards are the person's own choice; only the
 * unities shown for each are picked at random.
 */
export function readingFrom(deck: readonly CardText[], numbers: readonly number[], random: Random): Reading {
  return numbers.map((number, positionIndex) => {
    const card = deck.find((candidate) => candidate.number === number)
    if (!card) throw new Error(`There is no card ${number}`)
    return { number, unities: selectUnities(card, positionIndex, numbers, random) }
  })
}
