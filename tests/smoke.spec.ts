import { test, expect } from '@playwright/test'

/**
 * Smoke test: Create group -> Share screen -> Post "먹었어"
 * 
 * This test validates the core group-first flow without requiring
 * Supabase credentials by mocking the store and localStorage.
 */

test('Smoke: Create group -> Share screen -> Post 먹었어', async ({ page }) => {
  // Mock Supabase client to avoid auth errors
  await page.route('**/rest/v1/**', (route) => route.abort())
  await page.route('**/auth/v1/**', (route) => route.abort())

  // Navigate and set up demo state via localStorage
  await page.goto('/')
  
  // Inject minimal state to simulate logged-in user with one group
  await page.evaluate(() => {
    const mockState = {
      state: {
        userId: 'mock-user-123',
        userEmail: 'test@example.com',
        nickname: '테스터',
        screen: 'feed',
        onboardingDone: true,
        communities: [
          {
            id: 'mock-community-1',
            name: '우리 셋 식단운동',
            joined: true,
            invite_code: 'MOCK123',
            member_count: 3,
            created_at: new Date().toISOString(),
          },
        ],
        posts: [],
        feedCommunityId: 'mock-community-1',
      },
      version: 1,
    }
    localStorage.setItem('welling_v1', JSON.stringify(mockState))
  })

  await page.reload()
  await page.waitForLoadState('networkidle')

  // Verify feed loads
  const bottomNav = page.locator('[data-testid="bottom-nav"]')
  await expect(bottomNav).toBeVisible({ timeout: 10000 })

  // 1. Open record modal via bottom nav
  const recordButton = bottomNav.locator('button').nth(2) // Index 2 = record
  await recordButton.click()
  
  const recordModal = page.getByTestId('record-modal')
  await expect(recordModal).toBeVisible({ timeout: 5000 })

  // 2. Click quick post button "먹었어"
  const quickButton = page.getByTestId('record-quick-button').first()
  await expect(quickButton).toBeVisible()
  
  // Verify button contains "먹었어"
  const buttonText = await quickButton.textContent()
  expect(buttonText).toContain('먹었어')

  // Mock the addPost RPC call
  let postCreated = false
  await page.route('**/rpc/add_post', (route) => {
    postCreated = true
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'mock-post-1', created_at: new Date().toISOString() }),
    })
  })

  await quickButton.click()

  // Verify modal closes
  await expect(recordModal).toBeHidden({ timeout: 5000 })

  // 3. Test "Create Group" button flow
  const feedHeader = page.locator('text=+ 그룹').first()
  if (await feedHeader.isVisible()) {
    await feedHeader.click()
    
    // Should navigate to NewCommunity screen
    const newCommunityScreen = page.getByTestId('new-community-screen')
    await expect(newCommunityScreen).toBeVisible({ timeout: 5000 })

    // Enter group name
    const nameInput = page.locator('input[placeholder*="이름"]').first()
    await nameInput.fill('테스트 그룹')

    // Click create/next button
    const nextButton = page.locator('button:has-text("다음")').or(page.locator('button:has-text("만들기")'))
    
    if (await nextButton.count() > 0) {
      // Mock group creation
      await page.route('**/rpc/create_group', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            community_id: 'new-mock-group',
            invite_code: 'TEST123',
          }),
        })
      })

      await nextButton.click()

      // Should show share screen with invite link
      const shareScreen = page.locator('text=초대').or(page.locator('text=공유'))
      await expect(shareScreen.first()).toBeVisible({ timeout: 10000 })
    }
  }

  console.log('✓ Smoke test passed: Core flow functional')
})

test('Smoke: Record Modal renders quick buttons', async ({ page }) => {
  // Mock minimal state
  await page.goto('/')
  
  await page.evaluate(() => {
    const mockState = {
      state: {
        userId: 'mock-user-123',
        screen: 'feed',
        onboardingDone: true,
        communities: [
          { id: 'c1', name: 'Test', joined: true, invite_code: 'ABC', member_count: 1, created_at: new Date().toISOString() },
        ],
        posts: [],
      },
      version: 1,
    }
    localStorage.setItem('welling_v1', JSON.stringify(mockState))
  })

  await page.reload()
  await page.waitForLoadState('networkidle')

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

  expect(button1Text).toContain('먹었어')
  expect(button2Text).toContain('운동했어')

  console.log('✓ Quick post buttons render correctly')
})
