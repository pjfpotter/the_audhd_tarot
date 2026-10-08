export type ThemeChoice = 'system' | 'light' | 'dark'
export type MotionChoice = 'system' | 'reduced'

/** Multipliers applied to every text size. The last is the largest offered. */
export const TEXT_SCALES = [1, 1.15, 1.3, 1.5] as const
export type TextScale = (typeof TEXT_SCALES)[number]

export interface Preferences {
  theme: ThemeChoice
  motion: MotionChoice
  textScale: TextScale
  /** Hold the shuffle's cloud of cards still, showing the still deck in its place. */
  shuffleStill: boolean
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  motion: 'system',
  textScale: 1,
  shuffleStill: false,
}

/** Also read by the inline script in index.html, which runs before first paint. */
export const STORAGE_KEY = 'audhd-tarot:preferences'

type Store = Pick<Storage, 'getItem' | 'setItem'>

function parse(raw: string | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES
  try {
    const saved = JSON.parse(raw) as Partial<Record<keyof Preferences, unknown>>
    return {
      theme: saved.theme === 'light' || saved.theme === 'dark' ? saved.theme : 'system',
      motion: saved.motion === 'reduced' ? 'reduced' : 'system',
      textScale: TEXT_SCALES.find((scale) => scale === saved.textScale) ?? 1,
      shuffleStill: saved.shuffleStill === true,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

/**
 * Holds the person's choices and keeps them on their device. If storage is
 * blocked or full, choices still apply for the current visit.
 */
export function createPreferencesStore(storage: Store | undefined) {
  let current = DEFAULT_PREFERENCES
  try {
    current = parse(storage?.getItem(STORAGE_KEY) ?? null)
  } catch {
    // Storage is unavailable; keep the defaults in memory.
  }
  const listeners = new Set<() => void>()

  return {
    get: () => current,
    set(change: Partial<Preferences>) {
      current = { ...current, ...change }
      try {
        storage?.setItem(STORAGE_KEY, JSON.stringify(current))
      } catch {
        // Not saved; the choice still applies until the page is closed.
      }
      listeners.forEach((listener) => listener())
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export type PreferencesStore = ReturnType<typeof createPreferencesStore>

export interface DeviceSettings {
  prefersDark: boolean
  prefersReducedMotion: boolean
}

/** What <html> should carry for these choices on this device. */
export function resolve(preferences: Preferences, device: DeviceSettings) {
  const theme =
    preferences.theme === 'system' ? (device.prefersDark ? 'dark' : 'light') : preferences.theme
  const motion =
    preferences.motion === 'reduced' || device.prefersReducedMotion ? 'reduced' : 'full'
  return { theme, motion, textScale: preferences.textScale } as const
}
