import { type Page, expect, test } from '@playwright/test'

const POSITIONS = ['Where I am', 'How I should travel', "Where I'm going next"]
const ART_BEAT_MS = 1800

const enter = (page: Page) => page.goto('/')

async function draw(page: Page) {
  await enter(page)
  await page.getByRole('button', { name: 'Draw three cards' }).click()
}

const turnOver = (page: Page) => page.getByRole('button', { name: /Turn over$/ }).click()
const heading = (page: Page) => page.getByRole('heading', { level: 1 })

/** Turns over every card, reading each, and ends on the full reading. */
async function completeReading(page: Page) {
  await draw(page)
  for (const close of ['Back to the cards', 'Back to the cards', 'See the whole reading']) {
    await turnOver(page)
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: close }).click()
  }
  await expect(heading(page)).toHaveText('Your reading')
}

test.describe('the draw', () => {
  test('one click draws three face-down cards in the named positions', async ({ page }) => {
    await draw(page)
    await expect(heading(page)).toHaveText('Your cards')
    const slots = page.getByRole('listitem')
    await expect(slots).toHaveCount(3)
    for (const [i, position] of POSITIONS.entries()) {
      await expect(slots.nth(i)).toContainText(position)
    }
  })

  for (const key of ['Enter', 'Space']) {
    test(`${key} draws`, async ({ page }) => {
      await enter(page)
      await page.getByRole('button', { name: 'Draw three cards' }).focus()
      await page.keyboard.press(key)
      await expect(heading(page)).toHaveText('Your cards')
    })
  }

  test('a single tap draws', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width: 360, height: 740 } })
    const page = await context.newPage()
    await enter(page)
    await page.getByRole('button', { name: 'Draw three cards' }).tap()
    await expect(heading(page)).toHaveText('Your cards')
    await context.close()
  })

  test('nothing about a card is shown or announced before it is turned over', async ({ page }) => {
    await draw(page)
    const table = page.getByRole('main')
    await expect(table.getByRole('img')).toHaveCount(0)
    // Every face-down card shows the same card back, and nothing else.
    const images = await table.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')))
    expect(images).toEqual(['/cards/back.webp', '/cards/back.webp', '/cards/back.webp'])
    await expect(table.getByRole('button')).toHaveCount(1)
    await expect(table.getByRole('button')).toHaveAccessibleName('Where I am Turn over')
    await expect(table.getByText('Face down')).toHaveCount(2)
  })

  test('cards are turned over in order, and the next one takes focus', async ({ page }) => {
    await draw(page)
    await expect(page.getByRole('button', { name: 'Where I am Turn over' })).toBeFocused()
    await turnOver(page)
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Back to the cards' }).click()
    await expect(page.getByRole('button', { name: 'How I should travel Turn over' })).toBeFocused()
    await expect(page.getByText('Face down')).toHaveCount(1)
  })

  test('two readings in a row are drawn afresh', async ({ page }) => {
    const names = new Set<string>()
    await draw(page)
    for (let i = 0; i < 6; i++) {
      await turnOver(page)
      names.add((await heading(page).innerText()).replace(/\s+/g, ' '))
      await page.getByRole('button', { name: 'Start again' }).click()
      await page.getByRole('button', { name: 'Draw three cards' }).click()
    }
    expect(names.size).toBeGreaterThan(1)
  })
})

test.describe('the art moment', () => {
  test('shows the card image, loaded and uncropped, before any reading text', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await draw(page)
    await turnOver(page)

    const image = page.getByRole('main').getByRole('img')
    await expect(image).toBeVisible()
    expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
    expect(await image.getAttribute('src')).toMatch(/\/cards\/\d\d\.webp$/)
    expect(await image.evaluate((img) => getComputedStyle(img).objectFit)).toBe('contain')

    await expect(heading(page)).toContainText('Where I am')
    await expect(page.getByText('Gift')).toHaveCount(0)
    await expect(page.getByText('Shadow')).toHaveCount(0)

    // The image has most of the screen, and everything fits without scrolling.
    const box = (await image.boundingBox())!
    expect(box.height).toBeGreaterThan(740 * 0.5)
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true)
    await expect(page.getByRole('button', { name: 'Continue' })).toBeInViewport()
  })

  test('the text emerges after the beat with no input', async ({ page }) => {
    await draw(page)
    await turnOver(page)
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await page.waitForTimeout(ART_BEAT_MS / 2)
    await expect(page.getByText('Gift')).toHaveCount(0)
    await expect(page.getByText('Gift').first()).toBeVisible({ timeout: ART_BEAT_MS })
    await expect(page.getByRole('button', { name: 'Continue' })).toHaveCount(0)
  })

  test('Continue shows the text at once', async ({ page }) => {
    await draw(page)
    await turnOver(page)
    const started = Date.now()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Gift').first()).toBeVisible()
    expect(Date.now() - started).toBeLessThan(ART_BEAT_MS)
  })

  test('announces the position, number, name and image description', async ({ page }) => {
    await draw(page)
    await turnOver(page)
    const title = heading(page)
    await expect(title).toBeFocused()
    await expect(title).toHaveAccessibleName(/^Where I am (0|[IVX]+) \S/)
    const description = await title.evaluate((el) =>
      el.getAttribute('aria-describedby')!.split(' ').map((id) => document.getElementById(id)!.getAttribute('alt')).join(' '),
    )
    expect(description.length).toBeGreaterThan(40)
    await expect(page.getByRole('main').getByRole('img')).toHaveAccessibleName(description)
  })

  test('the heading keeps focus when the text emerges on its own', async ({ page }) => {
    await draw(page)
    await turnOver(page)
    await expect(page.getByText('Gift').first()).toBeVisible({ timeout: ART_BEAT_MS * 2 })
    await expect(heading(page)).toBeFocused()
  })

  test('with reduced motion nothing moves or zooms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await draw(page)
    await turnOver(page)
    const running = () => page.evaluate(() => document.getAnimations().length)
    expect(await running()).toBe(0)
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Gift').first()).toBeVisible()
    expect(await running()).toBe(0)
  })
})

test.describe('a revealed card', () => {
  test('shows its position, number, name, essence, question and two or three unities', async ({ page }) => {
    await draw(page)
    await turnOver(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(heading(page)).toHaveAccessibleName(/^Where I am (0|[IVX]+) \S/)
    const anchors = page.getByRole('heading', { level: 2 })
    const count = await anchors.count()
    expect(count === 2 || count === 3).toBe(true)

    const unities = page.getByRole('main').getByRole('listitem')
    await expect(unities).toHaveCount(count)
    for (const unity of await unities.all()) {
      await expect(unity.getByRole('heading')).not.toBeEmpty()
      await expect(unity.getByText('Gift', { exact: true })).toBeVisible()
      await expect(unity.getByText('Shadow', { exact: true })).toBeVisible()
    }
  })

  test('keeps the same unities when revisited', async ({ page }) => {
    await draw(page)
    await turnOver(page)
    await page.getByRole('button', { name: 'Continue' }).click()
    const before = await page.getByRole('heading', { level: 2 }).allInnerTexts()
    await page.getByRole('button', { name: 'Back to the cards' }).click()
    await page.getByRole('button', { name: /^Where I am .*Read again$/ }).click()
    // A card already turned over goes straight to its text.
    await expect(page.getByRole('button', { name: 'Continue' })).toHaveCount(0)
    expect(await page.getByRole('heading', { level: 2 }).allInnerTexts()).toEqual(before)
  })
})

test.describe('the full reading', () => {
  test('shows all three cards in position order on one screen', async ({ page }) => {
    await completeReading(page)
    const cards = page.getByRole('heading', { level: 2 })
    await expect(cards).toHaveCount(3)
    for (const [i, position] of POSITIONS.entries()) {
      await expect(cards.nth(i)).toContainText(position)
    }
    const names = await cards.allInnerTexts()
    expect(new Set(names).size).toBe(3)
  })

  test('the cards sit side by side on a desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await completeReading(page)
    const boxes = await Promise.all(
      (await page.getByRole('heading', { level: 2 }).all()).map((card) => card.boundingBox()),
    )
    expect(Math.abs(boxes[0]!.y - boxes[2]!.y)).toBeLessThan(2)
    expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x)
    expect(boxes[1]!.x).toBeLessThan(boxes[2]!.x)
    expect(boxes[2]!.x).toBeGreaterThan(640)
  })

  test('the cards stack on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await completeReading(page)
    const boxes = await Promise.all(
      (await page.getByRole('heading', { level: 2 }).all()).map((card) => card.boundingBox()),
    )
    expect(boxes[0]!.y).toBeLessThan(boxes[1]!.y)
    expect(boxes[1]!.y).toBeLessThan(boxes[2]!.y)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })

  test("a card's image can be shown large again and dismissed back to the same place", async ({ page }) => {
    await completeReading(page)
    const view = page.getByRole('button', { name: /^View .* full size$/ }).nth(1)
    await view.click()
    const art = page.getByRole('dialog')
    await expect(art).toBeVisible()
    await expect(art.getByRole('img')).toHaveAccessibleName(/.{40,}/)
    await page.keyboard.press('Escape')
    await expect(art).toBeHidden()
    await expect(view).toBeFocused()
    await view.click()
    await art.getByRole('button', { name: 'Close' }).click()
    await expect(view).toBeFocused()
  })

  test('starting again clears the reading', async ({ page }) => {
    await completeReading(page)
    await page.getByRole('button', { name: 'Start a new reading' }).click()
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
    await expect(page.getByRole('main').locator('img:not([src$="back.webp"])')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Draw three cards' })).toBeVisible()
  })

  test('nothing is lost or dismissed when the screen is left alone', async ({ page }) => {
    await page.clock.install()
    await completeReading(page)
    const before = await page.getByRole('main').innerText()
    await page.clock.fastForward('10:00')
    expect(await page.getByRole('main').innerText()).toBe(before)
  })
})

test('starting again is available throughout a reading', async ({ page }) => {
  await draw(page)
  const again = page.getByRole('button', { name: 'Start again' })
  await expect(again).toBeVisible()
  await turnOver(page)
  await expect(again).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(again).toBeVisible()
  await again.click()
  await expect(heading(page)).toHaveText('The AuDHD Tarot')
  await expect(heading(page)).toBeFocused()
})

test('the options panel leaves a reading in progress untouched', async ({ page }) => {
  await draw(page)
  await turnOver(page)
  await page.getByRole('button', { name: 'Continue' }).click()
  const before = await page.getByRole('main').innerText()
  await page.getByRole('button', { name: 'Options' }).click()
  await page.getByRole('radio', { name: 'Dark' }).check()
  await page.keyboard.press('Escape')
  expect(await page.getByRole('main').innerText()).toBe(before)
})

test('every request during a full reading is to the app itself', async ({ page, context, baseURL }) => {
  const origin = new URL(baseURL!).origin
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await completeReading(page)
  await page.waitForLoadState('networkidle')
  const images = requests.filter((url) => /\/cards\/\d\d\.webp$/.test(url))
  // Only the three drawn cards are fetched, each by its number.
  expect(new Set(images).size).toBe(3)
  for (const url of requests) {
    if (url.startsWith('data:')) continue
    expect(new URL(url).origin, url).toBe(origin)
  }
  expect(await context.cookies()).toEqual([])
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
})
