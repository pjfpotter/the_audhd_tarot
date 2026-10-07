import type { Ref } from 'react'
import { numeral } from '../content/numeral'
import type { Card } from '../content/types'
import styles from './CardTitle.module.css'

interface CardTitleProps {
  card: Card
  position: string
  level: 1 | 2
  ref?: Ref<HTMLHeadingElement>
  /** Id of the element describing the card image, read out with the title. */
  describedBy?: string
}

/** A card's heading: the position it was drawn in, then its number and name. */
export function CardTitle({ card, position, level, ref, describedBy }: CardTitleProps) {
  const Heading = `h${level}` as const
  return (
    <div className={styles.title}>
      <Heading ref={ref} tabIndex={ref ? -1 : undefined} aria-describedby={describedBy} className={styles.heading}>
        <span className={styles.position}>{position}</span>
        <span className={styles.name}>
          <span className={styles.numeral}>{numeral(card.number)}</span> {card.name}
        </span>
      </Heading>
      {card.aliases.length > 0 && <p className={styles.aliases}>{card.aliases.join(', ')}</p>}
    </div>
  )
}
