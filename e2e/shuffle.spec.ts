import { type Page, expect, test } from '@playwright/test'

const deck = (page: Page) => page.getByRole('button', { name: /^The deck/ })
const glyphs = (page: Page) => page.locator('[class*="_glyphs_"]')
const drawButton = (page: Page) => page.getByRole('button', { name: 'Draw three cards' })
const heading = (page: Page) => page.getByRole('heading', { level: 1 })

/** Turns over all three cards and returns their names in position order. */
async function drawnCards(page: Page) {
  await drawButton(page).click()
  await expect(heading(page)).toHaveText('Your cards')
  for (const close of ['Back to the cards', 'Back to the cards', 'See the whole reading']) {
    await page.getByRole('button', { name: /Turn over$/ }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: close }).click()
  }
  return page.getByRole('heading', { level: 2 }).allInnerTexts()
}

// The still deck is what reduced motion gets, and what every device has until the cloud is ready.
test.use({ reducedMotion: 'reduce' })

test.describe('shuffling the still deck', () => {
  test('the glyphs are eight symbols, hidden from screen readers, with no letters or digits', async ({ page }) => {
    await page.goto('/')
    const row = (await glyphs(page).innerText()).trim()
    expect([...row]).toHaveLength(8)
    expect(row).not.toMatch(/[\p{L}\p{N}]/u)
    await expect(glyphs(page)).toHaveAttribute('aria-hidden', 'true')
  })

  test('a tap rolls the glyphs at once', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width: 360, height: 740 } })
    const page = await context.newPage()
    await page.goto('/')
    const before = await glyphs(page).innerText()
    await deck(page).tap()
    await expect(glyphs(page)).not.toHaveText(before)
    await context.close()
  })

  test('every key press on the deck is a beat', async ({ page }) => {
    await page.goto('/')
    await deck(page).focus()
    const seen = new Set([await glyphs(page).innerText()])
    for (const key of ['a', 'Enter', 'Space', 'm']) {
      await page.keyboard.press(key)
      seen.add(await glyphs(page).innerText())
    }
    expect(seen.size).toBe(5)
    // Enter and Space shuffled; they did not draw.
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
  })

  test('a press from assistive technology, with no pointer or key, is a beat', async ({ page }) => {
    await page.goto('/')
    const before = await glyphs(page).innerText()
    await deck(page).evaluate((el: HTMLElement) => el.click())
    await expect(glyphs(page)).not.toHaveText(before)
  })

  test('a single key is enough to shuffle and then draw', async ({ page }) => {
    await page.goto('/')
    await deck(page).focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')
    await drawButton(page).focus()
    await page.keyboard.press('Enter')
    await expect(heading(page)).toHaveText('Your cards')
  })

  test('draw works at once, without shuffling', async ({ page }) => {
    await page.goto('/')
    await drawButton(page).click()
    await expect(heading(page)).toHaveText('Your cards')
    await expect(page.getByRole('listitem')).toHaveCount(3)
  })

  test('shuffling can go on as long as wanted', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await deck(page).focus()
    for (let minute = 0; minute < 5; minute++) {
      const before = await glyphs(page).innerText()
      await page.keyboard.press('k')
      await expect(glyphs(page)).not.toHaveText(before)
      await page.clock.fastForward('01:00')
    }
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
    await expect(drawButton(page)).toBeVisible()
  })

  test('the same beats at the same moments draw the same cards', async ({ browser }) => {
    const readings: string[][] = []
    const rows: string[] = []
    for (let visit = 0; visit < 2; visit++) {
      const context = await browser.newContext({ reducedMotion: 'reduce' })
      const page = await context.newPage()
      await page.clock.install({ time: new Date('2026-01-01T12:00:00') })
      await page.goto('/')
      await page.clock.pauseAt(new Date('2026-01-01T12:00:05'))
      await deck(page).focus()
      for (const [key, wait] of [['a', 310], ['a', 290], ['Space', 505], ['z', 120]] as const) {
        await page.keyboard.press(key)
        await page.clock.runFor(wait)
      }
      rows.push(await glyphs(page).innerText())
      readings.push(await drawnCards(page))
      await context.close()
    }
    expect(rows[1]).toBe(rows[0])
    expect(readings[0]).toHaveLength(3)
    expect(readings[1]).toEqual(readings[0])
  })

  test('a different moment gives a different number', async ({ browser }) => {
    const rows: string[] = []
    for (const wait of [310, 311]) {
      const context = await browser.newContext({ reducedMotion: 'reduce' })
      const page = await context.newPage()
      await page.clock.install({ time: new Date('2026-01-01T12:00:00') })
      await page.goto('/')
      await page.clock.pauseAt(new Date('2026-01-01T12:00:05'))
      await deck(page).focus()
      await page.keyboard.press('a')
      await page.clock.runFor(wait)
      await page.keyboard.press('a')
      rows.push(await glyphs(page).innerText())
      await context.close()
    }
    expect(rows[1]).not.toBe(rows[0])
  })

  test('two draws without shuffling can differ', async ({ page }) => {
    const readings = new Set<string>()
    await page.goto('/')
    for (let i = 0; i < 4; i++) {
      await drawButton(page).click()
      await page.getByRole('button', { name: /Turn over$/ }).click()
      readings.add((await heading(page).innerText()).replace(/\s+/g, ' '))
      await page.getByRole('button', { name: 'Start again' }).click()
    }
    expect(readings.size).toBeGreaterThan(1)
  })

  test('the count of beats is announced politely, and not beat by beat', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    const status = page.getByRole('status')
    await deck(page).focus()
    for (let i = 0; i < 5; i++) await page.keyboard.press('j')
    await expect(status).toHaveText('')
    await page.clock.runFor(2100)
    await expect(status).toHaveText('5 beats')
    await page.keyboard.press('j')
    await expect(status).toHaveText('5 beats')
    await page.clock.runFor(2100)
    await expect(status).toHaveText('6 beats')
  })

  test('starting again starts a new shuffle', async ({ page }) => {
    await page.goto('/')
    const fresh = await glyphs(page).innerText()
    await deck(page).click()
    await expect(glyphs(page)).not.toHaveText(fresh)
    await drawButton(page).click()
    await page.getByRole('button', { name: 'Start again' }).click()
    await expect(glyphs(page)).toHaveText(fresh)
    await expect(page.getByRole('status')).toHaveText('')
  })

  test('nothing moves: a roll is a brief fade and no more', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('canvas')).toHaveCount(0)
    await deck(page).click()
    const animated = await page.evaluate(() =>
      document.getAnimations().flatMap((animation) =>
        (animation.effect as KeyframeEffect).getKeyframes().flatMap((frame) =>
          Object.keys(frame).filter((key) => !['offset', 'easing', 'composite', 'computedOffset'].includes(key)),
        ),
      ),
    )
    expect(new Set(animated)).toEqual(new Set(['opacity']))
    await page.waitForTimeout(400)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  })
})
