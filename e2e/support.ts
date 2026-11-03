import { type Page, expect } from '@playwright/test'

export const deck = (page: Page) => page.getByRole('button', { name: /^The deck/ })
export const chooseButton = (page: Page) => page.getByRole('button', { name: 'Choose your cards' })
export const mixAgainButton = (page: Page) => page.getByRole('button', { name: 'Mix again' })
export const layOutButton = (page: Page) => page.getByRole('button', { name: 'Lay out my cards' })
export const faceDownCards = (page: Page) => page.getByRole('button', { name: /^Card \d+ of 22$/ })
export const shuffle = (page: Page) => page.locator('[data-mode]')

/** The card in each of the three spaces, by number, or null where a space is empty. */
export async function handNow(page: Page) {
  return page.locator('[data-slot]').evaluateAll((slots) =>
    slots.map((slot) => {
      const card = slot.getAttribute('data-card')
      return card === null ? null : Number(card)
    }),
  )
}

/**
 * Waits until the first screen has settled into the cloud, or into the still
 * deck where there is no cloud to wait for, so that a test does not change
 * mode halfway through.
 */
export async function settled(page: Page) {
  await page.waitForLoadState('networkidle')
  if (await page.locator('canvas').count()) await expect(shuffle(page)).toHaveAttribute('data-mode', 'cloud')
}

/** Takes any three cards, by the way a keyboard would, in either mode, once the choosing has begun. */
export async function takeThree(page: Page) {
  const cloud = (await shuffle(page).getAttribute('data-mode')) === 'cloud'
  if (cloud) {
    await deck(page).focus()
    for (let i = 0; i < 3; i++) await page.keyboard.press('Enter')
  } else {
    for (let i = 0; i < 3; i++) await faceDownCards(page).first().click()
  }
  await expect(layOutButton(page)).toBeEnabled()
}

/** Moves on to choosing and takes any three cards. */
export async function chooseThree(page: Page) {
  await settled(page)
  await chooseButton(page).click()
  await takeThree(page)
}

/** From the first screen to the three face-down cards on the table. */
export async function layOutCards(page: Page) {
  await chooseThree(page)
  await layOutButton(page).click()
}

/**
 * Carries a card out of the cloud and lets it go over a space. Where the first
 * press lands on empty space and takes no card, it tries the next place.
 */
export async function dragCardToSpace(page: Page, space: number) {
  const stage = (await page.locator('[class*="_stage_"]').boundingBox())!
  const target = (await page.locator(`[data-slot="${space}"]`).boundingBox())!
  const tries = [
    [0.5, 0.5],
    [0.35, 0.45],
    [0.65, 0.45],
    [0.5, 0.3],
    [0.5, 0.65],
    [0.25, 0.6],
    [0.75, 0.6],
    [0.3, 0.3],
    [0.7, 0.3],
  ] as const
  for (const [across, down] of tries) {
    await page.mouse.move(stage.x + stage.width * across, stage.y + stage.height * down)
    await page.mouse.down()
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2 + 30, { steps: 18 })
    await page.mouse.up()
    if ((await handNow(page))[space] !== null) return
  }
  throw new Error(`No card could be carried to space ${space}`)
}
