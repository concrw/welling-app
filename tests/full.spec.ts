import { test, expect, Page } from '@playwright/test'

const BASE = 'http://localhost:5177'
const S = '/private/tmp/claude-501/-Users-brandactivist-Desktop-WELLING/958fdec9-e2e9-498c-8db5-b0c7fe609e73/scratchpad'

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

test('01 Feed 로드 및 커뮤니티 탭', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await skipOnboarding(page)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await ss(page, '01-feed')

  for (const label of ['Morning Runners', 'Clean Eaters', 'All', 'Book Club']) {
    const btn = page.locator('button').filter({ hasText: label }).first()
    if (await btn.count() > 0) {
      await btn.click()
      await page.waitForTimeout(200)
    }
  }
  await ss(page, '01b-feed-tabs')
  console.log('Feed OK')
})

test('02 Feed → Post 상세', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await skipOnboarding(page)
  await page.reload()
  await page.waitForLoadState('networkidle')

  // 포스트 항목 클릭 (하트 버튼 말고 본문)
  const post = page.locator('div').filter({ hasText: /Water|Squat|달리기/ }).nth(2)
  await post.click()
  await page.waitForTimeout(500)
  await ss(page, '02-post-detail')

  // Follow 버튼
  const followBtn = page.locator('button').filter({ hasText: /Follow|Following/ }).first()
  if (await followBtn.count() > 0) await followBtn.click()
  await page.waitForTimeout(200)

  // 닫기 X 버튼
  const closeBtn = page.locator('button').last()
  await closeBtn.click()
  await page.waitForTimeout(300)
  console.log('Post Detail OK')
})

test('03 Explore 탭', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await skipOnboarding(page)
  await page.reload()
  await page.waitForLoadState('networkidle')

  const navBtns = page.locator('div').filter({ hasText: '' }).locator('button').nth(6)
  // BottomNav: feed=0, explore=1, record=2, ranking=3, mypage=4
  // BottomNav div height:60px 안의 버튼들
  const nav = page.locator('[style*="height: 60px"] button')
  const count = await nav.count()
  console.log(`Nav button count: ${count}`)
  if (count >= 2) {
    await nav.nth(1).click()
    await page.waitForTimeout(500)
    await ss(page, '03-explore')
    console.log('Explore OK')
  }
})

test('04 Record Modal', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await skipOnboarding(page)
  await page.reload()
  await page.waitForLoadState('networkidle')

  const nav = page.locator('[style*="height: 60px"] button')
  if (await nav.count() >= 3) {
    await nav.nth(2).click()
    await page.waitForTimeout(500)
    await ss(page, '04-record-modal')

    // 루틴 버튼들 클릭
    const routineBtns = page.locator('div[style*="zIndex: 100"] button, div[style*="z-index: 100"] button')
    const rCount = await routineBtns.count()
    console.log(`Record modal buttons: ${rCount}`)
    await ss(page, '04b-record-modal-open')

    // 닫기
    const closeBtns = page.locator('button').filter({ hasText: '' })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    console.log('Record Modal OK')
  }
})

test('05 Ranking 탭', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await skipOnboarding(page)
  await page.reload()
  await page.waitForLoadState('networkidle')

  const nav = page.locator('[style*="height: 60px"] button')
  if (await nav.count() >= 4) {
    await nav.nth(3).click()
    await page.waitForTimeout(500)
    await ss(page, '05-ranking')
    console.log('Ranking OK')
  }
})

test('06 MyPage 탭 및 서브 화면들', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await skipOnboarding(page)
  await page.reload()
  await page.waitForLoadState('networkidle')

  const nav = page.locator('[style*="height: 60px"] button')
  if (await nav.count() >= 5) {
    await nav.nth(4).click()
    await page.waitForTimeout(500)
    await ss(page, '06-mypage')

    // 루틴편집
    const routineEditBtn = page.locator('button').filter({ hasText: '루틴편집' })
    if (await routineEditBtn.count() > 0) {
      await routineEditBtn.click()
      await page.waitForTimeout(500)
      await ss(page, '06b-routine-edit')
      await page.goBack()
      await page.waitForTimeout(300)
    }

    // 대시보드 탭
    const dashBtn = page.locator('button').filter({ hasText: '대시보드' }).first()
    if (await dashBtn.count() > 0) {
      await dashBtn.click()
      await page.waitForTimeout(500)
      await ss(page, '06c-dashboard')
    }

    // 공유 버튼
    const shareBtn = page.locator('button').filter({ hasText: '공유' }).first()
    if (await shareBtn.count() > 0) await shareBtn.click()
    await page.waitForTimeout(200)

    // 메시지
    const msgBtn = page.locator('button').filter({ hasText: '메시지' }).first()
    if (await msgBtn.count() > 0) {
      await msgBtn.click()
      await page.waitForTimeout(500)
      await ss(page, '06d-messages')
    }

    console.log('MyPage OK')
  }
})

test('07 OtherProfile', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await skipOnboarding(page)
  await page.reload()
  await page.waitForLoadState('networkidle')

  // Feed에서 사용자 아바타 클릭
  const avatars = page.locator('div[style*="borderRadius: \'50%\'"]')
  const aCount = await avatars.count()
  console.log(`Avatar count: ${aCount}`)
  if (aCount > 0) {
    await avatars.first().click()
    await page.waitForTimeout(500)
    await ss(page, '07-other-profile')

    // 팔로우 버튼
    const followBtn = page.locator('button').filter({ hasText: '팔로우' }).first()
    if (await followBtn.count() > 0) await followBtn.click()
    await page.waitForTimeout(200)

    // 루틴싱크 버튼
    const syncBtn = page.locator('button').filter({ hasText: '루틴싱크' }).first()
    if (await syncBtn.count() > 0) {
      await syncBtn.click()
      await page.waitForTimeout(500)
      await ss(page, '07b-sync-sheet')
    }

    console.log('OtherProfile OK')
  }
})
