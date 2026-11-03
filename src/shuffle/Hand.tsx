import type { Ref } from 'react'
import { cardBack } from '../content/deck'
import styles from './Hand.module.css'

interface HandProps {
  /** What each place of the hand is for, in the order they are read. */
  positions: readonly string[]
  /** The card in each place, or null where there is none. */
  hand: readonly (number | null)[]
  /** True where the page draws the cards in the hand itself; the cloud draws them otherwise. */
  drawn: boolean
  /** Which place a carried card would go into if it were let go now. */
  over: number | null
  /** Whether the cards are being mixed or chosen. */
  phase: 'mix' | 'choose'
  onPutBack: (slot: number) => void
  listRef: Ref<HTMLOListElement>
}

/**
 * The three places the chosen cards go, in the order they are read. A card
 * in a place can be tapped to put it back.
 */
export function Hand({ positions, hand, drawn, over, phase, onPutBack, listRef }: HandProps) {
  return (
    <ol ref={listRef} className={styles.hand} data-phase={phase} aria-label="Your cards">
      {positions.map((position, slot) => {
        const card = hand[slot] ?? null
        return (
          <li key={position} className={styles.place}>
            <div
              className={styles.slot}
              data-slot={slot}
              data-card={card ?? undefined}
              data-over={over === slot || undefined}
            >
              {card !== null && (
                <button
                  type="button"
                  className={styles.filled}
                  aria-label={`${position}: a card is here. Put it back.`}
                  onClick={() => onPutBack(slot)}
                >
                  {drawn && <img src={cardBack} alt="" width={720} height={1354} />}
                </button>
              )}
            </div>
            <p className={styles.position}>
              {position}
              {card === null && <span className="visually-hidden">, empty</span>}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
