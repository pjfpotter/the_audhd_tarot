import { useSyncExternalStore } from 'react'
import { createPreferencesStore, resolve } from './preferences'

function deviceStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export const preferences = createPreferencesStore(deviceStorage())

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

function applyToDocument() {
  const { theme, motion, textScale } = resolve(preferences.get(), {
    prefersDark: darkQuery.matches,
    prefersReducedMotion: reducedMotionQuery.matches,
  })
  const root = document.documentElement
  root.dataset.theme = theme
  root.dataset.motion = motion
  root.style.setProperty('--text-scale', String(textScale))
}

/** Keeps <html> in step with the person's choices and their device settings. */
export function watchPreferences() {
  applyToDocument()
  preferences.subscribe(applyToDocument)
  darkQuery.addEventListener('change', applyToDocument)
  reducedMotionQuery.addEventListener('change', applyToDocument)
}

export function usePreferences() {
  return useSyncExternalStore(preferences.subscribe, preferences.get)
}
