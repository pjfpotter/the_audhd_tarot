import { useEffect, useId, useRef } from 'react'
import { useScreenHeading } from '../app/useScreenHeading'
import type { Card } from '../content/types'
import type { Spread } from './spread'
import styles from './Table.module.css'

interface TableProps {
  spread: Spread
  /** The drawn cards in position order, or null before the draw. */
  cards: readonly Card[] | null
  /** How many cards have been turned over. */
  revealed: number
  onDraw: () => void
  onOpenCard: (index: number) => void
}

/**
 * The draw, and then the three cards laid out in position order. One press
 * draws; each card is turned over by the person, in order, when they choose.
 */
export function Table({ spread, cards, revealed, onDraw, onOpenCard }: TableProps) {
  const heading = useScreenHeading<HTMLHeadingElement>()
  const next = useRef<HTMLButtonElement>(null)
  const id = useId()
  const drawn = cards !== null

  // Once there are cards, focus goes to the one to turn over next, so a
  // keyboard or switch user can carry straight on.
  useEffect(() => {
    if (drawn) next.current?.focus()
  }, [drawn, revealed])

  return (
    <div className={styles.table}>
      <div className={styles.intro}>
        <h1 ref={heading} tabIndex={-1} className={styles.heading}>
          {drawn ? 'Your cards' : 'The draw'}
        </h1>
        <p>
          {drawn
            ? 'Turn them over in order, whenever you are ready.'
            : 'One press draws all three cards. You turn each one over yourself.'}
        </p>
      </div>

      <ol className={styles.slots}>
        {spread.positions.map((position, index) => {
          const card = cards?.[index]
          const positionId = `${id}-position-${index}`
          const captionId = `${id}-caption-${index}`
          const labelledBy = `${positionId} ${captionId}`
          return (
            <li key={position} className={styles.slot}>
              <p id={positionId} className={styles.position}>
                {position}
              </p>
              {!card ? (
                <div className={styles.empty} />
              ) : index < revealed ? (
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
                  <span className={styles.back} />
                  <span id={captionId} className={styles.caption}>
                    Turn over
                  </span>
                </button>
              ) : (
                <div className={styles.card}>
                  <span className={styles.back} />
                  <span className={styles.caption}>Face down</span>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {!drawn && (
        <button type="button" className={styles.draw} onClick={onDraw}>
          Draw three cards
        </button>
      )}
    </div>
  )
}
