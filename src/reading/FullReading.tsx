import { useEffect, useRef } from 'react'
import { useScreenHeading } from '../app/useScreenHeading'
import type { Card, Unity } from '../content/types'
import { CardBody } from './CardBody'
import { CardTitle } from './CardTitle'
import styles from './FullReading.module.css'
import type { Spread } from './spread'

interface FullReadingProps {
  spread: Spread
  cards: readonly { card: Card; unities: readonly Unity[] }[]
  /** Index of the card whose image is shown large, if any. */
  art: number | null
  onOpenArt: (index: number) => void
  onCloseArt: () => void
  onStartAgain: () => void
}

/** All three cards together, in position order, with a way back to each image. */
export function FullReading({ spread, cards, art, onOpenArt, onCloseArt, onStartAgain }: FullReadingProps) {
  const heading = useScreenHeading<HTMLHeadingElement>()
  const dialog = useRef<HTMLDialogElement>(null)
  const shown = art === null ? null : cards[art]

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (shown && !el.open) el.showModal()
    if (!shown && el.open) el.close()
  }, [shown])

  return (
    <div className={styles.reading}>
      <h1 ref={heading} tabIndex={-1} className={styles.heading}>
        Your reading
      </h1>

      <ol className={styles.cards}>
        {cards.map(({ card, unities }, index) => (
          <li key={card.number} className={styles.card}>
            <button type="button" className={styles.imageButton} onClick={() => onOpenArt(index)}>
              <img className={styles.image} src={card.image} alt="" width={720} height={1354} />
              <span className={styles.imageLabel}>
                View <span className="visually-hidden">{card.name} </span>full size
              </span>
            </button>
            <CardTitle card={card} position={spread.positions[index]!} level={2} />
            <CardBody card={card} unities={unities} anchorLevel={4} />
          </li>
        ))}
      </ol>

      <button type="button" className={styles.again} onClick={onStartAgain}>
        Start a new reading
      </button>

      {/* A native modal: Escape closes it and focus returns to the image. */}
      <dialog ref={dialog} className={styles.art} aria-label={shown?.card.name} onClose={onCloseArt}>
        {shown && (
          <>
            <img
              className={styles.artImage}
              src={shown.card.image}
              alt={shown.card.imageDescription}
              width={720}
              height={1354}
            />
            <button type="button" className={styles.close} autoFocus onClick={() => dialog.current?.close()}>
              Close
            </button>
          </>
        )}
      </dialog>
    </div>
  )
}
