import styles from './DrawPending.module.css'
import { useScreenHeading } from './useScreenHeading'

/** Stands in for the draw until the reading itself is built. */
export function DrawPending() {
  const heading = useScreenHeading<HTMLHeadingElement>()
  return (
    <div className={styles.pending}>
      <h1 ref={heading} tabIndex={-1} className={styles.heading}>
        The draw
      </h1>
      <p>This part of the app is not built yet.</p>
    </div>
  )
}
