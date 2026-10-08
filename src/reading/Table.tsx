import { useEffect, useId, useRef } from 'react'
import { useScreenHeading } from '../app/useScreenHeading'
import { cardBack } from '../content/deck'
import type { Card } from '../content/types'
import type { Spread } from './spread'
import styles from './Table.module.css'

interface TableProps {
  spread: Spread
  /** The drawn cards in position order. */
  cards: readonly Card[]
  /** How many cards have been turned over. */
  revealed: number
  onOpenCard: (index: number) => void
}

const back = <img className={styles.back} src={cardBack} alt="" width={720} height={1354} />

/**
 * The three drawn cards laid out in position order. Each is turned over by
 * the person, in order, when they choose.
 */
export function Table({ spread, cards, revealed, onOpenCard }: TableProps) {
  const heading = useScreenHeading<HTMLHeadingElement>()
  const next = useRef<HTMLButtonElement>(null)
  const id = useId()

  // Focus goes to the card to turn over next, so a keyboard or switch user
  // can carry straight on.
  useEffect(() => {
    next.current?.focus()
  }, [revealed])

  return (
    <div className={styles.table}>
      <div className={styles.intro}>
        <h1 ref={heading} tabIndex={-1} className={styles.heading}>
          Your cards
        </h1>
        <p>Turn them over in order, whenever you are ready.</p>
      </div>

      <ol className={styles.slots}>
        {spread.positions.map((position, index) => {
          const card = cards[index]!
          const positionId = `${id}-position-${index}`
          const captionId = `${id}-caption-${index}`
          const labelledBy = `${positionId} ${captionId}`
          return (
            <li key={position} className={styles.slot}>
              <p id={positionId} className={styles.position}>
                {position}
              </p>
              {index < revealed ? (
                <button
                  type="button"
                  className={styles.card}
                  aria-labelledby={labelledBy}
                  onClick={() => onOpenCard(index)}
                >
                  <img className={styles.image} src={card.image} alt="" width={720} height={1354} />
                  <span id={captionId} className={styles.caption}>
                    {card.name}
                    <span className="visually-hidden">. Read again</span>
                  </span>
                </button>
              ) : index === revealed ? (
                <button
                  type="button"
                  className={styles.card}
                  aria-labelledby={labelledBy}
                  ref={next}
                  onClick={() => onOpenCard(index)}
                >
                  {back}
                  <span id={captionId} className={styles.caption}>
                    Turn over
                  </span>
                </button>
              ) : (
                <div className={styles.card}>
                  {back}
                  <span className={styles.caption}>Face down</span>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
