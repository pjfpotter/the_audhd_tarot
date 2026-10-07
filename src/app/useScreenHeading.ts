import { useEffect, useRef } from 'react'

/**
 * Moves focus to a screen's heading when the screen appears, so keyboard and
 * screen-reader users land at the top of the new content and hear what it is.
 * Skipped for the first screen of a visit, where the page load does that.
 */
let firstScreen = true

export function useScreenHeading<T extends HTMLElement>() {
  const heading = useRef<T>(null)
  useEffect(() => {
    if (firstScreen) {
      firstScreen = false
      return
    }
    heading.current?.focus()
  }, [])
  return heading
}
