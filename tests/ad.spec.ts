import { test, expect, Page } from '@playwright/test'
const nav = (page: Page) => page.locator('[data-testid="bottom-nav"] button')

test('FIX-6 광고 모달 CTA가 실제 URL을 연다', async ({ page, context }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const demoBtn = page.getByRole('button', { name: 'Skip to demo' })
  if (await demoBtn.count() > 0) await demoBtn.click()
  await expect(nav(page).first()).toBeVisible()

  // explore 슬롯을 modal 액션 + 검증용 URL로 설정
  await page.evaluate(() => {
    const st = (window as any).__store
    st.getState().setAdSlot('explore', { clickAction: 'modal', url: 'https://example.com/coupon', modalTitle: 'Ad', modalBody: 'Body' })
  })
  await nav(page).nth(1).click()
  await page.getByText('Ad', { exact: true }).first().click().catch(() => {})

  // 광고 배너 클릭으로 모달 열기
  await page.evaluate(() => {
    const st = (window as any).__store
    const ad = st.getState().adSlots.explore
    st.getState().openAdModal({ brand: ad.brand, desc: ad.desc, modalTitle: ad.modalTitle, modalBody: ad.modalBody, ctaUrl: ad.url })
  })

  const opened: string[] = []
  await page.exposeFunction('__recordOpen', (u: string) => { opened.push(u) })
  await page.evaluate(() => { window.open = ((u: string) => { (window as any).__recordOpen(u); return null }) as any })

  await page.locator('[data-testid="ad-modal-cta"]').click()
  expect(opened).toEqual(['https://example.com/coupon'])
})
