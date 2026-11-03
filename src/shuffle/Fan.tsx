import { cardBack } from '../content/deck'
import styles from './Fan.module.css'

interface FanProps {
  /** The card numbers in the order they are laid out. Which card is where is hidden: they are all face down. */
  order: readonly number[]
  /** The card in each place of the hand, or null where there is none. */
  hand: readonly (number | null)[]
  onTake: (number: number) => void
}

/**
 * The deck laid out face down, for choosing from where the cloud is not
 * shown. Every card keeps its place and its identity; a chosen one leaves a
 * gap so that nothing shifts under a finger.
 */
export function Fan({ order, hand, onTake }: FanProps) {
  return (
    <ul className={styles.fan} aria-label="The deck, face down">
      {order.map((number, index) => {
        const taken = hand.includes(number)
        return (
          <li key={number}>
            <button
              type="button"
              className={styles.card}
              aria-disabled={taken || undefined}
              aria-label={`Card ${index + 1} of ${order.length}${taken ? ', chosen' : ''}`}
              data-taken={taken || undefined}
              onClick={() => {
                if (!taken) onTake(number)
              }}
            >
              {!taken && <img src={cardBack} alt="" width={720} height={1354} />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
