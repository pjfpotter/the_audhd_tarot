import AxeBuilder from '@axe-core/playwright'
import { type Page, expect, test } from '@playwright/test'

const THEMES = ['light', 'dark'] as const

/** Presses Tab until the control with this name has focus, then checks its focus ring shows. */
async function tabTo(page: Page, name: string | RegExp) {
  const target = page.getByRole('button', { name })
  for (let presses = 0; presses < 20; presses++) {
    await page.keyboard.press('Tab')
    if (await target.first().evaluate((el) => el === document.activeElement).catch(() => false)) {
      await expectFocusRing(page)
      return
    }
  }
  throw new Error(`Tab never reached "${name}"`)
}

async function expectFocusRing(page: Page) {
  const ring = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement!)
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) }
  })
  expect(ring.style).not.toBe('none')
  expect(ring.width).toBeGreaterThanOrEqual(2)
}

for (const theme of THEMES) {
  test(`a whole reading by keyboard alone, ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.goto('/')
    const heading = page.getByRole('heading', { level: 1 })

    // The deck is shuffled by any key, and Tab still leaves it.
    await tabTo(page, /^The deck/)
    const glyphs = page.locator('[class*="_glyphs_"]')
    const before = await glyphs.innerText()
    await page.keyboard.press('Enter')
    await page.keyboard.press('s')
    await expect(glyphs).not.toHaveText(before)

    await tabTo(page, 'Draw three cards')
    await page.keyboard.press('Space')
    await expect(heading).toHaveText('Your cards')

    for (const close of ['Back to the cards', 'Back to the cards', 'See the whole reading']) {
      // Focus is already on the card to turn over.
      await expect(page.getByRole('button', { name: /Turn over$/ })).toBeFocused()
      await expectFocusRing(page)
      await page.keyboard.press('Enter')
      await tabTo(page, 'Continue')
      await page.keyboard.press('Space')
      await expect(heading).toBeFocused()
      await tabTo(page, close)
      await page.keyboard.press('Enter')
    }
    await expect(heading).toHaveText('Your reading')

    await tabTo(page, /^View .* full size$/)
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()

    // Backwards works too: Shift+Tab from the first image reaches the top bar.
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('button', { name: 'Options' })).toBeFocused()
    await expectFocusRing(page)

    await tabTo(page, 'Start a new reading')
    await page.keyboard.press('Enter')
    await expect(heading).toHaveText('The AuDHD Tarot')
    await expect(glyphs).toHaveText(before)
  })
}

/** Runs `check` on every screen of the app, including both dialogs. */
async function onEveryScreen(page: Page, check: (screen: string) => Promise<void>) {
  await page.goto('/')
  await check('shuffle')

  await page.getByRole('button', { name: 'Options' }).click()
  await check('options panel')
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: /^The deck/ }).click()
  await check('shuffle, after a beat')

  await page.getByRole('button', { name: 'Draw three cards' }).click()
  await check('cards face down')

  await page.getByRole('button', { name: /Turn over$/ }).click()
  await check('art moment')

  await page.getByRole('button', { name: 'Continue' }).click()
  await check('card text')

  await page.getByRole('button', { name: 'Back to the cards' }).click()
  await check('cards, one turned over')

  for (const close of ['Back to the cards', 'See the whole reading']) {
    await page.getByRole('button', { name: /Turn over$/ }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: close }).click()
  }
  await check('full reading')

  await page.getByRole('button', { name: /^View .* full size$/ }).first().click()
  await check('card image, full size')
}

for (const theme of THEMES) {
  test(`no WCAG 2.2 AA violations on any screen, ${theme} theme`, async ({ page }) => {
    // Motion off, so nothing is audited halfway through a fade.
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
    await onEveryScreen(page, async (screen) => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()
      const violations = results.violations.map(
        (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join('; ')})`,
      )
      expect(violations, screen).toEqual([])
    })
  })
}

test('every control is at least 44 by 44 CSS pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await onEveryScreen(page, async (screen) => {
    const small = await page.evaluate(() => {
      const top = document.querySelector('dialog[open]') ?? document
      return [...top.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea')]
        .filter((control) => control.checkVisibility())
        .map((control) => {
          // A radio's target is the whole labelled row.
          const target = control.matches('input') ? (control.closest('label') ?? control) : control
          const { width, height } = target.getBoundingClientRect()
          return { name: (target.innerText || control.getAttribute('aria-label') || '').trim(), width, height }
        })
        .filter(({ width, height }) => width < 44 || height < 44)
    })
    expect(small, screen).toEqual([])
  })
})

test('reading text is at least 16px and no text is under 14px', async ({ page }) => {
  await onEveryScreen(page, async (screen) => {
    const sizes = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const found: { text: string; size: number; reading: boolean }[] = []
      while (walker.nextNode()) {
        const node = walker.currentNode
        const el = node.parentElement!
        if (!node.textContent?.trim() || el.closest('script, style, noscript, .visually-hidden')) continue
        if (!el.checkVisibility()) continue
        found.push({
          text: node.textContent.trim().slice(0, 40),
          size: parseFloat(getComputedStyle(el).fontSize),
          // Essence, question, gift and shadow text: paragraphs of the card body, apart from their labels.
          reading: !!el.closest('[class*="_body_"]') && el.tagName === 'P',
        })
      }
      return found
    })
    expect(sizes.length, screen).toBeGreaterThan(0)
    expect(sizes.filter((s) => s.size < 14), screen).toEqual([])
    expect(sizes.filter((s) => s.reading && s.size < 16), screen).toEqual([])
    if (screen === 'card text' || screen === 'full reading') {
      expect(sizes.filter((s) => s.reading).length, screen).toBeGreaterThan(3)
    }
  })
})

test('decoration is hidden from screen readers and every control has a name', async ({ page }) => {
  await onEveryScreen(page, async (screen) => {
    const unnamed = await page.evaluate(() => {
      const top = document.querySelector('dialog[open]') ?? document
      return [...top.querySelectorAll<HTMLElement>('button, input')]
        .filter((control) => control.checkVisibility())
        .filter((control) => {
          const labelledBy = control.getAttribute('aria-labelledby')
          const name =
            control.getAttribute('aria-label') ||
            (labelledBy && labelledBy.split(' ').map((id) => document.getElementById(id)?.textContent).join(' ')) ||
            control.closest('label')?.textContent ||
            control.textContent
          return !name?.trim()
        })
        .map((control) => control.outerHTML.slice(0, 80))
    })
    expect(unnamed, screen).toEqual([])
    // Card thumbnails repeat a name given in text beside them, so they carry no alt text.
    const images = await page.locator('main img, dialog[open] img').evaluateAll((imgs) =>
      imgs.map((img) => img.hasAttribute('alt')),
    )
    expect(images.every(Boolean), screen).toBe(true)
  })
})
