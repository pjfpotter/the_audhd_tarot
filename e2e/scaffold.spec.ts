import { expect, test } from '@playwright/test'

test('the app loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('The AuDHD Tarot')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The AuDHD Tarot')
})
