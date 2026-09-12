import { test, expect, Page } from '@playwright/test'

const nav = (page: Page) => page.locator('[data-testid="bottom-nav"] button')

const openFeed = async (page: Page) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const demoBtn = page.getByRole('button', { name: 'Skip to demo' })
  if (await demoBtn.count() > 0) await demoBtn.click()
  await expect(nav(page).first()).toBeVisible()
}

const state = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('welling_v1')!).state)

test('Home nudge does NOT show on first record alone', async ({ page }) => {
  await openFeed(page)
  
  // Open record modal once (recordUseCount = 1, feedVisitCount = 0)
  await nav(page).nth(2).click() // Record button
  await expect(page.locator('[data-testid="record-modal"]')).toBeVisible()
  
  // Submit a post
  await page.locator('[data-testid="record-input"]').fill('First record')
  await page.locator('[data-testid="record-submit"]').click()
  
  // HomePrompt should NOT appear (recordUseCount: 1, feedVisitCount: 0, but not greater)
  await expect(page.locator('text=기록 화면을 홈 화면으로 설정할까요?')).toHaveCount(0)
  
  const stateData = await state(page)
  expect(stateData.hasPromptedHome).toBe(false)
})

test('Home nudge shows when record usage exceeds feed usage', async ({ page }) => {
  await openFeed(page)
  
  // Visit feed once (feedVisitCount = 1)
  // (already on feed from openFeed)
  
  // Use record twice (recordUseCount = 2)
  await nav(page).nth(2).click() // Record button - count 1
  await expect(page.locator('[data-testid="record-modal"]')).toBeVisible()
  await page.locator('[data-testid="record-close"]').click()
  
  await nav(page).nth(2).click() // Record button - count 2
  await expect(page.locator('[data-testid="record-modal"]')).toBeVisible()
  
  // Submit a post (recordUseCount: 2 > feedVisitCount: 1)
  await page.locator('[data-testid="record-input"]').fill('Second record')
  await page.locator('[data-testid="record-submit"]').click()
  
  // HomePrompt SHOULD appear
  await expect(page.locator('text=기록 화면을 홈 화면으로 설정할까요?')).toBeVisible()
  
  const stateData = await state(page)
  expect(stateData.hasPromptedHome).toBe(true)
})

test('Home nudge does NOT re-appear after "Later" (dismissHomePrompt)', async ({ page }) => {
  await openFeed(page)
  
  // Set up state: record > feed
  await nav(page).nth(2).click() // Record 1
  await page.locator('[data-testid="record-close"]').click()
  await nav(page).nth(2).click() // Record 2
  await page.locator('[data-testid="record-input"]').fill('First post')
  await page.locator('[data-testid="record-submit"]').click()
  
  // Prompt should appear
  await expect(page.locator('text=기록 화면을 홈 화면으로 설정할까요?')).toBeVisible()
  
  // Click "Later" (dismissHomePrompt)
  await page.getByText('나중에요').click()
  
  let stateData = await state(page)
  expect(stateData.hasPromptedHome).toBe(true)
  expect(stateData.homeScreenIsRecord).toBe(false)
  
  // Create another post
  await nav(page).nth(2).click() // Record 3
  await page.locator('[data-testid="record-input"]').fill('Second post')
  await page.locator('[data-testid="record-submit"]').click()
  
  // Prompt should NOT appear again
  await expect(page.locator('text=기록 화면을 홈 화면으로 설정할까요?')).toHaveCount(0)
  
  stateData = await state(page)
  expect(stateData.hasPromptedHome).toBe(true)
  expect(stateData.homeScreenIsRecord).toBe(false)
})

test('Home nudge "Set it" enables homeScreenIsRecord', async ({ page }) => {
  await openFeed(page)
  
  // Set up state: record > feed
  await nav(page).nth(2).click()
  await page.locator('[data-testid="record-close"]').click()
  await nav(page).nth(2).click()
  await page.locator('[data-testid="record-input"]').fill('Test post')
  await page.locator('[data-testid="record-submit"]').click()
  
  // Prompt should appear
  await expect(page.locator('text=기록 화면을 홈 화면으로 설정할까요?')).toBeVisible()
  
  // Click "Set it" (acceptHomePrompt)
  await page.getByText('네, 설정할게요').click()
  
  const stateData = await state(page)
  expect(stateData.hasPromptedHome).toBe(true)
  expect(stateData.homeScreenIsRecord).toBe(true)
  
  // Reload and verify record modal opens
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="record-modal"]')).toBeVisible()
})

test('Settings can still change home screen after dismissing prompt', async ({ page }) => {
  await openFeed(page)
  
  // Trigger and dismiss prompt
  await nav(page).nth(2).click()
  await page.locator('[data-testid="record-close"]').click()
  await nav(page).nth(2).click()
  await page.locator('[data-testid="record-input"]').fill('Test')
  await page.locator('[data-testid="record-submit"]').click()
  await page.getByText('나중에요').click()
  
  // Go to Settings and change to record
  await page.evaluate(() => (window as any).__store?.getState().navigate('settings-home-screen'))
  await page.locator('[data-testid="home-screen-option-record"]').click()
  
  const stateData = await state(page)
  expect(stateData.homeScreenIsRecord).toBe(true)
})
