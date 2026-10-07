import type { Card, Unity } from '../content/types'
import styles from './CardBody.module.css'

interface CardBodyProps {
  card: Card
  unities: readonly Unity[]
  /** Heading level for each unity's anchor, to fit the screen it is shown on. */
  anchorLevel: 2 | 4
}

/** A card's authored reading text: its essence, its question and the unities chosen for this reading. */
export function CardBody({ card, unities, anchorLevel }: CardBodyProps) {
  const Anchor = `h${anchorLevel}` as const
  return (
    <div className={styles.body}>
      <p className={styles.essence}>{card.essence}</p>
      <p className={styles.question}>{card.question}</p>
      <ul className={styles.unities}>
        {unities.map((unity) => (
          <li key={unity.anchor} className={styles.unity}>
            <Anchor className={styles.anchor}>{unity.anchor}</Anchor>
            {/* Gift and shadow always appear together, each named in words. */}
            <p>
              <strong className={styles.label}>Gift</strong> {unity.gift}
            </p>
            <p>
              <strong className={styles.label}>Shadow</strong> {unity.shadow}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
