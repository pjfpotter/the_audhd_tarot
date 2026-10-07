import { landingCopy } from './copy'
import styles from './Landing.module.css'
import { useScreenHeading } from './useScreenHeading'

export function Landing({ onEnter }: { onEnter: () => void }) {
  const heading = useScreenHeading<HTMLHeadingElement>()
  return (
    <div className={styles.landing}>
      <h1 ref={heading} tabIndex={-1} className={styles.wordmark}>
        The AuDHD Tarot
      </h1>
      <div className={styles.entry}>
        <p className={styles.intro}>{landingCopy.intro}</p>
        <button type="button" className={styles.enter} onClick={onEnter}>
          {landingCopy.enter}
        </button>
        <p className={styles.privacy}>{landingCopy.privacy}</p>
      </div>
    </div>
  )
}
