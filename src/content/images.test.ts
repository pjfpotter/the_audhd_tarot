import { existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { cardBack, deck } from './deck'

const publicDir = fileURLToPath(new URL('../../public/', import.meta.url))

function expectImageFile(image: string) {
  const file = publicDir + image.replace(/^\//, '')
  expect(existsSync(file), `${file} is missing`).toBe(true)
  expect(statSync(file).size).toBeGreaterThan(0)
}

test.each(deck.map((card) => [card.number, card.name, card.image] as const))(
  'card %i (%s) has an image file',
  (_number, _name, image) => expectImageFile(image),
)

test('the card back has an image file', () => expectImageFile(cardBack))
