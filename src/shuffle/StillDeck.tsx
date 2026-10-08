import { cardBack } from '../content/deck'
import styles from './StillDeck.module.css'

/** The deck at rest: a loose stack of card backs, with nothing moving. */
export function StillDeck() {
  return (
    <span className={styles.deck}>
      <img src={cardBack} alt="" width={720} height={1354} />
      <img src={cardBack} alt="" width={720} height={1354} />
      <img src={cardBack} alt="" width={720} height={1354} />
    </span>
  )
}
