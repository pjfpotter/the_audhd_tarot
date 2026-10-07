// Not a test: writes screenshots of each screen for visual review.
//   node e2e/screenshots.mjs <out-dir>   (with `npm run preview` running on 4173)
import { chromium } from '@playwright/test'

const out = process.argv[2] ?? 'test-results/screens'
const browser = await chromium.launch()
for (const [name, width, height] of [['phone', 360, 740], ['desktop', 1280, 800]]) {
  for (const colorScheme of ['dark', 'light']) {
    const page = await browser.newPage({ viewport: { width, height }, colorScheme })
    await page.goto('http://localhost:4173/')
    await page.screenshot({ path: `${out}/landing-${name}-${colorScheme}.png` })
    await page.close()
  }
}
await browser.close()
