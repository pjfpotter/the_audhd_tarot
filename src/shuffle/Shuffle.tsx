import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { shuffleCopy } from '../app/copy'
import { deck } from '../content/deck'
import { useDocumentSetting } from '../preferences/useDocumentSetting'
import { preferences, usePreferences } from '../preferences/usePreferences'
import type { Cloud as CloudScene, Slot } from './cloud/scene'
import { Fan } from './Fan'
import { Hand } from './Hand'
import { deviceFraction, deviceRandom, shuffled } from './random'
import styles from './Shuffle.module.css'
import { StillDeck } from './StillDeck'

// The three-dimensional scene is fetched apart from the rest of the app, and
// only when it is going to be shown.
const Cloud = lazy(() => import('./cloud/Cloud'))

const ARROWS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
}

const NUMBERS = deck.map((card) => card.number)

// A device that could not draw the cloud is not asked again during the visit.
let cloudFailed = false

type Hand = (number | null)[]

/**
 * The app's first screen, in the two parts a reader gives a shuffle. First the
 * deck is mixed: a cloud of 22 face-down cards that move under a finger, or a
 * deck to tap where there is no cloud. Then the person chooses: the three
 * cards they take hold of, and put in the three spaces, are the three they are
 * given. Every card is one particular card from the start; nothing here is
 * decided after the choice.
 */
export function Shuffle({
  positions,
  onDraw,
}: {
  /** What each of the three spaces is for. */
  positions: readonly string[]
  /** The cards chosen, in the order of the spaces. */
  onDraw: (numbers: number[]) => void
}) {
  // Where each card starts in the cloud, and the order of the face-down cards where there is no cloud.
  const [cloudOrder] = useState(() => shuffled(NUMBERS, deviceRandom))
  const [fanOrder, setFanOrder] = useState(() => shuffled(NUMBERS, deviceRandom))

  const [phase, setPhase] = useState<'mix' | 'choose'>('mix')
  const [hand, setHand] = useState<Hand>(() => positions.map(() => null))
  const [over, setOver] = useState<number | null>(null)
  const [status, setStatus] = useState('')

  const stage = useRef<HTMLDivElement>(null)
  const deckButton = useRef<HTMLButtonElement>(null)
  const layButton = useRef<HTMLButtonElement>(null)
  const handList = useRef<HTMLOListElement>(null)
  const scene = useRef<CloudScene | null>(null)
  const stirring = useRef<{ x: number; y: number } | null>(null)
  /** The card being carried, if a finger has hold of one. */
  const carried = useRef<number | null>(null)
  const roll = useRef<Animation | null>(null)

  const reducedMotion = useDocumentSetting('motion') === 'reduced'
  const { shuffleStill } = usePreferences()
  const [failed, setFailed] = useState(cloudFailed)
  const [ready, setReady] = useState(false)
  const cloudPossible = !reducedMotion && !failed
  const cloudWanted = cloudPossible && !shuffleStill
  // The still deck stands in until the cloud has loaded and drawn its first frame.
  const mode = cloudWanted && ready ? 'cloud' : 'still'
  const full = hand.every((card) => card !== null)
  // Where the cards are laid out for choosing from, the hand goes above them, so it stays in view.
  const handFirst = mode === 'still' && phase === 'choose'

  const slots = useCallback(
    (): Slot[] =>
      [...(handList.current?.querySelectorAll('[data-slot]') ?? [])].map((slot) => slot.getBoundingClientRect()),
    [],
  )

  // The cloud shows the hand once it is there to show it, and again wherever the hand has moved to.
  useEffect(() => {
    scene.current?.setHand(hand)
  }, [hand, mode, handFirst, phase])

  // When the shuffle moves on, so does the keyboard.
  const lastPhase = useRef(phase)
  useEffect(() => {
    if (lastPhase.current === phase) return
    lastPhase.current = phase
    stage.current?.querySelector<HTMLElement>('button:not([aria-disabled="true"])')?.focus()
  }, [phase])

  // The third card chosen takes the keyboard to the way forward, rather than leaving it among the cards.
  const wasFull = useRef(false)
  useEffect(() => {
    if (full && !wasFull.current) layButton.current?.focus({ preventScroll: true })
    wasFull.current = full
  }, [full])

  function commit(next: Hand, message: string) {
    setHand(next)
    scene.current?.setHand(next)
    setStatus(message)
  }

  const left = (next: Hand) => next.filter((card) => card === null).length
  const progress = (next: Hand) => (left(next) === 0 ? shuffleCopy.status.all : shuffleCopy.status.left(left(next)))

  /** Puts a card in a space: the one it was let go over if that is empty, or else the nearest empty one. */
  function choose(number: number, preferred: number | null = null) {
    const open = hand.flatMap((card, slot) => (card === null ? [slot] : []))
    if (hand.includes(number)) return
    if (open.length === 0) {
      setStatus(shuffleCopy.status.full)
      return
    }
    const slot =
      preferred === null
        ? open[0]!
        : open.reduce((best, next) => (Math.abs(next - preferred) < Math.abs(best - preferred) ? next : best))
    const next = hand.map((card, place) => (place === slot ? number : card))
    commit(next, `${shuffleCopy.status.taken(positions[slot]!)} ${progress(next)}`)
  }

  function putBack(slot: number) {
    const next = hand.map((card, place) => (place === slot ? null : card))
    commit(next, `${shuffleCopy.status.back(positions[slot]!)} ${progress(next)}`)
  }

  function startChoosing() {
    setPhase('choose')
    setStatus(shuffleCopy.status.choosing)
  }

  function mixAgain() {
    setFanOrder(shuffled(NUMBERS, deviceRandom))
    commit(
      positions.map(() => null),
      shuffleCopy.status.mixing,
    )
    setPhase('mix')
  }

  /** Mixes the deck where there is no cloud: the cards change places, and the deck blinks. */
  function reshuffle() {
    setFanOrder(shuffled(NUMBERS, deviceRandom))
    roll.current?.cancel()
    roll.current = deckButton.current?.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' }) ?? null
  }

  /** Which space a point on the screen is over, or null if it is not over the hand. */
  function slotAt(x: number, y: number): number | null {
    const list = handList.current?.getBoundingClientRect()
    const rects = slots()
    if (!list || rects.length === 0) return null
    if (x < list.left - 24 || x > list.right + 24 || y < list.top - 40 || y > list.bottom + 24) return null
    let nearest = 0
    rects.forEach((rect, slot) => {
      const distance = Math.abs(x - (rect.left + rect.width / 2))
      if (distance < Math.abs(x - (rects[nearest]!.left + rects[nearest]!.width / 2))) nearest = slot
    })
    return nearest
  }

  function takeNearest() {
    const number = scene.current?.nearestToMiddle()
    if (number !== null && number !== undefined) choose(number)
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    const cloud = scene.current
    if (!cloud || mode !== 'cloud') return
    event.currentTarget.setPointerCapture(event.pointerId)
    const grabbed = phase === 'choose' ? cloud.grab(event.clientX, event.clientY) : null
    if (grabbed !== null) {
      carried.current = grabbed
      setOver(slotAt(event.clientX, event.clientY))
      return
    }
    // Anywhere else a touch disturbs the cards near it, and a held one goes on stirring.
    cloud.ripple(event.clientX, event.clientY)
    stirring.current = { x: event.clientX, y: event.clientY }
  }

  function onPointerMove(event: PointerEvent) {
    const cloud = scene.current
    if (!cloud) return
    if (carried.current !== null) {
      cloud.drag(event.clientX, event.clientY)
      setOver(slotAt(event.clientX, event.clientY))
      return
    }
    const from = stirring.current
    if (!from) return
    cloud.stir(event.clientX, event.clientY, event.clientX - from.x, event.clientY - from.y)
    stirring.current = { x: event.clientX, y: event.clientY }
  }

  function onPointerEnd(event: PointerEvent) {
    stirring.current = null
    const number = carried.current
    if (number === null) return
    carried.current = null
    setOver(null)
    scene.current?.drop()
    // Let go over a space, the card goes in it; anywhere else it goes back among the others.
    const slot = event.type === 'pointerup' ? slotAt(event.clientX, event.clientY) : null
    if (slot !== null) choose(number, slot)
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' || event.metaKey || event.ctrlKey || event.altKey) return
    // Enter and Space are presses too, and must not also arrive as a click.
    event.preventDefault()
    const cloud = scene.current
    if (mode !== 'cloud' || !cloud) {
      if (!event.repeat) reshuffle()
      return
    }
    // An arrow key stirs, and goes on stirring while it is held.
    const arrow = ARROWS[event.key]
    if (event.repeat && !arrow) return
    if (arrow) {
      cloud.nudge(...arrow)
    } else if (phase === 'choose' && (event.key === 'Enter' || event.key === ' ')) {
      takeNearest()
    } else {
      const { x, y } = cloud.centre()
      cloud.ripple(x, y)
    }
  }

  // A press that reached the deck with no pointer and no key behind it comes
  // from assistive technology, such as a screen reader or voice control.
  function onClick(event: MouseEvent) {
    if (event.detail !== 0) return
    const cloud = scene.current
    if (mode !== 'cloud' || !cloud) {
      reshuffle()
    } else if (phase === 'choose') {
      takeNearest()
    } else {
      const { x, y } = cloud.centre()
      cloud.ripple(x, y)
    }
  }

  // Where there is no cloud, a tap on the deck shuffles it.
  function onDeckTap(event: MouseEvent) {
    if (mode === 'still' && event.detail !== 0) reshuffle()
    else onClick(event)
  }

  function onCloudFail() {
    cloudFailed = true
    setFailed(true)
  }

  const hint = full && phase === 'choose' ? shuffleCopy.hint.full : shuffleCopy.hint[phase][mode]

  // The spaces are not there while the deck is being shuffled: that part is the cloud alone.
  const handView = phase === 'mix' ? null : (
    <Hand
      positions={positions}
      hand={hand}
      drawn={mode === 'still'}
      over={over}
      phase={phase}
      onPutBack={putBack}
      listRef={handList}
    />
  )

  return (
    <div className={styles.shuffle} data-mode={mode} data-phase={phase}>
      {cloudPossible && (
        <div className={styles.extras}>
          <button
            type="button"
            className={styles.extra}
            onClick={() => preferences.set({ shuffleStill: !shuffleStill })}
          >
            {shuffleStill ? shuffleCopy.move : shuffleCopy.hold}
          </button>
        </div>
      )}

      {handFirst && handView}

      <div ref={stage} className={styles.stage}>
        {cloudWanted && (
          <Suspense fallback={null}>
            <Cloud
              stageRef={stage}
              sceneRef={scene}
              order={cloudOrder}
              random={deviceFraction}
              slots={slots}
              onReadyChange={setReady}
              onFail={onCloudFail}
            />
          </Suspense>
        )}

        {handFirst ? (
          <Fan order={fanOrder} hand={hand} onTake={choose} />
        ) : (
          <button
            ref={deckButton}
            type="button"
            className={styles.deck}
            aria-label={shuffleCopy.deck[phase][mode]}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onKeyDown={onKeyDown}
            onClick={onDeckTap}
          >
            {mode === 'still' && <StillDeck />}
          </button>
        )}
      </div>

      {!handFirst && handView}

      <div className={styles.foot}>
        {phase === 'mix' && <p className={styles.intro}>{shuffleCopy.intro}</p>}
        <p className={styles.hint}>{hint}</p>
        <div className={styles.actions}>
          {phase === 'mix' ? (
            <button key="choose" type="button" className={styles.primary} onClick={startChoosing}>
              {shuffleCopy.choose}
            </button>
          ) : (
            <>
              <button key="again" type="button" className={styles.extra} onClick={mixAgain}>
                {shuffleCopy.mixAgain}
              </button>
              <button
                key="lay"
                ref={layButton}
                type="button"
                className={styles.primary}
                disabled={!full}
                onClick={() => onDraw(hand as number[])}
              >
                {shuffleCopy.lay}
              </button>
            </>
          )}
        </div>
        {phase === 'mix' && <p className={styles.privacy}>{shuffleCopy.privacy}</p>}
      </div>

      <p role="status" className="visually-hidden">
        {status}
      </p>
    </div>
  )
}
