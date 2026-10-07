import type { ReactNode } from 'react'
import styles from './Frame.module.css'

interface FrameProps {
  /** The landing screen carries the name itself, so the bar leaves it out. */
  showName: boolean
  onOpenOptions: () => void
  children: ReactNode
}

/** The page frame every screen sits in: a top bar and the screen below it. */
export function Frame({ showName, onOpenOptions, children }: FrameProps) {
  return (
    <div className={styles.frame}>
      <header className={styles.bar}>
        {showName && <p className={styles.name}>The AuDHD Tarot</p>}
        <button type="button" className={styles.options} aria-haspopup="dialog" onClick={onOpenOptions}>
          Options
        </button>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
