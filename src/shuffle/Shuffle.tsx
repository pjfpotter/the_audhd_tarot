import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from 'react'
import { shuffleCopy } from '../app/copy'
import { useDocumentSetting } from '../preferences/useDocumentSetting'
import { preferences, usePreferences } from '../preferences/usePreferences'
import type { Random } from '../reading/draw'
import type { Cloud as CloudScene } from './cloud/scene'
import { DRAW_SETTLE_MS } from './cloud/settings'
import { INPUT, fold, glyphs, moment, start, toRandom } from './number'
import styles from './Shuffle.module.css'
import { StillDeck } from './StillDeck'
import { type OrientationPermission, createSway, createTilt } from './tilt'

// The three-dimensional scene is fetched apart from the rest of the app, and
// only when it is going to be shown.
const Cloud = lazy(() => import('./cloud/Cloud'))

/** How often, at most, the count of beats is spoken to a screen reader. */
const SPOKEN_EVERY_MS = 2000

/** How long to wait for the phone's first reading before taking it that there is no sensor. */
const TILT_SILENCE_MS = 1500

const ARROWS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
}

// A device that could not draw the cloud is not asked again during the visit.
let cloudFailed = false

/**
 * The app's first screen, and the act before the draw. Every tap, key press
 * and stir on the deck is folded into a hidden number, shown as a row of
 * glyphs; the draw is folded in too, and that number alone picks the cards.
 *
 * The deck is a cloud of cards where the device can show one and motion is
 * wanted, and a still deck otherwise. Both shuffle the same number.
 */
export function Shuffle({ onDraw }: { onDraw: (random: Random) => void }) {
  // Kept out of React state: a fast stir must roll the glyphs, not re-render the screen.
  const number = useRef(start())
  const row = useRef<HTMLParagraphElement>(null)
  const roll = useRef<Animation | null>(null)
  const [spoken, setSpoken] = useState('')
  const speaking = useRef<number | undefined>(undefined)

  const stage = useRef<HTMLDivElement>(null)
  const scene = useRef<CloudScene | null>(null)
  const stirring = useRef<{ x: number; y: number } | null>(null)
  const settling = useRef<number | undefined>(undefined)

  const reducedMotion = useDocumentSetting('motion') === 'reduced'
  const { shuffleStill } = usePreferences()
  const [failed, setFailed] = useState(cloudFailed)
  const [ready, setReady] = useState(false)
  const cloudPossible = !reducedMotion && !failed
  const cloudWanted = cloudPossible && !shuffleStill
  // The still deck stands in until the cloud has loaded and drawn its first frame.
  const mode = cloudWanted && ready ? 'cloud' : 'still'

  // Phone movement: offered over the cloud, followed only once accepted, and never remembered.
  const [tilt] = useState(() =>
    createTilt(
      window,
      // Absent in some browsers; on an iPhone it carries the function that asks the person.
      globalThis.DeviceOrientationEvent as OrientationPermission | undefined,
      navigator.maxTouchPoints > 0,
    ),
  )
  const [following, setFollowing] = useState<'off' | 'on' | 'withdrawn'>('off')
  const listening = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      window.clearTimeout(speaking.current)
      window.clearTimeout(settling.current)
    },
    [],
  )

  // The phone is followed only while the cloud is there to move.
  useEffect(() => {
    if (mode !== 'cloud') return
    return () => {
      window.clearTimeout(listening.current)
      tilt.stop()
      setFollowing((now) => (now === 'on' ? 'off' : now))
    }
  }, [mode, tilt])

  function input(...values: number[]) {
    number.current = fold(number.current, ...values)
    if (row.current) {
      row.current.textContent = glyphs(number.current)
      // Each roll is marked by a short fade, which is all the still deck moves.
      roll.current?.cancel()
      roll.current = row.current.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' })
    }
    speaking.current ??= window.setTimeout(() => {
      speaking.current = undefined
      const beats = number.current.inputs
      setSpoken(beats === 1 ? '1 beat' : `${beats} beats`)
    }, SPOKEN_EVERY_MS)
  }

  const drawing = () => settling.current !== undefined

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (drawing()) return
    input(INPUT.beat, moment(), event.clientX, event.clientY)
    if (!scene.current) return
    scene.current.pulse(event.clientX, event.clientY)
    // Held, the pointer stirs, and goes on stirring if it leaves the deck.
    event.currentTarget.setPointerCapture(event.pointerId)
    stirring.current = { x: event.clientX, y: event.clientY }
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType === 'mouse') {
      scene.current?.hover((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    }
    const from = stirring.current
    if (!from || !scene.current || drawing()) return
    input(INPUT.stir, moment(), event.clientX, event.clientY)
    scene.current.stir(event.clientX, event.clientY, event.clientX - from.x, event.clientY - from.y)
    stirring.current = { x: event.clientX, y: event.clientY }
  }

  function onPointerEnd() {
    stirring.current = null
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' || event.metaKey || event.ctrlKey || event.altKey || drawing()) return
    // Enter and Space are beats too, and must not also arrive as a click.
    event.preventDefault()
    // In the cloud an arrow key stirs, and goes on stirring while it is held.
    const arrow = scene.current ? ARROWS[event.key] : undefined
    if (event.repeat && !arrow) return
    input(INPUT.key, moment(), event.key.charCodeAt(0), event.key.length)
    if (!scene.current) return
    if (arrow) {
      scene.current.nudge(...arrow)
    } else {
      const { x, y } = scene.current.centre()
      scene.current.pulse(x, y)
    }
  }

  // A press that reached the deck with no pointer and no key behind it comes
  // from assistive technology, such as a screen reader or voice control.
  function onClick(event: MouseEvent) {
    if (event.detail !== 0 || drawing()) return
    input(INPUT.beat, moment(), 0, 0)
    if (!scene.current) return
    const { x, y } = scene.current.centre()
    scene.current.pulse(x, y)
  }

  function draw() {
    if (drawing()) return
    // Pressing draw is itself an input, so even one press gives a number that is the person's own.
    input(INPUT.draw, moment())
    const random = toRandom(number.current)
    if (!scene.current) {
      onDraw(random)
      return
    }
    // Three cards come forward out of the cloud before the table takes over.
    scene.current.draw()
    settling.current = window.setTimeout(() => onDraw(random), DRAW_SETTLE_MS)
  }

  async function follow() {
    const sway = createSway()
    let heard = false
    const granted = await tilt.start((reading) => {
      heard = true
      scene.current?.setTilt(reading)
      // A deliberate sway is input too; sensor jitter is not.
      if (!drawing() && sway(reading, performance.now())) {
        input(INPUT.sway, moment(), reading.x * 1000, reading.y * 1000)
      }
    })
    // Declined, or not allowed here: the invitation goes, and everything else carries on.
    if (!granted) {
      setFollowing('withdrawn')
      return
    }
    setFollowing('on')
    listening.current = window.setTimeout(() => {
      if (heard) return
      tilt.stop()
      setFollowing('withdrawn')
    }, TILT_SILENCE_MS)
  }

  function unfollow() {
    window.clearTimeout(listening.current)
    tilt.stop()
    scene.current?.setTilt(null)
    setFollowing('off')
  }

  function onCloudFail() {
    cloudFailed = true
    setFailed(true)
  }

  return (
    <div className={styles.shuffle} data-mode={mode}>
      {cloudPossible && (
        <div className={styles.extras}>
          {mode === 'cloud' && tilt.available && following !== 'withdrawn' && (
            <button type="button" className={styles.extra} onClick={following === 'on' ? unfollow : follow}>
              {following === 'on' ? shuffleCopy.unfollow : shuffleCopy.follow}
            </button>
          )}
          <button
            type="button"
            className={styles.extra}
            onClick={() => preferences.set({ shuffleStill: !shuffleStill })}
          >
            {shuffleStill ? shuffleCopy.move : shuffleCopy.hold}
          </button>
        </div>
      )}

      <div ref={stage} className={styles.stage}>
        <button
          type="button"
          className={styles.deck}
          aria-label={shuffleCopy.deck[mode]}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onKeyDown={onKeyDown}
          onClick={onClick}
        >
          {mode === 'still' && <StillDeck />}
          {cloudWanted && (
            <Suspense fallback={null}>
              <Cloud stageRef={stage} sceneRef={scene} onReadyChange={setReady} onFail={onCloudFail} />
            </Suspense>
          )}
        </button>
      </div>

      <div className={styles.foot}>
        <p className={styles.intro}>{shuffleCopy.intro}</p>
        <p ref={row} className={styles.glyphs} aria-hidden="true">
          {glyphs(start())}
        </p>
        <p className={styles.hint}>{shuffleCopy.hint[mode]}</p>
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
