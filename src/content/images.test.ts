import { existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { deck } from './deck'

const publicDir = fileURLToPath(new URL('../../public/', import.meta.url))

test.each(deck.map((card) => [card.number, card.name, card.image] as const))(
  'card %i (%s) has an image file',
  (_number, _name, image) => {
    const file = publicDir + image.replace(/^\//, '')
    expect(existsSync(file), `${file} is missing`).toBe(true)
    expect(statSync(file).size).toBeGreaterThan(0)
  },
)
