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

for (const delayMs of [0, 1000]) {
  test(`Timer posts exactly once with delayed addPost (${delayMs}ms)`, async ({ page }) => {
    await page.clock.install()
    await page.route(/supabase\.co/, (route) => route.abort())
    await page.goto('/')
    await page.clock.runFor(1500)
    await page.locator('button:has-text("데모 보기"), button:has-text("Skip to demo")').first().click()
    await page.clock.runFor(500)

    // Wrap the real addPost: count calls and add latency (simulates a slow network)
    await page.evaluate(async (delay) => {
      const { useAppStore } = await import('/src/store/appStore.ts')
      const w = window as unknown as { __addPostCalls: number }
      w.__addPostCalls = 0
      const orig = useAppStore.getState().addPost
      useAppStore.setState({
        addPost: async (...args: Parameters<typeof orig>) => {
          w.__addPostCalls++
          await new Promise((r) => setTimeout(r, delay))
          return orig(...args)
        },
      })
    }, delayMs)

    await page.locator('[data-testid="bottom-nav"] button').nth(2).click()
    const modal = page.getByTestId('record-modal')
    await expect(modal).toBeVisible()
    const labels = await page.evaluate(async () => {
      const o = (await import('/src/i18n/index.ts')).getMessages().overlays
      return { more: o.showAdvanced, oneMinute: o.minutes(1) }
    })
    await page.getByRole('button', { name: labels.more }).click()

    // ⏱ icon is the sibling button of the first routine quick button in demo data
    await modal.locator('button:text-is("Morning Walk")').locator('xpath=following-sibling::button').click()
    await page.getByRole('button', { name: labels.oneMinute, exact: true }).click()

    await page.clock.runFor(59_000)
    expect(await page.evaluate(() => (window as unknown as { __addPostCalls: number }).__addPostCalls)).toBe(0)
    await page.clock.runFor(3_000 + delayMs)
    await page.clock.runFor(5_000)
    expect(await page.evaluate(() => (window as unknown as { __addPostCalls: number }).__addPostCalls)).toBe(1)
    await expect(modal.locator('button:text-is("Morning Walk")')).toBeVisible()
  })
}

test('Create group -> Share screen (mocked)', async ({ page }) => {
  // Mock the create_group RPC and capture the request body
  let rpcBody: Record<string, unknown> | null = null
  await page.route('**/rest/v1/rpc/create_group', async (route) => {
    rpcBody = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, community_id: 'c1', invite_code: 'ABCD1234' }),
    })
  })

  await page.goto('/')
  const demoButton = page.locator('button:has-text("데모 보기"), button:has-text("Skip to demo")')
  await expect(demoButton).toBeVisible({ timeout: 10000 })
  await demoButton.click()

  const bottomNav = page.locator('[data-testid="bottom-nav"]')
  await expect(bottomNav).toBeVisible({ timeout: 10000 })

  // The entry point is the "+ 그룹" / "+ Group" pill in the feed header (a <div>, not a <button>)
  const createGroupPill = page.getByText(/^\+ (그룹|Group)$/)
  await expect(createGroupPill).toBeVisible({ timeout: 5000 })
  await createGroupPill.click()

  // NewCommunity screen: name input + "그룹 만들기" button
  const groupNameInput = page.getByPlaceholder('우리 셋 식단운동')
  await expect(groupNameInput).toBeVisible({ timeout: 5000 })
  const createButton = page.getByRole('button', { name: '그룹 만들기' })
  await expect(createButton).toBeDisabled()
  await groupNameInput.fill('Test Group')
  await expect(createButton).toBeEnabled()
  await createButton.click()

  // Share screen shows the invite link built from the mocked invite_code
  await expect(page.getByText(/\/\?invite=ABCD1234$/)).toBeVisible({ timeout: 5000 })
  expect(rpcBody).toEqual({ p_name: 'Test Group', p_desc: '', p_visibility: 'private' })
})
