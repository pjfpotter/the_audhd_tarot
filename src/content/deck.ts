import { cards } from './cards'
import { imageDescriptions } from './imageDescriptions'
import type { Card } from './types'

/**
 * A card's image is addressed by its number alone, so replacing the files in
 * public/cards/ changes the art with no other change to the app.
 */
export function cardImage(number: number): string {
  return `${import.meta.env.BASE_URL}cards/${String(number).padStart(2, '0')}.webp`
}

/** The one image every face-down card shows. */
export const cardBack = `${import.meta.env.BASE_URL}cards/back.webp`

export const deck: readonly Card[] = cards.map((card) => ({
  ...card,
  image: cardImage(card.number),
  imageDescription: imageDescriptions[card.number] ?? '',
}))
