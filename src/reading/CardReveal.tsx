import { useEffect, useId, useRef } from 'react'
import type { Card, Unity } from '../content/types'
import { CardBody } from './CardBody'
import styles from './CardReveal.module.css'
import { CardTitle } from './CardTitle'

/** How long the art is held before the text emerges on its own. */
export const ART_BEAT_MS = 1800

interface CardRevealProps {
  card: Card
  position: string
  unities: readonly Unity[]
  phase: 'art' | 'text'
  /** Label for the control that leaves the card. */
  closeLabel: string
  onShowText: () => void
  onClose: () => void
}

/**
 * One card, opened. Its art fills the screen for a beat, then its text
 * emerges; "Continue" skips the wait. The heading keeps focus through the
 * change, so a screen reader hears the position, number, name and image
 * description once and can read on without waiting.
 */
export function CardReveal({ card, position, unities, phase, closeLabel, onShowText, onClose }: CardRevealProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  const imageId = useId()

  useEffect(() => {
    heading.current?.focus()
  }, [])

  useEffect(() => {
    if (phase !== 'art') return
    const beat = window.setTimeout(onShowText, ART_BEAT_MS)
    return () => window.clearTimeout(beat)
  }, [phase, onShowText])

  // "Continue" disappears with the art moment; if it had focus, pass it on.
  useEffect(() => {
    if (phase === 'text' && document.activeElement === document.body) heading.current?.focus()
  }, [phase])

  return (
    <article className={styles.reveal} data-phase={phase}>
      <div className={styles.figure}>
        <img
          id={imageId}
          className={styles.image}
          src={card.image}
          alt={card.imageDescription}
          width={720}
          height={1354}
          decoding="sync"
        />
      </div>
      <div className={styles.text}>
        <CardTitle card={card} position={position} level={1} ref={heading} describedBy={imageId} />
        {phase === 'art' ? (
          <button type="button" className={styles.action} onClick={onShowText}>
            Continue
          </button>
        ) : (
          <div className={styles.body}>
            <CardBody card={card} unities={unities} anchorLevel={2} />
            <button type="button" className={styles.action} onClick={onClose}>
              {closeLabel}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
