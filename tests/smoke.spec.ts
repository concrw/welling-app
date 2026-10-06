import { test, expect } from '@playwright/test'

/**
 * Smoke test: Demo mode quick post
 * 
 * Validates entering demo mode and posting using quick buttons.
 */

test('Demo mode: Navigate to demo and post using quick button', async ({ page }) => {
  // Navigate to app
  await page.goto('/')
  
  // Wait for the app to load
  await page.waitForLoadState('networkidle')
  
  // Look for demo button - i18n key is 'skipToDemo' = '데모 보기' (ko) or 'Skip to demo' (en)
  const demoButton = page.locator('button:has-text("데모 보기"), button:has-text("Skip to demo")')
  
  // Wait for button and click it
  await expect(demoButton).toBeVisible({ timeout: 5000 })
  await demoButton.click()

  // Wait for feed to load in demo mode
  const bottomNav = page.locator('[data-testid="bottom-nav"]')
  await expect(bottomNav).toBeVisible({ timeout: 10000 })

  // 1. Open record modal via bottom nav
  const recordButton = bottomNav.locator('button').nth(2) // Index 2 = record
  await recordButton.click()
  
  const recordModal = page.getByTestId('record-modal')
  await expect(recordModal).toBeVisible({ timeout: 5000 })

  // 2. Click quick post button "먹었어" or "운동했어" 
  const quickButtons = page.getByTestId('record-quick-button')
  await expect(quickButtons.first()).toBeVisible()
  
  // Verify button contains meal or exercise text
  const buttonText = await quickButtons.first().textContent()
  expect(buttonText).toMatch(/먹었어|운동했어|Ate|Worked out/)

  // In demo mode, posts are added locally without network calls
  await quickButtons.first().click()

  // Verify modal closes (toast shows and modal disappears)
  await expect(recordModal).toBeHidden({ timeout: 5000 })

  console.log('✓ Smoke test passed: Demo mode and quick post functional')
})

test('Demo mode: Record modal quick buttons render correctly', async ({ page }) => {
  // Navigate to app
  await page.goto('/')
  
  // Wait for the app to load
  await page.waitForLoadState('networkidle')
  
  // Click demo button
  const demoButton = page.locator('button:has-text("데모 보기"), button:has-text("Skip to demo")')
  await expect(demoButton).toBeVisible({ timeout: 5000 })
  await demoButton.click()

  // Wait for feed to load
  const bottomNav = page.locator('[data-testid="bottom-nav"]')
  await expect(bottomNav).toBeVisible({ timeout: 10000 })

  // Open record modal
  const recordBtn = page.locator('[data-testid="bottom-nav"] button').nth(2)
  await recordBtn.click()

  const modal = page.getByTestId('record-modal')
  await expect(modal).toBeVisible({ timeout: 5000 })

  // Check for both quick buttons
  const quickButtons = page.getByTestId('record-quick-button')
  await expect(quickButtons).toHaveCount(2)

  const button1Text = await quickButtons.nth(0).textContent()
  const button2Text = await quickButtons.nth(1).textContent()

  expect(button1Text).toMatch(/먹었어|운동했어|Ate|Worked out/)
  expect(button2Text).toMatch(/먹었어|운동했어|Ate|Worked out/)

  console.log('✓ Quick post buttons render correctly')
})
