import type { ReactNode } from 'react'
import styles from './Frame.module.css'

interface FrameProps {
  /** The landing screen carries the name itself, so the bar leaves it out. */
  showName: boolean
  onOpenOptions: () => void
  /** Present while there is a reading to leave; shows the control for it. */
  onStartAgain?: () => void
  /** Hold the screen to the height of the viewport, for the full-screen art moment. */
  fill?: boolean
  children: ReactNode
}

/** The page frame every screen sits in: a top bar and the screen below it. */
export function Frame({ showName, onOpenOptions, onStartAgain, fill = false, children }: FrameProps) {
  return (
    <div className={styles.frame} data-fill={fill || undefined}>
      <header className={styles.bar}>
        {showName && <p className={styles.name}>The AuDHD Tarot</p>}
        <div className={styles.controls}>
          {onStartAgain && (
            <button type="button" className={styles.control} onClick={onStartAgain}>
              Start again
            </button>
          )}
          <button type="button" className={styles.control} aria-haspopup="dialog" onClick={onOpenOptions}>
            Options
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
