import type { Card } from './types'

const DECK_SIZE = 22
const MIN_UNITIES = 3

const isBlank = (text: unknown) => typeof text !== 'string' || text.trim() === ''

/**
 * Checks a deck against the card-content spec. Returns one message per
 * problem, each naming the card it concerns; an empty array means valid.
 */
export function validateDeck(deck: readonly Card[]): string[] {
  const problems: string[] = []

  const seen = new Set<number>()
  for (const card of deck) {
    const label = `Card ${card.number} (${card.name || 'unnamed'})`

    if (!Number.isInteger(card.number) || card.number < 0 || card.number >= DECK_SIZE) {
      problems.push(`${label}: number is outside 0–${DECK_SIZE - 1}`)
    }
    if (seen.has(card.number)) problems.push(`${label}: duplicate number`)
    seen.add(card.number)

    if (isBlank(card.name)) problems.push(`${label}: name is empty`)
    if (isBlank(card.essence)) problems.push(`${label}: essence is empty`)
    if (isBlank(card.question)) problems.push(`${label}: question is empty`)
    if (card.aliases.some(isBlank)) problems.push(`${label}: has an empty alias`)
    if (isBlank(card.image)) problems.push(`${label}: image is missing`)
    if (isBlank(card.imageDescription)) problems.push(`${label}: image description is missing`)

    if (card.unities.length < MIN_UNITIES) {
      problems.push(`${label}: has ${card.unities.length} unities, needs at least ${MIN_UNITIES}`)
    }
    card.unities.forEach((unity, i) => {
      for (const field of ['anchor', 'gift', 'shadow'] as const) {
        if (isBlank(unity[field])) problems.push(`${label}: unity ${i + 1} has an empty ${field}`)
      }
    })
  }

  for (let n = 0; n < DECK_SIZE; n++) {
    if (!seen.has(n)) problems.push(`Card ${n}: missing from the deck`)
  }

  // Marseille order, not Rider-Waite: Justice is 8 and Force is 11.
  const named = (n: number) => deck.find((card) => card.number === n)?.name
  if (seen.has(8) && named(8) !== 'Justice') problems.push(`Card 8 (${named(8)}): must be Justice`)
  if (seen.has(11) && named(11) !== 'Force') problems.push(`Card 11 (${named(11)}): must be Force`)

  return problems
}
