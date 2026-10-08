import AxeBuilder from '@axe-core/playwright'
import { type Page, expect, test } from '@playwright/test'

const deck = (page: Page) => page.getByRole('button', { name: /^The deck/ })
const glyphs = (page: Page) => page.locator('[class*="_glyphs_"]')
const drawButton = (page: Page) => page.getByRole('button', { name: 'Draw three cards' })
const heading = (page: Page) => page.getByRole('heading', { level: 1 })
const shuffle = (page: Page) => page.locator('[data-mode]')
const holdStill = (page: Page) => page.getByRole('button', { name: 'Hold still' })
const SCENE_CHUNK = /\/assets\/Cloud-[^/]+\.js$/
const isSceneChunk = (url: string) => SCENE_CHUNK.test(url)

const savePreferences = (preferences: object) =>
  `localStorage.setItem('audhd-tarot:preferences', ${JSON.stringify(JSON.stringify(preferences))})`

/** Counts the animation frames the page asks for, as `window.frames`. */
const COUNT_FRAMES = `
  window.frameCount = 0
  const request = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (callback) => { window.frameCount++; return request(callback) }
`
const frameCount = (page: Page) => page.evaluate(() => (window as unknown as { frameCount: number }).frameCount)

/** Whether frames are still being asked for, measured over a third of a second. */
async function animating(page: Page) {
  const before = await frameCount(page)
  await page.waitForTimeout(350)
  return (await frameCount(page)) > before
}

async function openOnCloud(page: Page) {
  await page.goto('/')
  await expect(shuffle(page)).toHaveAttribute('data-mode', 'cloud')
}

/** Turns over all three cards and returns their names in position order. */
async function readDrawnCards(page: Page) {
  await expect(heading(page)).toHaveText('Your cards')
  for (const close of ['Back to the cards', 'Back to the cards', 'See the whole reading']) {
    await page.getByRole('button', { name: /Turn over$/ }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: close }).click()
  }
  return page.getByRole('heading', { level: 2 }).allInnerTexts()
}

test.describe('the cloud', () => {
  test('is the deck on the first screen, drawn on a canvas hidden from screen readers', async ({ page }) => {
    await openOnCloud(page)
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    await expect(canvas).toHaveAttribute('aria-hidden', 'true')
    await expect(deck(page)).toHaveAccessibleName('The deck. Tap, press any key, or drag to shuffle.')
    // Something has been painted: the canvas is not one flat colour.
    const colours = await page.evaluate(async () => {
      await new Promise(requestAnimationFrame)
      const source = document.querySelector('canvas')!
      const copy = document.createElement('canvas')
      copy.width = 64
      copy.height = 64
      const context = copy.getContext('2d')!
      context.drawImage(source, 0, 0, 64, 64)
      const pixels = context.getImageData(0, 0, 64, 64).data
      const seen = new Set<number>()
      for (let i = 0; i < pixels.length; i += 4) seen.add((pixels[i]! << 16) | (pixels[i + 1]! << 8) | pixels[i + 2]!)
      return seen.size
    })
    expect(colours).toBeGreaterThan(8)
  })

  test('a tap, a drag and an arrow key each roll the glyphs', async ({ page }) => {
    await openOnCloud(page)
    const box = (await deck(page).boundingBox())!
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2

    let before = await glyphs(page).innerText()
    await page.mouse.click(x, y)
    await expect(glyphs(page)).not.toHaveText(before)

    // One press and a drag: the press is a beat, and each movement after it is a stir.
    const beats = async () => {
      await page.mouse.down()
      const pressed = await glyphs(page).innerText()
      await page.mouse.move(x + 60, y + 30, { steps: 4 })
      const stirred = await glyphs(page).innerText()
      await page.mouse.up()
      return { pressed, stirred }
    }
    await page.mouse.move(x, y)
    const { pressed, stirred } = await beats()
    expect(stirred).not.toBe(pressed)

    // Moving without pressing is not input.
    before = await glyphs(page).innerText()
    await page.mouse.move(x - 40, y - 40, { steps: 3 })
    expect(await glyphs(page).innerText()).toBe(before)

    await deck(page).focus()
    await page.keyboard.press('ArrowLeft')
    await expect(glyphs(page)).not.toHaveText(before)
  })

  test('draw brings three cards to the three positions, with the first ready to turn over', async ({ page }) => {
    await openOnCloud(page)
    await drawButton(page).click()
    // The cards come forward out of the cloud first.
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
    await expect(heading(page)).toHaveText('Your cards')
    await expect(page.getByRole('listitem')).toHaveCount(3)
    await expect(page.getByRole('button', { name: 'Where I am Turn over' })).toBeFocused()
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  test('a second press of draw while the cards come forward changes nothing', async ({ page }) => {
    await openOnCloud(page)
    // All within one moment, well inside the time the cards take to come forward.
    const rows = await page.evaluate(() => {
      const row = () => document.querySelector('[class*="_glyphs_"]')!.textContent
      const [deck, draw] = [...document.querySelectorAll<HTMLElement>('main button')].slice(-2)
      draw!.click()
      const drawn = row()
      draw!.click()
      deck!.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }))
      deck!.click()
      return { drawn, after: row() }
    })
    expect(rows.after).toBe(rows.drawn)
    await expect(heading(page)).toHaveText('Your cards')
  })

  test('the same beats at the same moments draw the same cards on the cloud and on the still deck', async ({
    browser,
  }) => {
    const readings: string[][] = []
    const rows: string[] = []
    for (const mode of ['cloud', 'still'] as const) {
      const context = await browser.newContext({ reducedMotion: mode === 'still' ? 'reduce' : 'no-preference' })
      const page = await context.newPage()
      await page.clock.install({ time: new Date('2026-01-01T12:00:00') })
      await page.goto('/')
      // The clock is the test's, so the cloud's frames only run when it is moved on.
      for (let i = 0; mode === 'cloud' && i < 100 && (await shuffle(page).getAttribute('data-mode')) !== 'cloud'; i++) {
        await page.clock.runFor(100)
      }
      await expect(shuffle(page)).toHaveAttribute('data-mode', mode)
      await page.clock.pauseAt(new Date('2026-01-01T12:01:00'))
      await deck(page).focus()
      for (const [key, wait] of [['a', 310], ['a', 290], ['Space', 505], ['z', 120]] as const) {
        await page.keyboard.press(key)
        await page.clock.runFor(wait)
      }
      rows.push(await glyphs(page).innerText())
      await drawButton(page).click()
      await page.clock.runFor(1000)
      await page.clock.resume()
      readings.push(await readDrawnCards(page))
      await context.close()
    }
    expect(rows[1]).toBe(rows[0])
    expect(readings[0]).toHaveLength(3)
    expect(readings[1]).toEqual(readings[0])
  })
})

test.describe('loading the scene', () => {
  test('the first screen is complete and can draw before the scene arrives', async ({ page }) => {
    let release = () => {}
    const held = new Promise<void>((resolve) => (release = resolve))
    let asked = false
    await page.route(SCENE_CHUNK, async (route) => {
      asked = true
      await held
      await route.continue()
    })
    await page.goto('/')
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
    await expect(page.getByText('The major arcana')).toBeVisible()
    await expect(deck(page).locator('img')).toHaveCount(3)
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    expect(asked).toBe(true)

    const before = await glyphs(page).innerText()
    await deck(page).click()
    await expect(glyphs(page)).not.toHaveText(before)
    await drawButton(page).click()
    await expect(heading(page)).toHaveText('Your cards')
    release()
  })

  test('beats made on the still deck carry over when the cloud arrives', async ({ page }) => {
    let release = () => {}
    const held = new Promise<void>((resolve) => (release = resolve))
    await page.route(SCENE_CHUNK, async (route) => {
      await held
      await route.continue()
    })
    await page.goto('/')
    await deck(page).click()
    const row = await glyphs(page).innerText()
    release()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'cloud')
    expect(await glyphs(page).innerText()).toBe(row)
  })

  test('the scene is not fetched with reduced motion', async ({ page }) => {
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await drawButton(page).click()
    await expect(heading(page)).toHaveText('Your cards')
    expect(requests.filter(isSceneChunk)).toEqual([])
    expect(requests.length).toBeGreaterThan(0)
  })

  test('the scene is not fetched when the deck is held still from an earlier visit', async ({ page }) => {
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await page.addInitScript(savePreferences({ shuffleStill: true }))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    expect(requests.filter(isSceneChunk)).toEqual([])
  })

  test('every request is to the app itself', async ({ page, baseURL }) => {
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await openOnCloud(page)
    expect(requests.filter(isSceneChunk)).toHaveLength(1)
    for (const url of requests) {
      if (url.startsWith('data:') || url.startsWith('blob:')) continue
      expect(new URL(url).origin, url).toBe(new URL(baseURL!).origin)
    }
  })
})

test.describe('when the scene cannot run', () => {
  test('a device that cannot start it gets the still deck and no error', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...rest: unknown[]) {
        return kind.startsWith('webgl') ? null : getContext.call(this, kind as '2d', ...(rest as []))
      } as typeof getContext
    })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Draw three cards' })).toBeVisible()
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(deck(page).locator('img')).toHaveCount(3)
    // The control for holding the cloud still has nothing to hold.
    await expect(holdStill(page)).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
    await deck(page).click()
    await drawButton(page).click()
    await expect(heading(page)).toHaveText('Your cards')
    expect(errors).toEqual([])
  })

  test('a scene that stops working gives way to the still deck, keeping the shuffle', async ({ page }) => {
    await openOnCloud(page)
    await deck(page).focus()
    await page.keyboard.press('q')
    const row = await glyphs(page).innerText()
    await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
      context!.getExtension('WEBGL_lose_context')!.loseContext()
    })
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(page.locator('canvas')).toHaveCount(0)
    expect(await glyphs(page).innerText()).toBe(row)
    await drawButton(page).click()
    await expect(heading(page)).toHaveText('Your cards')
    // It is not tried again for the rest of the visit.
    await page.getByRole('button', { name: 'Start again' }).click()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(page.locator('canvas')).toHaveCount(0)
  })
})

test.describe('holding the cloud still', () => {
  test('the cloud draws no frames while the page is hidden', async ({ page }) => {
    await page.addInitScript(COUNT_FRAMES)
    await openOnCloud(page)
    expect(await animating(page)).toBe(true)
    const setHidden = (hidden: boolean) =>
      page.evaluate((value) => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => value })
        document.dispatchEvent(new Event('visibilitychange'))
      }, hidden)
    await setHidden(true)
    expect(await animating(page)).toBe(false)
    await setHidden(false)
    expect(await animating(page)).toBe(true)
  })

  test('one press swaps the cloud for the still deck, and nothing moves', async ({ page }) => {
    await page.addInitScript(COUNT_FRAMES)
    await openOnCloud(page)
    await deck(page).focus()
    await page.keyboard.press('h')
    const row = await glyphs(page).innerText()

    await holdStill(page).click()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(deck(page).locator('img')).toHaveCount(3)
    expect(await glyphs(page).innerText()).toBe(row)
    await page.waitForTimeout(300)
    expect(await animating(page)).toBe(false)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)

    await page.getByRole('button', { name: 'Let it move' }).click()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'cloud')
    expect(await glyphs(page).innerText()).toBe(row)
  })

  test('the choice is remembered on the next visit', async ({ page }) => {
    await openOnCloud(page)
    await holdStill(page).click()
    await page.reload()
    await expect(page.getByRole('button', { name: 'Let it move' })).toBeVisible()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  test('with reduced motion the deck is already still and there is no control', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(drawButton(page)).toBeVisible()
    await expect(holdStill(page)).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Let it move' })).toHaveCount(0)
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  test('choosing reduced motion in the options stills the cloud at once', async ({ page }) => {
    await openOnCloud(page)
    await page.getByRole('button', { name: 'Options' }).click()
    await page.getByRole('group', { name: 'Motion' }).getByRole('radio', { name: 'Reduced' }).check()
    await page.keyboard.press('Escape')
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(page.locator('canvas')).toHaveCount(0)
  })
})

for (const theme of ['light', 'dark'] as const) {
  test(`no WCAG 2.2 AA violations on the cloud, ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await openOnCloud(page)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
}

test('every control over the cloud is at least 44 by 44 CSS pixels and has a name', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await openOnCloud(page)
  const controls = await page.locator('button').evaluateAll((buttons) =>
    buttons.filter((button) => button.checkVisibility()).map((button) => {
      const { width, height } = button.getBoundingClientRect()
      return { name: button.getAttribute('aria-label') || button.textContent, width, height }
    }),
  )
  expect(controls.length).toBeGreaterThanOrEqual(4)
  for (const control of controls) {
    expect(control.name, JSON.stringify(control)).toBeTruthy()
    expect(control.width, JSON.stringify(control)).toBeGreaterThanOrEqual(44)
    expect(control.height, JSON.stringify(control)).toBeGreaterThanOrEqual(44)
  }
})
