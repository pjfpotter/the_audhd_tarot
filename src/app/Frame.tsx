import type { ReactNode } from 'react'
import styles from './Frame.module.css'
import { useScreenHeading } from './useScreenHeading'

interface FrameProps {
  /** On the first screen the name in the bar is the screen's heading. */
  nameIsHeading: boolean
  onOpenOptions: () => void
  /** Present while there is a reading to leave; shows the control for it. */
  onStartAgain?: () => void
  /** Hold the screen to the height of the viewport, for the full-screen art moment. */
  fill?: boolean
  /** Let the screen run to the edges of the page, for the shuffle's cloud. */
  bleed?: boolean
  children: ReactNode
}

function Wordmark() {
  const heading = useScreenHeading<HTMLHeadingElement>()
  return (
    <h1 ref={heading} tabIndex={-1} className={styles.wordmark}>
      The AuDHD Tarot
    </h1>
  )
}

/** The page frame every screen sits in: a top bar and the screen below it. */
export function Frame({ nameIsHeading, onOpenOptions, onStartAgain, fill = false, bleed = false, children }: FrameProps) {
  return (
    <div className={styles.frame} data-fill={fill || undefined} data-bleed={bleed || undefined}>
      <header className={styles.bar}>
        {nameIsHeading ? <Wordmark /> : <p className={styles.name}>The AuDHD Tarot</p>}
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
