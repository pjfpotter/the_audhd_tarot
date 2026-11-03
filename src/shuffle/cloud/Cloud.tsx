import { type RefObject, useEffect, useRef } from 'react'
import { cardBack } from '../../content/deck'
import { useDocumentSetting } from '../../preferences/useDocumentSetting'
import { type Cloud as CloudScene, type CloudTheme, type Slot, createCloud } from './scene'
import { CLOUD_SETTINGS } from './settings'
import styles from './Cloud.module.css'

interface CloudProps {
  /** The part of the screen left clear for the cloud. */
  stageRef: RefObject<HTMLElement | null>
  /** Filled with the running scene, for the shuffle to send touches to. */
  sceneRef: RefObject<CloudScene | null>
  /** The card numbers in the order they start in the cloud. Each card keeps its number for good. */
  order: readonly number[]
  /** A fraction from 0 up to, but not including, 1. */
  random: () => number
  /** Where the places of the hand are on the screen now. */
  slots: () => readonly Slot[]
  /** True once the card back has loaded and a frame is drawn; false again when the cloud goes. */
  onReadyChange: (ready: boolean) => void
  /** The device cannot draw the scene, or has stopped being able to. */
  onFail: () => void
}

const themeNow = (): CloudTheme => ({
  background: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#000000',
  dark: document.documentElement.dataset.theme !== 'light',
})

/**
 * The deck as a cloud of cards in depth. Purely a picture: it is hidden from
 * screen readers and carries no information the still deck lacks.
 */
export default function Cloud({ stageRef, sceneRef, order, random, slots, onReadyChange, onFail }: CloudProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const theme = useDocumentSetting('theme')
  // Held in a ref so that a new callback from the parent does not restart the scene.
  const callbacks = useRef({ onReadyChange, onFail, slots })
  useEffect(() => {
    callbacks.current = { onReadyChange, onFail, slots }
  })

  useEffect(() => {
    if (!canvas.current || !stageRef.current) return
    let cloud: CloudScene
    try {
      cloud = createCloud({
        canvas: canvas.current,
        stage: stageRef.current,
        cardBack,
        settings: CLOUD_SETTINGS,
        theme: themeNow(),
        order,
        random,
        slots: () => callbacks.current.slots(),
        onReady: () => callbacks.current.onReadyChange(true),
        onLost: () => callbacks.current.onFail(),
      })
    } catch {
      callbacks.current.onFail()
      return
    }
    sceneRef.current = cloud
    return () => {
      sceneRef.current = null
      cloud.dispose()
      callbacks.current.onReadyChange(false)
    }
  }, [sceneRef, stageRef, order, random])

  useEffect(() => {
    sceneRef.current?.setTheme(themeNow())
  }, [sceneRef, theme])

  return <canvas ref={canvas} className={styles.cloud} aria-hidden="true" />
}
