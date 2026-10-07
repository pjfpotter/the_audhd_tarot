import { expect, test } from 'vitest'
import snapshot from '../../content/v1-snapshot.json'
import { cards } from './cards'

// The author's wording is carried over from the v1 prototype unchanged. When
// the wording is deliberately edited in cards.ts, update the snapshot to match.
test('card text is word for word the v1 prototype text', () => {
  const v1 = snapshot.cards.map((card) => ({
    number: card.n,
    name: card.name,
    aliases: card.aliases,
    essence: card.essence,
    question: card.question,
    unities: card.unities.map((unity) => ({
      anchor: unity.anchor,
      gift: unity.superpower,
      shadow: unity.trap,
    })),
  }))
  expect(cards).toEqual(v1)
})
