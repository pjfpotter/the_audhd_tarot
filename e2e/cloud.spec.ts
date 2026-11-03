import AxeBuilder from '@axe-core/playwright'
import { type Page, expect, test } from '@playwright/test'
import { cards } from '../src/content/cards'
import {
  chooseButton,
  chooseThree,
  deck,
  dragCardToSpace,
  handNow,
  layOutButton,
  mixAgainButton,
  settled,
  shuffle,
} from './support'

const heading = (page: Page) => page.getByRole('heading', { level: 1 })
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

/**
 * A rough picture of the canvas: how many of the pixels in a band of the
 * stage are not the page colour, which is roughly how much of it is cards.
 */
async function coverage(page: Page) {
  return page.evaluate(async () => {
    await new Promise(requestAnimationFrame)
    const source = document.querySelector('canvas')!
    const scale = 0.25
    const copy = document.createElement('canvas')
    copy.width = Math.round(source.width * scale)
    copy.height = Math.round(source.height * scale)
    const context = copy.getContext('2d')!
    context.drawImage(source, 0, 0, copy.width, copy.height)
    const stage = document.querySelector('[class*="_stage_"]')!.getBoundingClientRect()
    const ratio = copy.width / window.innerWidth
    const background = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    const probe = document.createElement('canvas').getContext('2d')!
    probe.fillStyle = background
    probe.fillRect(0, 0, 1, 1)
    const [br, bg, bb] = probe.getImageData(0, 0, 1, 1).data
    const width = copy.width
    const pixels = context.getImageData(0, 0, copy.width, copy.height).data
    const share = (left: number, right: number) => {
      let cards = 0
      let total = 0
      for (let y = Math.round(stage.top * ratio); y < Math.round(stage.bottom * ratio); y++) {
        for (let x = Math.round(left * width); x < Math.round(right * width); x++) {
          const i = (y * width + x) * 4
          total++
          if (Math.abs(pixels[i]! - br!) + Math.abs(pixels[i + 1]! - bg!) + Math.abs(pixels[i + 2]! - bb!) > 90) cards++
        }
      }
      return cards / total
    }
    return { left: share(0, 0.33), middle: share(0.33, 0.67), right: share(0.67, 1) }
  })
}

test.describe('mixing the cloud', () => {
  test('is the deck on the first screen, drawn on a canvas hidden from screen readers', async ({ page }) => {
    await openOnCloud(page)
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    await expect(canvas).toHaveAttribute('aria-hidden', 'true')
    await expect(deck(page)).toHaveAccessibleName('The deck. Drag to mix the cards, or press any key.')
    expect((await coverage(page)).middle).toBeGreaterThan(0.2)
  })

  test('has three empty spaces, named for the three positions, ready for the cards', async ({ page }) => {
    await openOnCloud(page)
    expect(await handNow(page)).toEqual([null, null, null])
    for (const position of ['Where I am', 'How I should travel', "Where I'm going next"]) {
      await expect(page.getByText(position)).toBeVisible()
    }
    await expect(page.getByRole('button', { name: 'Draw three cards' })).toHaveCount(0)
    await expect(page.locator('[class*="_glyphs_"]')).toHaveCount(0)
  })

  test('a tap, a drag and an arrow key mix the cards, and none of them throws them out of sight', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await openOnCloud(page)
    await page.waitForTimeout(800)
    const box = (await deck(page).boundingBox())!
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2

    await page.mouse.click(x, y)
    await deck(page).focus()
    await page.keyboard.press('ArrowLeft')

    // A hard, fast scrub across the whole stage, over and over.
    await page.mouse.move(x, y)
    await page.mouse.down()
    for (let i = 0; i < 50; i++) {
      await page.mouse.move(box.x + (i % 2 ? box.width * 0.95 : box.width * 0.05), box.y + ((i * 37) % box.height), {
        steps: 2,
      })
    }
    await page.mouse.up()

    // Still all there: cards in the middle of the stage, and none of the rest of the screen has taken them.
    const spread = await coverage(page)
    expect(spread.middle).toBeGreaterThan(0.2)
    await page.waitForTimeout(2500)
    expect((await coverage(page)).middle).toBeGreaterThan(0.2)
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
  })

  test('moving the mouse without pressing does nothing to the cards', async ({ page }) => {
    await page.addInitScript(COUNT_FRAMES)
    await openOnCloud(page)
    await page.mouse.move(100, 200)
    await page.mouse.move(250, 300, { steps: 10 })
    expect(await handNow(page)).toEqual([null, null, null])
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
  })

  test('no two clouds start alike', async ({ browser }) => {
    const looks: string[] = []
    for (let visit = 0; visit < 2; visit++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      await openOnCloud(page)
      const look = await page.evaluate(async () => {
        await new Promise(requestAnimationFrame)
        const source = document.querySelector('canvas')!
        const copy = document.createElement('canvas')
        copy.width = 24
        copy.height = 48
        const context = copy.getContext('2d')!
        context.drawImage(source, 0, 0, 24, 48)
        return [...context.getImageData(0, 0, 24, 48).data].filter((_, i) => i % 4 !== 3).join(',')
      })
      looks.push(look)
      await context.close()
    }
    expect(looks[1]).not.toBe(looks[0])
  })
})

test.describe('choosing from the cloud', () => {
  test('moves on when asked, keeps the spaces empty, and puts the keyboard on the deck', async ({ page }) => {
    await openOnCloud(page)
    await chooseButton(page).click()
    await expect(page.getByText('Drag three cards into the spaces.')).toBeVisible()
    await expect(layOutButton(page)).toBeDisabled()
    await expect(mixAgainButton(page)).toBeVisible()
    await expect(deck(page)).toBeFocused()
    await expect(page.getByRole('status')).toHaveText(/choose three cards/i)
    expect(await handNow(page)).toEqual([null, null, null])
  })

  test('a card dragged to a space stays there, and the space shows where it will go', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await openOnCloud(page)
    await chooseButton(page).click()
    const stage = (await page.locator('[class*="_stage_"]').boundingBox())!
    const second = (await page.locator('[data-slot="1"]').boundingBox())!

    // Take hold of a card, and carry it over the second space.
    await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2)
    await page.mouse.down()
    await page.mouse.move(second.x + second.width / 2, second.y + second.height / 2 + 30, { steps: 15 })
    // While it is held over a space, that space says so, if a card was taken.
    const over = await page.locator('[data-slot="1"][data-over]').count()
    await page.mouse.up()
    const hand = await handNow(page)
    if (over) expect(hand[1]).not.toBeNull()
    if (hand[1] === null) {
      // Nothing was under the first press; carry another.
      await dragCardToSpace(page, 1)
    }
    const [none, taken, other] = await handNow(page)
    expect(none).toBeNull()
    expect(taken).not.toBeNull()
    expect(other).toBeNull()
    await expect(page.locator('[data-slot][data-over]')).toHaveCount(0)
  })

  test('three cards carried to the three spaces are the three cards laid out, in order', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await openOnCloud(page)
    await chooseButton(page).click()
    await dragCardToSpace(page, 2)
    await dragCardToSpace(page, 0)
    await dragCardToSpace(page, 1)
    const hand = await handNow(page)
    expect(hand.every((card) => card !== null)).toBe(true)
    expect(new Set(hand).size).toBe(3)
    await expect(layOutButton(page)).toBeEnabled()
    await expect(page.getByText('Three cards chosen.').first()).toBeVisible()

    await layOutButton(page).click()
    const headings = await readDrawnCards(page)
    expect(headings).toHaveLength(3)
    hand.forEach((number, position) => {
      expect(headings[position]).toContain(cards.find((card) => card.number === number)!.name)
    })
  })

  test('a card let go anywhere but over a space goes back among the others', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await openOnCloud(page)
    await chooseButton(page).click()
    const stage = (await page.locator('[class*="_stage_"]').boundingBox())!
    await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2)
    await page.mouse.down()
    await page.mouse.move(stage.x + 40, stage.y + 60, { steps: 10 })
    await page.mouse.up()
    expect(await handNow(page)).toEqual([null, null, null])
    await expect(layOutButton(page)).toBeDisabled()
  })

  test('a card in a space is tapped to put it back, and can then be carried again', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await openOnCloud(page)
    await chooseButton(page).click()
    await dragCardToSpace(page, 0)
    // In the cloud the card itself is drawn by the cloud, so the space holds no picture of its own.
    expect((await handNow(page))[0]).not.toBeNull()
    await expect(page.locator('[data-slot="0"] img')).toHaveCount(0)
    await page.getByRole('button', { name: 'Where I am: a card is here. Put it back.' }).click()
    expect(await handNow(page)).toEqual([null, null, null])
    await dragCardToSpace(page, 0)
    expect((await handNow(page))[0]).not.toBeNull()
  })

  test('with all three spaces full, another card cannot be carried in', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await openOnCloud(page)
    await chooseButton(page).click()
    for (const space of [0, 1, 2]) await dragCardToSpace(page, space)
    const full = await handNow(page)
    const stage = (await page.locator('[class*="_stage_"]').boundingBox())!
    const target = (await page.locator('[data-slot="1"]').boundingBox())!
    await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2)
    await page.mouse.down()
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2 + 30, { steps: 12 })
    await page.mouse.up()
    expect(await handNow(page)).toEqual(full)
  })

  test('the keyboard takes the card nearest the middle, one for each space', async ({ page }) => {
    await openOnCloud(page)
    await chooseButton(page).click()
    await expect(deck(page)).toBeFocused()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')
    const two = await handNow(page)
    expect(two[0]).not.toBeNull()
    expect(two[1]).not.toBeNull()
    expect(two[0]).not.toBe(two[1])
    // Arrow keys still stir, and other keys take nothing.
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('x')
    expect(await handNow(page)).toEqual(two)
    await page.keyboard.press('Enter')
    const three = await handNow(page)
    expect(new Set(three).size).toBe(3)
    // The third card takes focus to the way forward.
    await expect(layOutButton(page)).toBeFocused()
    await expect(layOutButton(page)).toBeEnabled()
    await layOutButton(page).click()
    await expect(heading(page)).toHaveText('Your cards')
    await expect(page.getByRole('button', { name: 'Where I am Turn over' })).toBeFocused()
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  test('mixing again sends the cards back and empties the spaces', async ({ page }) => {
    await openOnCloud(page)
    await chooseThree(page)
    await mixAgainButton(page).click()
    expect(await handNow(page)).toEqual([null, null, null])
    await expect(chooseButton(page)).toBeVisible()
    await expect(deck(page)).toBeFocused()
    // And the same three can be chosen once more.
    await chooseButton(page).click()
    await page.keyboard.press('Enter')
    expect((await handNow(page))[0]).not.toBeNull()
  })

  test('a press from assistive technology takes a card in the same way', async ({ page }) => {
    await openOnCloud(page)
    await chooseButton(page).click()
    await deck(page).evaluate((el: HTMLElement) => el.click())
    expect((await handNow(page))[0]).not.toBeNull()
  })
})

test.describe('loading the scene', () => {
  test('the first screen is complete and can be chosen from before the scene arrives', async ({ page }) => {
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

    await deck(page).click()
    await chooseButton(page).click()
    await page.getByRole('button', { name: /^Card \d+ of 22$/ }).first().click()
    expect((await handNow(page))[0]).not.toBeNull()
    release()
  })

  test('a card chosen on the still deck is still chosen when the cloud arrives', async ({ page }) => {
    let release = () => {}
    const held = new Promise<void>((resolve) => (release = resolve))
    await page.route(SCENE_CHUNK, async (route) => {
      await held
      await route.continue()
    })
    await page.goto('/')
    await chooseButton(page).click()
    await page.getByRole('button', { name: /^Card \d+ of 22$/ }).first().click()
    const hand = await handNow(page)
    release()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'cloud')
    expect(await handNow(page)).toEqual(hand)
    await expect(page.getByRole('button', { name: 'Where I am: a card is here. Put it back.' })).toBeVisible()
  })

  test('the scene is not fetched with reduced motion', async ({ page }) => {
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url()))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await chooseThree(page)
    await layOutButton(page).click()
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
    await expect(chooseButton(page)).toBeVisible()
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(deck(page).locator('img')).toHaveCount(3)
    // The control for holding the cloud still has nothing to hold.
    await expect(holdStill(page)).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
    await deck(page).click()
    await chooseThree(page)
    await layOutButton(page).click()
    await expect(heading(page)).toHaveText('Your cards')
    expect(errors).toEqual([])
  })

  test('a scene that stops working gives way to the face-down cards, keeping what was chosen', async ({ page }) => {
    await openOnCloud(page)
    await chooseButton(page).click()
    await page.keyboard.press('Enter')
    const hand = await handNow(page)
    expect(hand[0]).not.toBeNull()
    await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
      context!.getExtension('WEBGL_lose_context')!.loseContext()
    })
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(page.locator('canvas')).toHaveCount(0)
    expect(await handNow(page)).toEqual(hand)
    await page.getByRole('button', { name: /^Card \d+ of 22$/ }).first().click()
    await page.getByRole('button', { name: /^Card \d+ of 22$/ }).first().click()
    await layOutButton(page).click()
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

    await holdStill(page).click()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(deck(page).locator('img')).toHaveCount(3)
    await page.waitForTimeout(300)
    expect(await animating(page)).toBe(false)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)

    await page.getByRole('button', { name: 'Let it move' }).click()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'cloud')
  })

  test('holding still in the middle of choosing keeps the cards chosen, as face-down cards', async ({ page }) => {
    await openOnCloud(page)
    await chooseButton(page).click()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')
    const hand = await handNow(page)

    await holdStill(page).click()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    await expect(page.getByRole('button', { name: /^Card \d+ of 22$/ })).toHaveCount(20)
    await expect(page.getByRole('button', { name: /^Card \d+ of 22, chosen$/ })).toHaveCount(2)
    expect(await handNow(page)).toEqual(hand)

    await page.getByRole('button', { name: 'Let it move' }).click()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'cloud')
    expect(await handNow(page)).toEqual(hand)
    await page.keyboard.press('Tab')
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
    await expect(chooseButton(page)).toBeVisible()
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
  test(`no WCAG 2.2 AA violations on the cloud, mixing and choosing, ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await openOnCloud(page)
    const audit = async () =>
      (
        await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
      ).violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join('; ')})`)
    expect(await audit()).toEqual([])
    await chooseButton(page).click()
    await page.keyboard.press('Enter')
    expect(await audit()).toEqual([])
  })
}

test('every control over the cloud is at least 44 by 44 CSS pixels and has a name', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await openOnCloud(page)
  const check = async () => {
    const controls = await page.locator('button').evaluateAll((buttons) =>
      buttons.filter((button) => button.checkVisibility()).map((button) => {
        const { width, height } = button.getBoundingClientRect()
        return { name: button.getAttribute('aria-label') || button.textContent, width, height }
      }),
    )
    expect(controls.length).toBeGreaterThanOrEqual(3)
    for (const control of controls) {
      expect(control.name, JSON.stringify(control)).toBeTruthy()
      expect(control.width, JSON.stringify(control)).toBeGreaterThanOrEqual(44)
      expect(control.height, JSON.stringify(control)).toBeGreaterThanOrEqual(44)
    }
  }
  await check()
  await chooseButton(page).click()
  await page.keyboard.press('Enter')
  await check()
})

test('settled waits for the cloud, so a test never changes mode halfway', async ({ page }) => {
  await page.goto('/')
  await settled(page)
  await expect(shuffle(page)).toHaveAttribute('data-mode', 'cloud')
})
