import { type KeyboardEvent, type MouseEvent, type PointerEvent, useEffect, useRef, useState } from 'react'
import { shuffleCopy } from '../app/copy'
import { useScreenHeading } from '../app/useScreenHeading'
import type { Random } from '../reading/draw'
import { INPUT, fold, glyphs, moment, start, toRandom } from './number'
import styles from './Shuffle.module.css'
import { StillDeck } from './StillDeck'

/** How often, at most, the count of beats is spoken to a screen reader. */
const SPOKEN_EVERY_MS = 2000

/**
 * The app's first screen, and the act before the draw. Every tap and key
 * press on the deck is folded into a hidden number, shown as a row of glyphs;
 * the draw is folded in too, and that number alone picks the cards.
 */
export function Shuffle({ onDraw }: { onDraw: (random: Random) => void }) {
  const heading = useScreenHeading<HTMLHeadingElement>()
  // Kept out of React state: a fast rhythm must roll the glyphs, not re-render the screen.
  const number = useRef(start())
  const row = useRef<HTMLParagraphElement>(null)
  const [spoken, setSpoken] = useState('')
  const speaking = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(speaking.current), [])

  function input(...values: number[]) {
    number.current = fold(number.current, ...values)
    if (row.current) {
      row.current.textContent = glyphs(number.current)
      // Each roll is marked by a short fade, which is all the movement there is.
      row.current.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' })
    }
    speaking.current ??= window.setTimeout(() => {
      speaking.current = undefined
      const beats = number.current.inputs
      setSpoken(beats === 1 ? '1 beat' : `${beats} beats`)
    }, SPOKEN_EVERY_MS)
  }

  function onPointerDown(event: PointerEvent) {
    input(INPUT.beat, moment(), event.clientX, event.clientY)
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
    // Enter and Space are beats too, and must not also arrive as a click.
    event.preventDefault()
    input(INPUT.key, moment(), event.key.charCodeAt(0), event.key.length)
  }

  // A press that reached the deck with no pointer and no key behind it comes
  // from assistive technology, such as a screen reader or voice control.
  function onClick(event: MouseEvent) {
    if (event.detail === 0) input(INPUT.beat, moment(), 0, 0)
  }

  function draw() {
    // Pressing draw is itself an input, so even one press gives a number that is the person's own.
    number.current = fold(number.current, INPUT.draw, moment())
    onDraw(toRandom(number.current))
  }

  return (
    <div className={styles.shuffle} data-mode="still">
      <h1 ref={heading} tabIndex={-1} className={styles.wordmark}>
        The AuDHD Tarot
      </h1>

      <div className={styles.stage}>
        <button
          type="button"
          className={styles.deck}
          aria-label={shuffleCopy.deck.still}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          onClick={onClick}
        >
          <StillDeck />
        </button>
      </div>

      <div className={styles.foot}>
        <p className={styles.intro}>{shuffleCopy.intro}</p>
        <p ref={row} className={styles.glyphs} aria-hidden="true">
          {glyphs(start())}
        </p>
        <p className={styles.hint}>{shuffleCopy.hint.still}</p>
        <button type="button" className={styles.draw} onClick={draw}>
          {shuffleCopy.draw}
        </button>
        <p className={styles.privacy}>{shuffleCopy.privacy}</p>
      </div>

      <p role="status" className="visually-hidden">
        {spoken}
      </p>
    </div>
  )
}
