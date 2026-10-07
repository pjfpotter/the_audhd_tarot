/** A spread names the positions of a reading, in the order they are read. */
export interface Spread {
  id: string
  positions: readonly string[]
}

export const threeCardSpread: Spread = {
  id: 'three-card',
  positions: ['Where I am', 'How I should travel', "Where I'm going next"],
}
