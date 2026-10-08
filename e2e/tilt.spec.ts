import { type Page, expect, test } from '@playwright/test'

const glyphs = (page: Page) => page.locator('[class*="_glyphs_"]')
const shuffle = (page: Page) => page.locator('[data-mode]')
const invitation = (page: Page) => page.getByRole('button', { name: 'Let the cards feel you move' })
const stop = (page: Page) => page.getByRole('button', { name: 'Stop following movement' })
const deck = (page: Page) => page.getByRole('button', { name: /^The deck/ })
const drawButton = (page: Page) => page.getByRole('button', { name: 'Draw three cards' })

// A phone: the invitation is only offered on a device held in the hand.
test.use({ hasTouch: true, viewport: { width: 390, height: 844 } })

/** The phone reports this orientation, in degrees. */
const turn = (page: Page, beta: number, gamma: number) =>
  page.evaluate(
    ([b, g]) => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: b, gamma: g })),
    [beta, gamma] as const,
  )

/** Chromium asks before sharing movement, as an iPhone does. This is the person saying yes. */
const GRANT = `DeviceOrientationEvent.requestPermission = () => Promise.resolve('granted')`

/**
 * Records where the scene's camera is, as `window.cameraX`. The particles sit
 * at the middle of the scene, so the matrix they are drawn with is the
 * camera's own, and its thirteenth number is how far the camera is to one side.
 */
const WATCH_CAMERA = `
  window.cameraX = null
  const gl = WebGL2RenderingContext.prototype
  const names = new WeakMap()
  // Kept for each program: a matrix that has not changed is not sent again.
  const modelViews = new WeakMap()
  let program = null
  const { getUniformLocation, uniformMatrix4fv, drawArrays, useProgram } = gl
  gl.useProgram = function (next) {
    program = next
    return useProgram.call(this, next)
  }
  gl.getUniformLocation = function (program, name) {
    const location = getUniformLocation.call(this, program, name)
    if (location) names.set(location, name)
    return location
  }
  gl.uniformMatrix4fv = function (location, transpose, value, ...rest) {
    if (program && names.get(location) === 'modelViewMatrix') modelViews.set(program, value[12])
    return uniformMatrix4fv.call(this, location, transpose, value, ...rest)
  }
  gl.drawArrays = function (mode, ...rest) {
    if (mode === this.POINTS && modelViews.has(program)) window.cameraX = modelViews.get(program)
    return drawArrays.call(this, mode, ...rest)
  }
`
const cameraX = (page: Page) => page.evaluate(() => (window as unknown as { cameraX: number | null }).cameraX)

/** How many listeners the page has put on the phone's orientation. */
const COUNT_LISTENERS = `
  window.orientationListeners = 0
  const add = window.addEventListener.bind(window)
  const remove = window.removeEventListener.bind(window)
  window.addEventListener = (type, ...rest) => { if (type === 'deviceorientation') window.orientationListeners++; return add(type, ...rest) }
  window.removeEventListener = (type, ...rest) => { if (type === 'deviceorientation') window.orientationListeners--; return remove(type, ...rest) }
`
const listeners = (page: Page) =>
  page.evaluate(() => (window as unknown as { orientationListeners: number }).orientationListeners)

async function openOnCloud(page: Page) {
  await page.goto('/')
  await expect(shuffle(page)).toHaveAttribute('data-mode', 'cloud')
}

test.describe('the invitation', () => {
  test('is offered over the cloud, and nothing is read until it is accepted', async ({ page }) => {
    await page.addInitScript(COUNT_LISTENERS)
    await openOnCloud(page)
    await expect(invitation(page)).toBeVisible()
    expect(await listeners(page)).toBe(0)
    const before = await glyphs(page).innerText()
    await turn(page, 40, 0)
    await turn(page, 60, 25)
    expect(await glyphs(page).innerText()).toBe(before)
  })

  test('tilting the phone shifts the view, and only once it is accepted', async ({ page }) => {
    await page.addInitScript(GRANT)
    await page.addInitScript(WATCH_CAMERA)
    await openOnCloud(page)
    await expect.poll(() => cameraX(page)).toBe(0)

    // Not accepted: the phone is turned well over, and the view does not move.
    await turn(page, 40, 0)
    await turn(page, 40, 30)
    await page.waitForTimeout(500)
    expect(await cameraX(page)).toBe(0)

    await invitation(page).click()
    await turn(page, 40, 0)
    await turn(page, 40, 30)
    await expect.poll(() => cameraX(page).then((x) => Math.abs(x ?? 0))).toBeGreaterThan(0.3)

    // Stopped: the view comes back to the middle and stays there.
    await stop(page).click()
    await turn(page, 40, -30)
    await expect.poll(() => cameraX(page).then((x) => Math.abs(x ?? 1)), { timeout: 10_000 }).toBeLessThan(0.01)
  })

  test('a deliberate sway is an input, and sensor jitter is not', async ({ page }) => {
    await page.addInitScript(GRANT)
    await openOnCloud(page)
    await invitation(page).click()
    // However the phone is held when it starts counts as level.
    await turn(page, 75, 5)
    await expect(stop(page)).toBeVisible()
    const level = await glyphs(page).innerText()
    for (let i = 0; i < 20; i++) await turn(page, 75 + Math.sin(i) * 0.6, 5 + Math.cos(i) * 0.6)
    expect(await glyphs(page).innerText()).toBe(level)

    await turn(page, 75, 20)
    await expect(glyphs(page)).not.toHaveText(level)
  })

  test('it can be stopped, and then moving the phone does nothing', async ({ page }) => {
    await page.addInitScript(COUNT_LISTENERS)
    await page.addInitScript(GRANT)
    await openOnCloud(page)
    await invitation(page).click()
    await turn(page, 30, 0)
    expect(await listeners(page)).toBe(1)

    await stop(page).click()
    await expect(invitation(page)).toBeVisible()
    expect(await listeners(page)).toBe(0)
    const before = await glyphs(page).innerText()
    await turn(page, 30, 30)
    await page.waitForTimeout(300)
    expect(await glyphs(page).innerText()).toBe(before)
  })

  test('holding the cloud still stops following the phone too', async ({ page }) => {
    await page.addInitScript(COUNT_LISTENERS)
    await page.addInitScript(GRANT)
    await openOnCloud(page)
    await invitation(page).click()
    await turn(page, 30, 0)
    await page.getByRole('button', { name: 'Hold still' }).click()
    await expect(shuffle(page)).toHaveAttribute('data-mode', 'still')
    expect(await listeners(page)).toBe(0)
    // Not offered with the still deck.
    await expect(invitation(page)).toHaveCount(0)
    await expect(stop(page)).toHaveCount(0)
    // Back in the cloud it has to be asked for again.
    await page.getByRole('button', { name: 'Let it move' }).click()
    await expect(invitation(page)).toBeVisible()
  })

  test('accepting is not remembered on the next visit', async ({ page }) => {
    await page.addInitScript(COUNT_LISTENERS)
    await page.addInitScript(GRANT)
    await openOnCloud(page)
    await invitation(page).click()
    await turn(page, 30, 0)
    await page.reload()
    await expect(invitation(page)).toBeVisible()
    expect(await listeners(page)).toBe(0)
  })

  test('is not offered with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(drawButton(page)).toBeVisible()
    await expect(invitation(page)).toHaveCount(0)
  })

  test('the whole reading works on a phone that is never moved', async ({ page }) => {
    await openOnCloud(page)
    await deck(page).tap()
    await drawButton(page).tap()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your cards')
  })
})

test.describe('when movement cannot be followed', () => {
  for (const [name, answer] of [
    ['declined', `() => Promise.resolve('denied')`],
    ['not allowed to ask', `() => Promise.reject(new Error('NotAllowedError'))`],
    ['refused outright', `() => { throw new Error('NotAllowedError') }`],
  ]) {
    test(`${name}: the invitation goes, with no error, and the rest works`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.addInitScript(COUNT_LISTENERS)
      await page.addInitScript(`DeviceOrientationEvent.requestPermission = ${answer}`)
      await openOnCloud(page)
      await invitation(page).click()
      await expect(invitation(page)).toHaveCount(0)
      await expect(stop(page)).toHaveCount(0)
      await expect(page.getByRole('alert')).toHaveCount(0)
      expect(await listeners(page)).toBe(0)

      const before = await glyphs(page).innerText()
      await deck(page).tap()
      await expect(glyphs(page)).not.toHaveText(before)
      await drawButton(page).tap()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your cards')
      expect(errors).toEqual([])
    })
  }

  test('granted: the phone is followed once the person agrees', async ({ page }) => {
    await page.addInitScript(COUNT_LISTENERS)
    await page.addInitScript(GRANT)
    await openOnCloud(page)
    await invitation(page).click()
    await expect(stop(page)).toBeVisible()
    expect(await listeners(page)).toBe(1)
  })

  test('a phone with no sensor: the invitation goes quietly when nothing is heard', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript(GRANT)
    await openOnCloud(page)
    await invitation(page).click()
    // It waits a moment for a first reading, hears none, and withdraws.
    await page.waitForTimeout(2000)
    await expect(stop(page)).toHaveCount(0)
    await expect(invitation(page)).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test('a computer, with no sensor to offer, is not invited', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: false })
    const page = await context.newPage()
    await openOnCloud(page)
    await expect(page.getByRole('button', { name: 'Hold still' })).toBeVisible()
    await expect(invitation(page)).toHaveCount(0)
    await context.close()
  })
})
