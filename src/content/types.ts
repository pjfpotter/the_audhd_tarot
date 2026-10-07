/** A detail of the card image, with the gift and the shadow it holds together. */
export interface Unity {
  anchor: string
  gift: string
  shadow: string
}

/** The authored text of one card. */
export interface CardText {
  /** 0–21, Marseille order: 8 is Justice, 11 is Force. */
  number: number
  name: string
  aliases: readonly string[]
  essence: string
  question: string
  unities: readonly Unity[]
}

export interface Card extends CardText {
  /** URL of the card's image, derived from its number alone. */
  image: string
  /** Plain-language description of what the image shows. */
  imageDescription: string
}
