import { expect, test } from '@playwright/test'
import { cards } from '../src/content/cards'
import {
  chooseButton,
  chooseThree,
  deck,
  faceDownCards,
  handNow,
  layOutButton,
  layOutCards,
  mixAgainButton,
} from './support'

const heading = (page: import('@playwright/test').Page) => page.getByRole('heading', { level: 1 })
const POSITIONS = ['Where I am', 'How I should travel', "Where I'm going next"]

/** Turns over all three cards and returns their names in position order. */
async function readDrawnCards(page: import('@playwright/test').Page) {
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

test.describe('mixing the still deck', () => {
  test('opens on a deck, three empty named spaces, and the way to choose', async ({ page }) => {
    await page.goto('/')
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(deck(page)).toBeVisible()
    for (const position of POSITIONS) await expect(page.getByText(position, { exact: false })).toBeVisible()
    expect(await handNow(page)).toEqual([null, null, null])
    await expect(chooseButton(page)).toBeVisible()
  })

  test('there is no hidden number, no symbols and no draw button any more', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[class*="_glyphs_"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Draw three cards' })).toHaveCount(0)
    await expect(page.getByText('number that picks')).toHaveCount(0)
  })

  test('a tap, any key, or a press from assistive technology shuffles the deck', async ({ page }) => {
    await page.goto('/')
    await deck(page).click()
    await deck(page).focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('s')
    await deck(page).evaluate((el: HTMLElement) => el.click())
    // Shuffling is not choosing, and does not draw.
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
    expect(await handNow(page)).toEqual([null, null, null])
  })

  test('shuffling can go on as long as wanted', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await deck(page).focus()
    for (let minute = 0; minute < 5; minute++) {
      await page.keyboard.press('k')
      await page.clock.fastForward('01:00')
    }
    await expect(heading(page)).toHaveText('The AuDHD Tarot')
    await expect(chooseButton(page)).toBeVisible()
  })

  test('nothing moves: a shuffle is a brief fade and no more', async ({ page }) => {
    await page.goto('/')
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

test.describe('choosing from the face-down cards', () => {
  test('shows 22 face-down cards, with nothing about any of them given away', async ({ page }) => {
    await page.goto('/')
    await chooseButton(page).click()
    await expect(faceDownCards(page)).toHaveCount(22)
    await expect(deck(page)).toHaveCount(0)
    // The names are by place in the layout. Nothing says which card is which.
    const names = await faceDownCards(page).evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    )
    expect(names[0]).toBe('Card 1 of 22')
    expect(names[21]).toBe('Card 22 of 22')
    await expect(page.getByRole('main').locator('img[alt]:not([alt=""])')).toHaveCount(0)
    const identities = await page.locator('[data-card]').count()
    expect(identities).toBe(0)
  })

  test('the card touched is the card in the space', async ({ page }) => {
    await page.goto('/')
    await chooseButton(page).click()
    expect(await handNow(page)).toEqual([null, null, null])
    await faceDownCards(page).nth(4).click()
    const [first] = await handNow(page)
    expect(first).not.toBeNull()
    // That place in the layout is now marked as chosen and cannot be chosen twice.
    const chosen = page.getByRole('button', { name: 'Card 5 of 22, chosen' })
    await expect(chosen).toHaveAttribute('aria-disabled', 'true')
    await chosen.click({ force: true })
    expect((await handNow(page)).filter((card) => card !== null)).toHaveLength(1)
  })

  test('cards go to the spaces in order, three at most, and can be put back', async ({ page }) => {
    await page.goto('/')
    await chooseButton(page).click()
    await expect(layOutButton(page)).toBeDisabled()
    await faceDownCards(page).first().click()
    await faceDownCards(page).first().click()
    const two = await handNow(page)
    expect(two[0]).not.toBeNull()
    expect(two[1]).not.toBeNull()
    expect(two[2]).toBeNull()
    expect(two[0]).not.toBe(two[1])
    await expect(layOutButton(page)).toBeDisabled()

    await faceDownCards(page).first().click()
    await expect(layOutButton(page)).toBeEnabled()
    // A fourth has no space, and says so.
    await faceDownCards(page).first().click()
    expect((await handNow(page)).every((card) => card !== null)).toBe(true)
    await expect(page.getByRole('status')).toHaveText(/spaces are full/)

    // Tapping a card in a space puts it back, and leaves the others where they were.
    const [a, , c] = await handNow(page)
    await page.getByRole('button', { name: 'How I should travel: a card is here. Put it back.' }).click()
    expect(await handNow(page)).toEqual([a, null, c])
    await expect(layOutButton(page)).toBeDisabled()
  })

  test('announces progress politely, by place and never by card', async ({ page }) => {
    await page.goto('/')
    const status = page.getByRole('status')
    await chooseButton(page).click()
    await expect(status).toHaveText(/choose three cards/i)
    await faceDownCards(page).first().click()
    await expect(status).toHaveText('Where I am: a card is chosen. Two more to choose.')
    await faceDownCards(page).first().click()
    await expect(status).toHaveText('How I should travel: a card is chosen. One more to choose.')
    await faceDownCards(page).first().click()
    await expect(status).toHaveText("Where I'm going next: a card is chosen. Three cards chosen. Lay them out when you are ready.")
  })

  test('the three cards laid out are the three cards chosen, in the order of the spaces', async ({ page }) => {
    await page.goto('/')
    await chooseThree(page)
    const chosen = await handNow(page)
    await layOutButton(page).click()
    const headings = await readDrawnCards(page)
    expect(headings).toHaveLength(3)
    chosen.forEach((number, position) => {
      expect(headings[position]).toContain(cards.find((card) => card.number === number)!.name)
    })
  })

  test('mixing again empties the spaces and starts over', async ({ page }) => {
    await page.goto('/')
    await chooseThree(page)
    await mixAgainButton(page).click()
    expect(await handNow(page)).toEqual([null, null, null])
    await expect(chooseButton(page)).toBeVisible()
    await expect(deck(page)).toBeVisible()
    await expect(page.getByRole('status')).toHaveText(/spaces are empty/)
  })

  test('the layout is different each time, so no two shuffles start alike', async ({ page }) => {
    const firsts = new Set<number | null>()
    await page.goto('/')
    for (let i = 0; i < 8; i++) {
      await chooseButton(page).click()
      await faceDownCards(page).first().click()
      firsts.add((await handNow(page))[0]!)
      await mixAgainButton(page).click()
    }
    expect(firsts.size).toBeGreaterThan(2)
  })

  test('two readings in a row are chosen afresh', async ({ page }) => {
    const readings = new Set<string>()
    await page.goto('/')
    for (let i = 0; i < 4; i++) {
      await layOutCards(page)
      await page.getByRole('button', { name: /Turn over$/ }).click()
      readings.add((await heading(page).innerText()).replace(/\s+/g, ' '))
      await page.getByRole('button', { name: 'Start again' }).click()
    }
    expect(readings.size).toBeGreaterThan(1)
  })

  test('starting again leaves empty spaces and a fresh deck', async ({ page }) => {
    await page.goto('/')
    await layOutCards(page)
    await page.getByRole('button', { name: 'Start again' }).click()
    expect(await handNow(page)).toEqual([null, null, null])
    await expect(chooseButton(page)).toBeVisible()
    await expect(page.getByRole('status')).toHaveText('')
  })

  test('the whole thing can be done by keyboard alone', async ({ page }) => {
    await page.goto('/')
    await deck(page).focus()
    await page.keyboard.press('Enter')
    await chooseButton(page).focus()
    await page.keyboard.press('Enter')
    // Focus moves to the cards, and Enter takes one; the chosen card keeps focus, so Tab goes on to the next.
    await expect(faceDownCards(page).first()).toBeFocused()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    expect((await handNow(page)).every((card) => card !== null)).toBe(true)
    await expect(layOutButton(page)).toBeFocused()
    await page.keyboard.press('Space')
    await expect(heading(page)).toHaveText('Your cards')
  })
})
