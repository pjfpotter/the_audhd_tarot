import { describe, expect, test, vi } from 'vitest'
import { DEFAULT_PREFERENCES, STORAGE_KEY, createPreferencesStore, resolve } from './preferences'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

describe('preferences store', () => {
  test('starts with the defaults', () => {
    expect(createPreferencesStore(memoryStorage()).get()).toEqual({
      theme: 'system',
      motion: 'system',
      textScale: 1,
    })
  })

  test('remembers choices for the next visit', () => {
    const storage = memoryStorage()
    createPreferencesStore(storage).set({ theme: 'dark', textScale: 1.5 })
    expect(createPreferencesStore(storage).get()).toEqual({
      theme: 'dark',
      motion: 'system',
      textScale: 1.5,
    })
  })

  test('tells subscribers when a choice changes', () => {
    const store = createPreferencesStore(memoryStorage())
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    store.set({ motion: 'reduced' })
    unsubscribe()
    store.set({ motion: 'system' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  test('ignores saved values it does not recognise', () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ theme: 'sepia', motion: 'lots', textScale: 9 }),
    })
    expect(createPreferencesStore(storage).get()).toEqual(DEFAULT_PREFERENCES)
  })

  test('ignores saved data that is not JSON', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: 'not json' })
    expect(createPreferencesStore(storage).get()).toEqual(DEFAULT_PREFERENCES)
  })

  test('still applies choices for the visit when storage is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    const store = createPreferencesStore(blocked)
    expect(() => store.set({ theme: 'dark' })).not.toThrow()
    expect(store.get().theme).toBe('dark')
  })

  test('works with no storage at all', () => {
    const store = createPreferencesStore(undefined)
    store.set({ textScale: 1.3 })
    expect(store.get().textScale).toBe(1.3)
  })
})

describe('resolve', () => {
  const device = { prefersDark: false, prefersReducedMotion: false }

  test('follows the device by default', () => {
    expect(resolve(DEFAULT_PREFERENCES, { prefersDark: true, prefersReducedMotion: true })).toEqual({
      theme: 'dark',
      motion: 'reduced',
      textScale: 1,
    })
    expect(resolve(DEFAULT_PREFERENCES, device)).toEqual({ theme: 'light', motion: 'full', textScale: 1 })
  })

  test('an explicit theme wins over the device', () => {
    expect(resolve({ ...DEFAULT_PREFERENCES, theme: 'light' }, { ...device, prefersDark: true }).theme).toBe('light')
  })

  test('reduced motion can be chosen on a device that does not ask for it', () => {
    expect(resolve({ ...DEFAULT_PREFERENCES, motion: 'reduced' }, device).motion).toBe('reduced')
  })

  test('the app never turns motion on against the device setting', () => {
    expect(resolve(DEFAULT_PREFERENCES, { ...device, prefersReducedMotion: true }).motion).toBe('reduced')
  })
})
