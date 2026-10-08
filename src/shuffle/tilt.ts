/** How far the phone is tilted from where it was held at the start, each from -1 to 1. */
export interface Tilt {
  x: number
  y: number
}

/** The tilt, in degrees, that counts as all the way over. */
const FULL_TILT_DEGREES = 35

/** A deliberate sway is folded in at most this often… */
const SWAY_EVERY_MS = 250
/** …and only when the phone has moved this far since the last one, which sensor jitter does not. */
const SWAY_DISTANCE = 0.06

interface OrientationReading {
  beta: number | null
  gamma: number | null
}

type OrientationListener = (event: OrientationReading) => void

/** The part of `window` that delivers the phone's orientation. */
export interface OrientationSource {
  addEventListener(type: 'deviceorientation', listener: OrientationListener): void
  removeEventListener(type: 'deviceorientation', listener: OrientationListener): void
}

/** The part of `DeviceOrientationEvent` that iPhones use to ask the person first. */
export interface OrientationPermission {
  requestPermission?: () => Promise<string>
}

const clamp = (value: number) => Math.max(-1, Math.min(1, value))

/**
 * Reads the phone's tilt, and only once asked to. Nothing is listened to
 * until `start`, and nothing after `stop`.
 *
 * `touch` says whether this is a device held in the hand: a desktop browser
 * has the orientation event too, with no sensor behind it.
 */
export function createTilt(
  source: OrientationSource | undefined,
  permission: OrientationPermission | undefined,
  touch: boolean,
) {
  let listener: OrientationListener | null = null

  function stop() {
    if (listener) source?.removeEventListener('deviceorientation', listener)
    listener = null
  }

  return {
    available: !!source && !!permission && touch,
    needsPermission: typeof permission?.requestPermission === 'function',

    /**
     * Starts following the phone. Must be called from a press, which is when
     * an iPhone will ask the person. Resolves to false if they, or the
     * device, said no.
     */
    async start(onTilt: (tilt: Tilt) => void): Promise<boolean> {
      stop()
      if (!source || !permission) return false
      if (permission.requestPermission) {
        try {
          if ((await permission.requestPermission()) !== 'granted') return false
        } catch {
          return false
        }
      }
      // However the phone is held at the first reading counts as level.
      let level: { beta: number; gamma: number } | null = null
      listener = ({ beta, gamma }) => {
        if (beta == null || gamma == null) return
        level ??= { beta, gamma }
        onTilt({
          x: clamp((gamma - level.gamma) / FULL_TILT_DEGREES),
          y: clamp((beta - level.beta) / FULL_TILT_DEGREES),
        })
      }
      source.addEventListener('deviceorientation', listener)
      return true
    },

    stop,
  }
}

/**
 * Tells a deliberate sway from sensor jitter. Call it with each reading;
 * it answers true when that reading should count as an input.
 */
export function createSway() {
  let last: Tilt = { x: 0, y: 0 }
  let at = -Infinity
  return (tilt: Tilt, now: number) => {
    if (now - at <= SWAY_EVERY_MS) return false
    if (Math.hypot(tilt.x - last.x, tilt.y - last.y) <= SWAY_DISTANCE) return false
    last = tilt
    at = now
    return true
  }
}
