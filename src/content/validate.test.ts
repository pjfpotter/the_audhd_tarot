import { describe, expect, test } from 'vitest'
import { deck } from './deck'
import type { Card } from './types'
import { validateDeck } from './validate'

const withCard = (number: number, change: Partial<Card>): Card[] =>
  deck.map((card) => (card.number === number ? { ...card, ...change } : card))

describe('the deck', () => {
  test('is valid', () => {
    expect(validateDeck(deck)).toEqual([])
  })

  test('has 22 cards numbered 0 to 21', () => {
    expect(deck.map((card) => card.number)).toEqual(Array.from({ length: 22 }, (_, n) => n))
  })

  test('uses Marseille numbering', () => {
    expect(deck[8]?.name).toBe('Justice')
    expect(deck[11]?.name).toBe('Force')
  })

  test('has 68 unities, five of them on The Fool', () => {
    expect(deck.reduce((total, card) => total + card.unities.length, 0)).toBe(68)
    expect(deck[0]?.unities).toHaveLength(5)
  })
})

describe('validateDeck', () => {
  test('names a missing card', () => {
    const problems = validateDeck(deck.filter((card) => card.number !== 13))
    expect(problems).toEqual(['Card 13: missing from the deck'])
  })

  test('names a duplicate number', () => {
    const problems = validateDeck(withCard(4, { number: 3 }))
    expect(problems).toContain('Card 3 (The Emperor): duplicate number')
    expect(problems).toContain('Card 4: missing from the deck')
  })

  test('names a card with an empty question', () => {
    expect(validateDeck(withCard(9, { question: '  ' }))).toEqual([
      'Card 9 (The Hermit): question is empty',
    ])
  })

  test('names a card with too few unities', () => {
    const problems = validateDeck(withCard(17, { unities: deck[17]!.unities.slice(0, 2) }))
    expect(problems).toEqual(['Card 17 (The Star): has 2 unities, needs at least 3'])
  })

  test('names a unity with an empty field', () => {
    const [first, ...rest] = deck[6]!.unities
    const problems = validateDeck(withCard(6, { unities: [{ ...first!, shadow: '' }, ...rest] }))
    expect(problems).toEqual(['Card 6 (The Lovers): unity 1 has an empty shadow'])
  })

  test('names a card with no image or description', () => {
    expect(validateDeck(withCard(2, { image: '', imageDescription: '' }))).toEqual([
      'Card 2 (La Papesse): image is missing',
      'Card 2 (La Papesse): image description is missing',
    ])
  })

  test('rejects Rider-Waite numbering', () => {
    const swapped = deck.map((card) =>
      card.number === 8 ? { ...card, name: 'Force' } : card.number === 11 ? { ...card, name: 'Justice' } : card,
    )
    expect(validateDeck(swapped)).toEqual([
      'Card 8 (Force): must be Justice',
      'Card 11 (Justice): must be Force',
    ])
  })
})
