import { type Page, expect, test } from '@playwright/test'

const html = (page: Page) => page.locator('html')
const openOptions = (page: Page) => page.getByRole('button', { name: 'Options' }).click()
const panel = (page: Page) => page.getByRole('dialog', { name: 'Options' })
const choose = (page: Page, group: string, choice: string) =>
  panel(page).getByRole('group', { name: group }).getByRole('radio', { name: choice }).check()

test.describe('choices take effect at once', () => {
  test('theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await openOptions(page)
    await expect(panel(page).getByRole('radio', { name: 'Match my device' }).first()).toBeChecked()
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await choose(page, 'Theme', 'Light')
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
    await choose(page, 'Theme', 'Dark')
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await choose(page, 'Theme', 'Match my device')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })

  test('motion', async ({ page }) => {
    await page.goto('/')
    await expect(html(page)).toHaveAttribute('data-motion', 'full')
    await openOptions(page)
    await choose(page, 'Motion', 'Reduced')
    await expect(html(page)).toHaveAttribute('data-motion', 'reduced')
    await choose(page, 'Motion', 'Match my device')
    await expect(html(page)).toHaveAttribute('data-motion', 'full')
  })

  test('text size, in four steps up to 150%', async ({ page }) => {
    await page.goto('/')
    await openOptions(page)
    const sizes = panel(page).getByRole('group', { name: 'Text size' }).getByRole('radio')
    await expect(sizes).toHaveCount(4)
    const rootSize = () => html(page).evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    expect(await rootSize()).toBe(16)
    await choose(page, 'Text size', 'Largest')
    expect(await rootSize()).toBe(24)
  })
})

test.describe('the panel', () => {
  test('opens from every screen and leaves the person where they were', async ({ page }) => {
    await page.goto('/')
    await openOptions(page)
    await expect(panel(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel(page)).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The AuDHD Tarot')

    await page.getByRole('button', { name: 'Begin a reading' }).click()
    await openOptions(page)
    await choose(page, 'Theme', 'Dark')
    await panel(page).getByRole('button', { name: 'Close options' }).click()
    await expect(panel(page)).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The draw')
  })

  test('keeps keyboard focus inside, closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/')
    const opener = page.getByRole('button', { name: 'Options' })
    await opener.focus()
    await page.keyboard.press('Enter')
    await expect(panel(page)).toBeVisible()

    const focusIsInPanel = () =>
      page.evaluate(() => {
        const active = document.activeElement
        // Focus may pass through the browser's own controls, never the page behind.
        return active === document.body || !!active?.closest('dialog')
      })
    expect(await focusIsInPanel()).toBe(true)
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      expect(await focusIsInPanel()).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(panel(page)).toBeHidden()
    await expect(opener).toBeFocused()
  })

  test('can be used by keyboard alone', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.getByRole('button', { name: 'Options' }).focus()
    await page.keyboard.press('Space')
    await panel(page).getByRole('radio', { name: 'Match my device' }).first().focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
  })
})

test.describe('remembering choices', () => {
  test('choices are applied on the next visit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await openOptions(page)
    await choose(page, 'Theme', 'Dark')
    await choose(page, 'Text size', 'Largest')
    await page.reload()
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    expect(await html(page).evaluate((el) => getComputedStyle(el).fontSize)).toBe('24px')
    await openOptions(page)
    await expect(panel(page).getByRole('radio', { name: 'Dark' })).toBeChecked()
    await expect(panel(page).getByRole('radio', { name: 'Largest' })).toBeChecked()
  })

  test('choices still apply for the visit when storage is blocked', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('blocked', 'SecurityError')
        },
      })
    })
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await openOptions(page)
    await choose(page, 'Theme', 'Dark')
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    expect(errors).toEqual([])
  })
})

test('at the largest text size on a small phone, everything fits by scrolling down only', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')
  await openOptions(page)
  await choose(page, 'Text size', 'Largest')

  const fits = (selector: string) =>
    page.evaluate((s) => {
      const el = document.querySelector(s)!
      return el.scrollWidth <= el.clientWidth
    }, selector)

  expect(await fits('dialog')).toBe(true)
  await panel(page).getByRole('button', { name: 'Close options' }).click()
  expect(await fits('html')).toBe(true)
  await expect(page.getByRole('button', { name: 'Begin a reading' })).toBeVisible()
  await page.getByRole('button', { name: 'Begin a reading' }).click()
  expect(await fits('html')).toBe(true)
})
