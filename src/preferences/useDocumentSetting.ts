import { useSyncExternalStore } from 'react'

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-motion'] })
  return () => observer.disconnect()
}

/**
 * What <html> carries for the theme or for motion, once the person's choice
 * and their device's setting have been resolved. Follows changes to either.
 */
export function useDocumentSetting(name: 'theme' | 'motion') {
  return useSyncExternalStore(subscribe, () => document.documentElement.dataset[name])
}
