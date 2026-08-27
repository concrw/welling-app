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

// 수정 1: 홈 화면 설정이 새로고침 후 실제 시작 화면에 반영되는가
test('FIX-1 홈 화면 record 설정이 새로고침 후 Record Modal을 띄운다', async ({ page }) => {
  await openFeed(page)
  await page.evaluate(() => (window as any).__store?.getState().navigate('settings-home-screen'))
  await page.locator('[data-testid="home-screen-option-record"]').click()

  expect((await state(page)).homeScreenIsRecord).toBe(true)

  await page.reload()
  await page.waitForLoadState('networkidle')

  // 설정값이 유지되고, 실제로 Record Modal이 열려 있어야 한다
  expect((await state(page)).homeScreenIsRecord).toBe(true)
  await expect(page.locator('[data-testid="record-modal"]')).toBeVisible()
})

test('FIX-1b 홈 화면 feed 설정이면 Record Modal이 뜨지 않는다', async ({ page }) => {
  await openFeed(page)
  await page.evaluate(() => (window as any).__store?.getState().navigate('settings-home-screen'))
  await page.locator('[data-testid="home-screen-option-feed"]').click()
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="record-modal"]')).toHaveCount(0)
})

// 수정 4: Explore See all
test('FIX-4 See all이 목록을 실제로 확장한다', async ({ page }) => {
  await openFeed(page)
  await nav(page).nth(1).click()
  const seeAll = page.locator('[data-testid="explore-see-all"]')
  if (await seeAll.count() === 0) test.skip(true, '데모 유저 수가 5명 이하')
  const before = await page.locator('text=Follow').count()
  await seeAll.click()
  const after = await page.locator('text=Follow').count()
  expect(after).toBeGreaterThan(before)
  await expect(seeAll).toHaveText('Show less')
})

// 수정 5: 댓글 작성자 클릭 -> OtherProfile
test('FIX-5 댓글 작성자 클릭 시 OtherProfile로 이동한다', async ({ page }) => {
  await openFeed(page)
  await page.locator('[data-testid="feed-post-content"]').first().click()
  await expect(page.locator('[data-testid="post-detail-sheet"]')).toBeVisible()

  // 데모 데이터에는 댓글이 없으므로, 다른 사용자 이름의 댓글을 실제 store에 주입한다
  await page.evaluate(() => {
    const st = (window as any).__store
    const s = st.getState()
    const other = s.suggestedUsers[0]
    st.setState({
      selectedPost: { ...s.selectedPost, comments: [{ user: other.name, text: '테스트 댓글', userId: other.id }] },
    })
  })

  const authorName = page.locator('[data-testid="comment-author"]')
  await expect(authorName.first()).toBeVisible()
  await authorName.first().click()
  await expect(page.locator('[data-testid="other-profile-screen"]')).toBeVisible()
})

// 보완: NewCommunity Create 버튼 disabled
test('FIX-8 빈 이름일 때 Create 버튼이 실제로 disabled다', async ({ page }) => {
  await openFeed(page)
  await nav(page).nth(1).click()
  await page.getByText('New community', { exact: true }).first().click()
  const create = page.getByRole('button', { name: 'Create' })
  await expect(create).toBeDisabled()
  await page.locator('input').first().fill('테스트 커뮤니티')
  await expect(create).toBeEnabled()
})
