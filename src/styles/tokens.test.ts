import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8')

function themeTokens(theme: string): Record<string, string> {
  const block = css.match(new RegExp(`:root\\[data-theme='${theme}'\\]\\s*{([^}]*)}`))?.[1]
  if (!block) throw new Error(`No tokens found for the ${theme} theme`)
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1]!, m[2]!]),
  )
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (light + 0.05) / (dark + 0.05)
}

// [foreground, background, minimum ratio]. Text needs 4.5:1; the focus ring
// and control borders are graphics and need 3:1.
const pairs: [string, string, number][] = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text-muted', 'bg', 4.5],
  ['text-muted', 'surface', 4.5],
  ['accent-text', 'bg', 4.5],
  ['accent-text', 'surface', 4.5],
  ['button-text', 'button-bg', 4.5],
  ['button-bg', 'bg', 3],
  ['focus', 'bg', 3],
  ['focus', 'surface', 3],
]

describe.each(['light', 'dark'])('%s theme', (theme) => {
  const tokens = themeTokens(theme)

  test.each(pairs)('%s on %s is at least %d:1', (fg, bg, minimum) => {
    expect(tokens[fg], `--${fg} is not defined`).toBeDefined()
    expect(tokens[bg], `--${bg} is not defined`).toBeDefined()
    expect(contrast(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(minimum)
  })
})

test('both themes define the same tokens', () => {
  expect(Object.keys(themeTokens('light')).sort()).toEqual(Object.keys(themeTokens('dark')).sort())
})
