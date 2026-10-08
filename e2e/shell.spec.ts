import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'

const savePreferences = (preferences: object) =>
  `localStorage.setItem('audhd-tarot:preferences', ${JSON.stringify(JSON.stringify(preferences))})`

test.describe('name and first screen', () => {
  test('the app is named The AuDHD Tarot', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('The AuDHD Tarot')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The AuDHD Tarot')
  })

  test('the old name appears nowhere in the built app', () => {
    const files = readdirSync('dist', { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(html|js|css|json|txt|svg)$/.test(entry.name))
      .map((entry) => join(entry.parentPath, entry.name))
    expect(files.length).toBeGreaterThan(0)
    for (const file of files) {
      expect(readFileSync(file, 'utf8').toLowerCase(), file).not.toContain('neurospicy')
    }
  })

  test('the app opens on the shuffle, with its name and introduction', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /^The deck/ })).toBeVisible()
    await expect(page.getByText('The major arcana')).toBeVisible()
    await expect(page.getByText('Nothing you do here leaves your device.')).toBeVisible()
  })

  test('the primary control deals three cards', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Draw three cards' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your cards')
    await expect(page.getByRole('listitem')).toHaveCount(3)
  })

  test('the options control is on every screen', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Options' })).toBeVisible()
    await page.getByRole('button', { name: 'Draw three cards' }).click()
    await expect(page.getByRole('button', { name: 'Options' })).toBeVisible()
  })
})

test.describe('layout', () => {
  for (const width of [320, 1280]) {
    test(`no screen scrolls sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 })
      await page.goto('/')
      const overflows = () =>
        page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(await overflows()).toBe(false)
      await page.getByRole('button', { name: 'Draw three cards' }).click()
      expect(await overflows()).toBe(false)
    })
  }

  test('reading text stays within a readable line length on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    const intro = page.getByText('The major arcana')
    // Characters per line: the box width over the width of an average glyph.
    const perLine = await intro.evaluate((el) => {
      const probe = document.createElement('span')
      probe.textContent = 'abcdefghijklmnopqrstuvwxyz '.repeat(4)
      probe.style.whiteSpace = 'nowrap'
      el.append(probe)
      const glyph = probe.getBoundingClientRect().width / probe.textContent.length
      probe.remove()
      return el.getBoundingClientRect().width / glyph
    })
    expect(perLine).toBeLessThanOrEqual(75)
  })
})

test.describe('privacy', () => {
  test('loading the app makes no requests elsewhere and sets no cookies', async ({ page, context, baseURL }) => {
    const origin = new URL(baseURL!).origin
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(requests.length).toBeGreaterThan(0)
    for (const url of requests) {
      if (url.startsWith('data:')) continue
      expect(new URL(url).origin, url).toBe(origin)
    }
    expect(await context.cookies()).toEqual([])
  })
})

test.describe('themes', () => {
  test('follows the device by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('a saved choice is applied before the first paint', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.addInitScript(savePreferences({ theme: 'dark', motion: 'system', textScale: 1.5 }))
    // Hold back the app's script, so only the inline pre-paint script has run.
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'dark')
    expect(await html.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(0, 0, 0)')
    expect(await html.evaluate((el) => getComputedStyle(el).fontSize)).toBe('24px')
  })

  test('saved choices survive a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.evaluate(savePreferences({ theme: 'dark', motion: 'reduced', textScale: 1.3 }))
    await page.reload()
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await expect(html).toHaveAttribute('data-motion', 'reduced')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('motion', () => {
  test('reduced motion on the device leaves nothing moving', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')
    await page.getByRole('button', { name: /^The deck/ }).click()
    await page.getByRole('button', { name: 'Draw three cards' }).click()
    const moving = await page.evaluate(() =>
      document.getAnimations().filter((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        const properties = effect?.getKeyframes().flatMap((frame) => Object.keys(frame)) ?? []
        return properties.some((p) => ['transform', 'translate', 'scale', 'rotate'].includes(p))
      }).length,
    )
    expect(moving).toBe(0)
  })

  test('nothing animates on an idle screen', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  })
})
