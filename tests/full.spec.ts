import { test, expect, Page } from '@playwright/test'

const S = 'test-results/screenshots'

const ss = (page: Page, name: string) =>
  page.screenshot({ path: `${S}/${name}.png`, fullPage: true })

const skipOnboarding = (page: Page) =>
  page.evaluate(() => {
    const raw = localStorage.getItem('welling_v1')
    if (!raw) return
    const data = JSON.parse(raw)
    if (data.state) {
      data.state.screen = 'feed'
      data.state.onboardingDone = true
      localStorage.setItem('welling_v1', JSON.stringify(data))
    }
  })

// 앱을 피드 화면까지 띄우고, 실제로 렌더됐는지 단언한다.
// 새 브라우저는 localStorage가 비어 있어 온보딩 화면에서 시작하므로,
// 앱이 실제로 제공하는 데모 진입 경로를 클릭해서 들어간다.
const openFeed = async (page: Page) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('#root')).not.toBeEmpty()

  const demoBtn = page.getByRole('button', { name: 'Skip to demo' })
  if (await demoBtn.count() > 0) {
    await demoBtn.click()
  } else {
    await skipOnboarding(page)
    await page.reload()
    await page.waitForLoadState('networkidle')
  }

  await expect(nav(page).first()).toBeVisible()
}

// BottomNav: feed=0, explore=1, record=2, ranking=3, mypage=4
const nav = (page: Page) => page.locator('[data-testid="bottom-nav"] button')

test('01 Feed 로드 및 커뮤니티 탭', async ({ page }) => {
  await openFeed(page)
  await ss(page, '01-feed')

  const communityTabs = page.getByTestId('feed-community-tab')
  await expect(communityTabs).toHaveCount(5)
  for (const tab of await communityTabs.all()) {
    await tab.click()
    await expect(tab).toHaveAttribute('aria-pressed', 'true')
  }
  await ss(page, '01b-feed-tabs')
})

test('02 Feed → Post 상세', async ({ page }) => {
  await openFeed(page)

  const post = page.getByTestId('feed-post-content').first()
  await expect(post).toBeVisible()
  await post.click()
  await expect(page.getByTestId('post-detail-sheet')).toBeVisible()
  await ss(page, '02-post-detail')

  const followBtn = page.locator('button').filter({ hasText: /Follow|Following/ }).first()
  await expect(followBtn).toBeVisible()
  await followBtn.click()

  await page.getByTestId('post-detail-close').click()
  await expect(page.getByTestId('post-detail-sheet')).toBeHidden()
})

test('03 Explore 탭', async ({ page }) => {
  await openFeed(page)

  await expect(nav(page)).toHaveCount(5)
  await nav(page).nth(1).click()
  await expect(page.getByTestId('explore-screen')).toBeVisible()
  await ss(page, '03-explore')
})

test('04 Record Modal', async ({ page }) => {
  await openFeed(page)

  await expect(nav(page)).toHaveCount(5)
  await nav(page).nth(2).click()
  await expect(page.getByTestId('record-modal')).toBeVisible()
  await expect(page.getByTestId('record-quick-button').first()).toBeVisible()
  await ss(page, '04-record-modal')

  await page.getByTestId('record-modal-backdrop').click()
  await expect(page.getByTestId('record-modal')).toBeHidden()
})

test('05 Ranking 탭', async ({ page }) => {
  await openFeed(page)

  await expect(nav(page)).toHaveCount(5)
  await nav(page).nth(3).click()
  await expect(page.getByTestId('ranking-screen')).toBeVisible()
  await ss(page, '05-ranking')
})

test('06 MyPage 탭 및 서브 화면들', async ({ page }) => {
  await openFeed(page)

  await expect(nav(page)).toHaveCount(5)
  await nav(page).nth(4).click()
  await expect(page.getByTestId('mypage-screen')).toBeVisible()
  await ss(page, '06-mypage')

  await page.getByTestId('mypage-tab-routine').click()
  await expect(page.getByTestId('mypage-tab-routine')).toHaveAttribute('aria-pressed', 'true')
  await page.getByTestId('mypage-tab-dashboard').click()
  await expect(page.getByTestId('mypage-tab-dashboard')).toHaveAttribute('aria-pressed', 'true')
  await ss(page, '06c-dashboard')

  await expect(page.getByTestId('mypage-share')).toBeVisible()
  await page.getByTestId('mypage-routine-edit').click()
  await expect(page.getByTestId('routine-edit-screen')).toBeVisible()
  await ss(page, '06b-routine-edit')
  await page.getByTestId('routine-edit-back').click()
  await expect(page.getByTestId('mypage-screen')).toBeVisible()

  await page.getByTestId('mypage-messages').click()
  await expect(page.getByTestId('messages-screen')).toBeVisible()
  await ss(page, '06d-messages')
})

test('07 OtherProfile', async ({ page }) => {
  await openFeed(page)

  const otherUser = page.locator('[data-testid="feed-post-user"][data-user-name="정도윤"]').first()
  await expect(otherUser).toBeVisible()
  await otherUser.click()
  await expect(page.getByTestId('other-profile-screen')).toBeVisible()
  await expect(page.getByTestId('other-profile-card')).toBeVisible()
  await ss(page, '07-other-profile')

  const followBtn = page.getByTestId('other-profile-follow')
  await expect(followBtn).toHaveAttribute('aria-pressed', 'false')
  await followBtn.click()
  await expect(followBtn).toHaveAttribute('aria-pressed', 'true')

  await page.getByTestId('other-profile-sync').click()
  await expect(page.getByTestId('sync-confirm-sheet')).toBeVisible()
  await ss(page, '07b-sync-sheet')
})
