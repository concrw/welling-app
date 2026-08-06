import { chromium } from 'playwright'

const BASE = 'http://localhost:5199'
const TS = Date.now()
const SUF = String(TS).slice(-4)
const A = { email: `crawla${TS}@test.welling.today`, pass: 'E2ETest!0806', nick: `크롤가${SUF}` }
const B = { email: `crawlb${TS}@test.welling.today`, pass: 'E2ETest!0806', nick: `크롤나${SUF}` }

const SCREENS = [
  'feed', 'explore', 'mypage', 'ranking', 'other-profile', 'community-detail',
  'new-community', 'routine-edit', 'routine-history', 'routine-privacy',
  'goal-vs-actual', 'insights', 'settings', 'comm-notifications', 'notifications',
  'alarm', 'messages', 'chat-thread', 'admin-users', 'admin-ads', 'ad-page',
  'evening-reflection', 'settings-home-screen', 'settings-default-visibility',
  'settings-profile-visibility', 'settings-google-calendar', 'settings-change-username',
]

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' })
const page = await ctx.newPage()
const consoleErrors = []
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 180)) })
page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + String(e).slice(0, 180)))
page.on('filechooser', fc => fc.setFiles([]).catch(() => {}))
page.on('dialog', d => d.dismiss().catch(() => {}))

async function signupViaUI(u) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const inputs = page.locator('input')
  await inputs.nth(0).fill(u.nick)
  await inputs.nth(1).fill(u.email)
  await inputs.nth(2).fill(u.pass)
  await page.locator('button', { hasText: /Get started/ }).first().click()
  await page.waitForTimeout(3500)
}

// B 계정 먼저 만들어 suggestedUsers 대상 확보
await signupViaUI(B)
await page.evaluate(() => window.__store.getState().signOut?.())
await page.waitForTimeout(1000)
// A 계정 (크롤러 본계정)
await signupViaUI(A)
await page.evaluate(() => {
  const s = window.__store.getState()
  s.goToMain()
})
await page.waitForTimeout(3500)
// 크롤에 필요한 데이터: 내 글 1개
await page.evaluate(() => window.__store.getState().addPost('크롤용 아침 러닝 기록', undefined, 'habit', 'public', null))
await page.waitForTimeout(1500)
// 첫 게시 후 뜨는 HomePrompt를 닫고 재노출 차단 (오버레이가 클릭을 가로채는 것 방지)
await page.evaluate(() => window.__store.setState({ showHomePrompt: false, hasPromptedHome: true }))
await page.waitForTimeout(300)

const snapshotState = () => page.evaluate(() => {
  const s = window.__store.getState()
  const out = { screen: s.screen, navTab: s.navTab }
  for (const [k, v] of Object.entries(s)) {
    if (typeof v === 'boolean') out[k] = v
  }
  out._selPost = !!s.selectedPost
  out._selUser = !!s.selectedUser
  out._selComm = !!s.selectedCommunity
  return out
})

const restoreKeys = await page.evaluate(() => {
  const s = window.__store.getState()
  return Object.entries(s).filter(([, v]) => typeof v === 'boolean').map(([k]) => k)
})

async function prepare(screen) {
  await page.evaluate(async ({ screen }) => {
    const st = window.__store
    const s = st.getState()
    const patch = { screen, prevScreen: 'feed' }
    if (['feed', 'explore', 'ranking', 'mypage'].includes(screen)) patch.navTab = screen
    if (screen === 'other-profile') {
      const u = s.suggestedUsers[0]
      patch.selectedUser = u ?? null
    }
    if (screen === 'community-detail') patch.selectedCommunity = s.communities[0] ?? null
    if (screen === 'chat-thread') patch.chatUser = s.suggestedUsers[0]?.name ?? 'Tester'
    if (screen === 'admin-users' || screen === 'admin-ads') patch.isAdmin = true
    st.setState(patch)
  }, { screen })
  await page.waitForTimeout(700)
}

function classify(pre, post, preText, postText) {
  if (pre.screen !== post.screen) return `화면이동:${post.screen}`
  const changed = Object.keys(post).filter(k => pre[k] !== post[k])
  if (changed.length) return `상태변화:${changed.slice(0, 3).join(',')}`
  if (preText !== postText) return 'DOM변화'
  return 'NO-OP'
}

const report = {}

const ENUM = () => page.evaluate(() => {
  const els = [...document.querySelectorAll('button, div[style], span[style], p[style]')]
  const clickable = els.filter(el => {
    const cs = getComputedStyle(el)
    const isBtn = el.tagName === 'BUTTON'
    const isPtr = cs.cursor === 'pointer'
    if (!isBtn && !isPtr) return false
    if (!isBtn && el.querySelector('button')) return false
    if (!isBtn && [...el.querySelectorAll('*')].some(c => getComputedStyle(c).cursor === 'pointer' && c.tagName !== 'SVG' && c.closest('div,span,p') !== el && (c.tagName === 'BUTTON' || c.textContent !== el.textContent))) return false
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return false
    return true
  })
  clickable.forEach((el, i) => el.setAttribute('data-crawl', String(i)))
  return clickable.map((el, i) => ({ i, label: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 28) || '(아이콘)' }))
})

for (const screen of SCREENS) {
  await prepare(screen)
  const items = []
  const list = await ENUM()

  for (const item of list) {
    // 매 클릭 전 재열거로 리마운트 후에도 같은 순번 요소를 다시 태깅
    const relist = await ENUM()
    if (item.i >= relist.length) { items.push({ ...item, effect: '요소소실(재렌더)' }); continue }
    const pre = await snapshotState()
    const preText = await page.evaluate(() => document.body.innerText.length + ':' + document.body.innerText.slice(0, 400))
    const el = page.locator(`[data-crawl="${item.i}"]`)
    if (!(await el.count())) { items.push({ ...item, effect: '요소소실(재렌더)' }); continue }
    try {
      await el.first().click({ timeout: 3000, force: false })
    } catch {
      try { await el.first().click({ timeout: 2000, force: true }) } catch { items.push({ ...item, effect: '클릭불가' }); continue }
    }
    await page.waitForTimeout(600)
    const post = await snapshotState()
    const postText = await page.evaluate(() => document.body.innerText.length + ':' + document.body.innerText.slice(0, 400))
    items.push({ ...item, effect: classify(pre, post, preText, postText) })
    // 상태 복원
    await page.evaluate(({ pre, restoreKeys, screen }) => {
      const st = window.__store
      const patch = { screen, navTab: pre.navTab }
      for (const k of restoreKeys) patch[k] = pre[k]
      if (!pre._selPost) patch.selectedPost = null
      st.setState(patch)
    }, { pre, restoreKeys, screen })
    await page.waitForTimeout(250)
    // 로그아웃 됐으면 재로그인
    const cur = await page.evaluate(() => window.__store.getState().screen)
    if (cur === 'onboarding-username') {
      await page.evaluate(({ A }) => {
        const s = window.__store.getState()
        s.setAuthMode('login'); s.setEmailInput(A.email); s.setPasswordInput(A.pass)
        return s.submitLogin()
      }, { A })
      await page.waitForTimeout(3000)
      await prepare(screen)
    }
    // 요소 인덱스 재부여 (재렌더 대비)
    await page.evaluate(() => {
      // no-op: data-crawl은 재렌더 시 사라짐. 다음 항목에서 소실 처리됨
    })
  }
  report[screen] = items
  const noop = items.filter(x => x.effect === 'NO-OP')
  console.log(`[${screen}] clickables=${items.length} NO-OP=${noop.length}${noop.length ? ' → ' + noop.map(n => n.label).join(' | ') : ''}`)
}

console.log('\n===== 요약 =====')
let total = 0, noopTotal = 0, lost = 0
for (const [scr, items] of Object.entries(report)) {
  total += items.length
  noopTotal += items.filter(x => x.effect === 'NO-OP').length
  lost += items.filter(x => x.effect === '요소소실(재렌더)' || x.effect === '클릭불가').length
}
console.log(`전체 클릭요소 ${total}, NO-OP ${noopTotal}, 소실/클릭불가 ${lost}`)
console.log('\n===== CONSOLE ERRORS =====')
console.log([...new Set(consoleErrors)].slice(0, 20).join('\n') || '(none)')
console.log('\nCRAWL_EMAILS', A.email, B.email)

const fs = await import('fs')
fs.writeFileSync('/private/tmp/claude-501/-Users-brandactivist-Desktop-WELLING/bf16e44f-a74e-4144-9468-36b938e95202/scratchpad/crawl-report.json', JSON.stringify(report, null, 1))
await browser.close()
