import { chromium, webkit, firefox } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import zlib from 'zlib'

const BASE = 'https://welling.today'
const SHOT = '/private/tmp/claude-501/-Users-brandactivist-Desktop-WELLING/bf16e44f-a74e-4144-9468-36b938e95202/scratchpad/e2e'
mkdirSync(SHOT, { recursive: true })

const TS = Date.now()
const SUF = String(TS).slice(-4)
const A = { email: `e2ea${TS}@test.welling.today`, pass: 'E2ETest!0805', nick: `테스트가${SUF}` }
const B = { email: `e2eb${TS}@test.welling.today`, pass: 'E2ETest!0805', nick: `테스트나${SUF}` }
const POST_A = '아침 러닝 30분 완료 오늘도 상쾌하다'
const COMMENT_B = '대단해요 저도 내일부터 뛸게요'

const results = []
const consoleErrors = []

function nav(page, tab) {
  // feed 0.1, explore 0.3, record 0.5, ranking 0.7, mypage 0.9
  const frac = { feed: 0.1, explore: 0.3, record: 0.5, ranking: 0.7, mypage: 0.9 }[tab]
  return page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }))
    .then(({ w, h }) => page.mouse.click(w * frac, h - 30))
}

async function step(name, fn) {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`PASS ${name}`)
  } catch (e) {
    results.push({ name, ok: false, err: String(e).split('\n')[0].slice(0, 180) })
    console.log(`FAIL ${name}: ${String(e).split('\n')[0].slice(0, 180)}`)
  }
}

async function newPage(browser, label) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`[${label}] ${m.text().slice(0, 200)}`) })
  page.on('pageerror', e => consoleErrors.push(`[${label}] PAGEERROR: ${String(e).slice(0, 200)}`))
  page.on('response', async r => {
    if (r.status() >= 400) {
      const body = await r.text().catch(() => '')
      consoleErrors.push(`[${label}] HTTP ${r.status()} ${r.url().slice(0, 160)} :: ${body.slice(0, 150)}`)
    }
  })
  return { ctx, page }
}

async function signup(page, u) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const inputs = page.locator('input')
  await inputs.nth(0).fill(u.nick)
  await inputs.nth(1).fill(u.email)
  await inputs.nth(2).fill(u.pass)
  await page.locator('button', { hasText: /Get started|시작하기/ }).first().click()
  await page.waitForTimeout(4000)
}

async function passOnboarding(page) {
  // click Continue/Skip up to 5 times until record(+) nav button appears
  for (let i = 0; i < 5; i++) {
    if (await page.locator('button:has(svg circle[cx="11"])').count()) break
    const btn = page.locator('button', { hasText: /Continue|Skip|Later|계속|건너뛰기|나중에/ }).last()
    if (await btn.count()) { await btn.click(); await page.waitForTimeout(1500) }
    else await page.waitForTimeout(1000)
  }
  if (!(await page.locator('button:has(svg circle[cx="11"])').count())) throw new Error('onboarding did not reach feed')
  await page.waitForTimeout(3000) // WelcomeAnimation(2.2s) 종료 대기
}

async function login(page, u) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.locator('button', { hasText: /^(Log in|로그인)$/ }).first().click()
  await page.waitForTimeout(300)
  const inputs = page.locator('input')
  await inputs.nth(0).fill(u.email)
  await inputs.nth(1).fill(u.pass)
  await page.locator('button', { hasText: /Log in|로그인/ }).last().click()
  await page.waitForTimeout(4000)
}

async function recordPost(page, text) {
  await nav(page, 'record')
  await page.waitForTimeout(1000)
  await page.locator('textarea').first().fill(text)
  await page.locator('button', { hasText: /기록하기|^Record$/ }).first().click()
  await page.waitForTimeout(1000)
  const cont = page.locator('button', { hasText: /계속 올리기|Post anyway/ })
  if (await cont.count()) await cont.first().click()
  await page.waitForTimeout(2500)
}

const ENGINE = process.env.ENGINE || 'chromium'
const engine = { chromium, webkit, firefox }[ENGINE]
console.log('ENGINE:', ENGINE)
const browser = await engine.launch({ headless: true })

// 업로드 검증용 60x40 단색 PNG 생성
function makePng(path) {
  const w = 60, h = 40
  const crcTable = []
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0 }
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type, data) => {
    const t = Buffer.from(type)
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const cv = Buffer.alloc(4); cv.writeUInt32BE(crc(Buffer.concat([t, data])))
    return Buffer.concat([len, t, data, cv])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(w * 3, 0x40)])
  const raw = Buffer.concat(Array.from({ length: h }, () => row))
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(path, png)
}
const PNG_PATH = `${SHOT}/e2e-upload.png`
makePng(PNG_PATH)

// ============ USER A: signup + onboarding ============
const { page: pa } = await newPage(browser, 'A')

await step('01 회원가입 검증(짧은 비밀번호 시 버튼 비활성)', async () => {
  await pa.goto(BASE, { waitUntil: 'networkidle' })
  await pa.waitForTimeout(1500)
  const inputs = pa.locator('input')
  await inputs.nth(0).fill(A.nick)
  await inputs.nth(1).fill(A.email)
  await inputs.nth(2).fill('123')
  const btn = pa.locator('button', { hasText: /Get started/ }).first()
  if (!(await btn.isDisabled())) throw new Error('짧은 비밀번호인데 버튼 활성화됨')
})

await step('02 회원가입(A) 후 온보딩 프리뷰 진입', async () => {
  await signup(pa, A)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!/Continue|계속/.test(t)) throw new Error('온보딩 프리뷰 미진입: ' + t.slice(0, 80))
  await pa.screenshot({ path: `${SHOT}/02-onboarding-preview.png` })
})

await step('03 온보딩 통과 → 피드 도달', async () => {
  await passOnboarding(pa)
  await pa.screenshot({ path: `${SHOT}/03-feed.png` })
})

await step('04 기록 작성(러닝) → 피드 노출', async () => {
  await recordPost(pa, POST_A)
  await nav(pa, 'feed')
  await pa.waitForTimeout(1000)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes(POST_A)) throw new Error('작성한 글이 피드에 없음')
})

await step('05 새로고침 후 글 유지', async () => {
  await pa.reload({ waitUntil: 'networkidle' })
  await pa.waitForTimeout(3000)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes(POST_A)) throw new Error('새로고침 후 글 사라짐')
})

await step('06 글 상세: 반응+댓글 작성', async () => {
  await pa.locator(`text=${POST_A}`).first().click()
  await pa.waitForTimeout(1200)
  const reaction = pa.locator('button', { hasText: /힘내요|Cheer/ }).first()
  await reaction.click()
  await pa.waitForTimeout(800)
  const ci = pa.locator('input[placeholder*="댓글"], input[placeholder*="comment" i]').first()
  await ci.fill('첫 댓글 셀프 테스트')
  await ci.press('Enter')
  await pa.waitForTimeout(2000)
  await pa.screenshot({ path: `${SHOT}/06-post-detail.png` })
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes('첫 댓글 셀프 테스트')) throw new Error('댓글 미표시')
})

await step('07 새로고침 후 반응/댓글 유지', async () => {
  await pa.reload({ waitUntil: 'networkidle' })
  await pa.waitForTimeout(3000)
  await pa.locator(`text=${POST_A}`).first().click()
  await pa.waitForTimeout(1200)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes('첫 댓글 셀프 테스트')) throw new Error('댓글 유실')
  if (!/힘내요|Cheer/.test(t)) throw new Error('반응 라벨 없음')
  // close sheet
  await pa.keyboard.press('Escape').catch(() => {})
  const close = pa.locator('button:has(svg path[d*="M"])').first()
  await pa.mouse.click(20, 30)
  await pa.waitForTimeout(500)
})

await step('08 탐색: 커뮤니티 목록 + 가입', async () => {
  await pa.goto(BASE, { waitUntil: 'networkidle' })
  await pa.waitForTimeout(2500)
  await nav(pa, 'explore')
  await pa.waitForTimeout(1500)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes('Morning Runners')) throw new Error('커뮤니티 목록 없음')
  const join = pa.locator('button', { hasText: /가입하기|^Join$/ }).first()
  await join.click()
  await pa.waitForTimeout(1500)
  await pa.screenshot({ path: `${SHOT}/08-explore.png` })
})

await step('09 랭킹 화면 로드', async () => {
  await nav(pa, 'ranking')
  await pa.waitForTimeout(1500)
  await pa.screenshot({ path: `${SHOT}/09-ranking.png` })
  const t = await pa.evaluate(() => document.body.innerText)
  if (t.length < 20) throw new Error('랭킹 화면 빈 화면')
})

await step('10 마이페이지: 실데이터 대시보드', async () => {
  await nav(pa, 'mypage')
  await pa.waitForTimeout(2000)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes('0 followers')) throw new Error('팔로워 실카운트(0) 아님: ' + (t.match(/\d+ followers/) || ['?'])[0])
  if (t.includes('Morning Walk')) throw new Error('샘플 루틴 누출')
  await pa.screenshot({ path: `${SHOT}/10-mypage.png` })
})

await step('11 저녁 단상 작성 + 피드 공개', async () => {
  const write = pa.locator('button', { hasText: /^(Write|기록하기)$/ }).first()
  await write.click()
  await pa.waitForTimeout(1200)
  const areas = pa.locator('textarea')
  if ((await areas.count()) === 0) throw new Error('단상 입력창 없음')
  await areas.nth(0).fill('아침 러닝이 가장 잘 됐다')
  const save = pa.locator('button', { hasText: /저장하기|Save/ }).first()
  await save.click()
  await pa.waitForTimeout(2500)
  await pa.screenshot({ path: `${SHOT}/11-reflection.png` })
  // publicToFeed 기본 ON → 피드에 게시됐는지 확인
  await pa.goto(BASE, { waitUntil: 'networkidle' })
  await pa.waitForTimeout(3000)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes('아침 러닝이 가장 잘 됐다')) throw new Error('단상이 피드에 미게시')
})

async function openSettingsSection(page) {
  await nav(page, 'mypage')
  await page.waitForTimeout(1500)
  // 이미 열려 있으면(언어 토글 노출) 헤더를 다시 누르지 않는다 — 토글이라 닫혀버림
  if (await page.locator('button', { hasText: /^(English|한국어)$/ }).count()) return
  const header = page.getByText('Settings', { exact: true }).last()
  await header.scrollIntoViewIfNeeded()
  await header.click()
  await page.waitForTimeout(800)
}

await step('12 언어 토글 en 전환 + 새로고침 유지', async () => {
  await openSettingsSection(pa)
  const en = pa.locator('button', { hasText: /^English$/ }).first()
  await en.scrollIntoViewIfNeeded()
  await en.click()
  await pa.waitForTimeout(1000)
  await pa.reload({ waitUntil: 'networkidle' })
  await pa.waitForTimeout(3000)
  await nav(pa, 'mypage')
  await pa.waitForTimeout(1500)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes('Reflect on your day')) throw new Error('영문 전환/유지 안 됨')
  await pa.screenshot({ path: `${SHOT}/12-english.png` })
  // 다시 한국어로
  await openSettingsSection(pa)
  const ko = pa.locator('button', { hasText: /^한국어$/ }).first()
  await ko.scrollIntoViewIfNeeded()
  await ko.click()
  await pa.waitForTimeout(1000)
  const t2 = await pa.evaluate(() => document.body.innerText)
  if (!t2.includes('오늘 하루를 돌아보며')) throw new Error('한국어 복귀 안 됨')
})

await step('13 로그아웃 → 온보딩 복귀', async () => {
  await openSettingsSection(pa)
  const so = pa.getByText(/^(로그아웃|Sign out)$/).first()
  await so.scrollIntoViewIfNeeded()
  await so.click()
  await pa.waitForTimeout(800)
  const confirm = pa.locator('button', { hasText: /^(로그아웃|Sign out)$/ }).last()
  await confirm.click()
  await pa.waitForTimeout(2500)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!/Get started|시작하기/.test(t)) throw new Error('온보딩 미복귀: ' + t.slice(0, 60))
})

await step('14 틀린 비밀번호 로그인 → 에러 표시', async () => {
  await login(pa, { ...A, pass: 'WrongPass!123' })
  const t = await pa.evaluate(() => document.body.innerText)
  if (/Dashboard|Edit routine/.test(t)) throw new Error('틀린 비번인데 로그인됨')
  if (!/Invalid|잘못|실패|credentials/i.test(t)) throw new Error('에러 메시지 없음: ' + t.slice(0, 120))
})

await step('15 정상 로그인(A) → 피드 복귀', async () => {
  await login(pa, A)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes(POST_A)) throw new Error('로그인 후 피드에 내 글 없음')
})

// ============ USER B: 2계정 상호작용 ============
const { page: pb } = await newPage(browser, 'B')

await step('16 회원가입(B) + 온보딩 통과', async () => {
  await signup(pb, B)
  await passOnboarding(pb)
})

await step('17 B가 A의 글 열람 + 댓글', async () => {
  await nav(pb, 'feed')
  await pb.waitForTimeout(1500)
  await pb.getByText('All', { exact: true }).first().click().catch(() => {})
  await pb.waitForTimeout(1000)
  const t = await pb.evaluate(() => document.body.innerText)
  if (!t.includes(POST_A)) throw new Error('B 피드에 A의 공개글 없음')
  await pb.locator(`text=${POST_A}`).first().click()
  await pb.waitForTimeout(1200)
  const ci = pb.locator('input[placeholder*="댓글"], input[placeholder*="comment" i]').first()
  await ci.fill(COMMENT_B)
  await ci.press('Enter')
  await pb.waitForTimeout(2000)
  const t2 = await pb.evaluate(() => document.body.innerText)
  if (!t2.includes(COMMENT_B)) throw new Error('B 댓글 미표시')
  await pb.mouse.click(20, 30)
  await pb.waitForTimeout(500)
})

await step('18 B가 탐색에서 A 프로필 열람 + 팔로우', async () => {
  await pb.goto(BASE, { waitUntil: 'networkidle' })
  await pb.waitForTimeout(2500)
  await nav(pb, 'explore')
  await pb.waitForTimeout(1500)
  const search = pb.locator('input[placeholder*="검색"], input[placeholder*="Search" i]').first()
  await search.fill(A.nick)
  await pb.waitForTimeout(1000)
  await pb.screenshot({ path: `${SHOT}/18-search.png` })
  await pb.locator(`text=${A.nick}`).first().click()
  await pb.waitForTimeout(1500)
  const follow = pb.locator('button', { hasText: /^(Follow|팔로우)$/ }).first()
  if (!(await follow.count())) throw new Error('팔로우 버튼 없음')
  await follow.click()
  await pb.waitForTimeout(1500)
  await pb.screenshot({ path: `${SHOT}/18-other-profile.png` })
})

await step('19 A 새로고침: 팔로워 1 반영 + B 댓글 보임', async () => {
  await pa.reload({ waitUntil: 'networkidle' })
  await pa.waitForTimeout(3000)
  await nav(pa, 'mypage')
  await pa.waitForTimeout(2000)
  const t = await pa.evaluate(() => document.body.innerText)
  if (!t.includes('1 followers')) throw new Error('팔로워 1 미반영: ' + (t.match(/\d+ followers/) || ['?'])[0])
  await nav(pa, 'feed')
  await pa.waitForTimeout(1000)
  await pa.getByText('All', { exact: true }).first().click().catch(() => {})
  await pa.waitForTimeout(1000)
  await pa.locator(`text=${POST_A}`).first().click()
  await pa.waitForTimeout(1200)
  const t2 = await pa.evaluate(() => document.body.innerText)
  if (!t2.includes(COMMENT_B)) throw new Error('B의 댓글이 A에게 안 보임')
  await pa.mouse.click(20, 30)
})

await step('20 데모 모드 진입 정상', async () => {
  const { page: pd } = await newPage(browser, 'demo')
  await pd.goto(BASE, { waitUntil: 'networkidle' })
  await pd.waitForTimeout(1500)
  await pd.locator('button', { hasText: /Skip to demo|데모/i }).first().click()
  await pd.waitForTimeout(2000)
  const t = await pd.evaluate(() => document.body.innerText)
  if (t.length < 50) throw new Error('데모 피드 빈 화면')
  await pd.screenshot({ path: `${SHOT}/20-demo.png` })
  await pd.context().close()
})

const IMG_POST = '이미지 첨부 검증 게시글'

await step('21 이미지 첨부 게시 → 새로고침 후 Storage 이미지 렌더링', async () => {
  await pa.goto(BASE, { waitUntil: 'networkidle' })
  await pa.waitForTimeout(2500)
  await nav(pa, 'record')
  await pa.waitForTimeout(1000)
  await pa.locator('textarea').first().fill(IMG_POST)
  await pa.locator('input[type="file"]').setInputFiles(PNG_PATH)
  await pa.waitForTimeout(800)
  await pa.locator('button', { hasText: /기록하기|^Record$/ }).first().click()
  await pa.waitForTimeout(1000)
  const cont = pa.locator('button', { hasText: /계속 올리기|Post anyway/ })
  if (await cont.count()) await cont.first().click()
  await pa.waitForTimeout(4000)
  await pa.reload({ waitUntil: 'networkidle' })
  await pa.waitForTimeout(3000)
  await pa.locator(`text=${IMG_POST}`).first().click()
  await pa.waitForTimeout(1500)
  const img = await pa.evaluate(() => {
    const el = [...document.querySelectorAll('img')].find(i => i.src.includes('post-images'))
    return el ? el.naturalWidth : 0
  })
  if (!img) throw new Error('Storage 이미지가 상세에 렌더링되지 않음')
  await pa.mouse.click(20, 30)
})

await step('22 타계정(B)에서 이미지 글 상세 이미지 확인', async () => {
  await pb.goto(BASE, { waitUntil: 'networkidle' })
  await pb.waitForTimeout(2500)
  await pb.locator(`text=${IMG_POST}`).first().click()
  await pb.waitForTimeout(1500)
  const img = await pb.evaluate(() => {
    const el = [...document.querySelectorAll('img')].find(i => i.src.includes('post-images'))
    return el ? el.naturalWidth : 0
  })
  if (!img) throw new Error('B에게 Storage 이미지가 렌더링되지 않음')
  await pb.mouse.click(20, 30)
})

await step('23 비밀번호 재설정 요청 UI (forgot 모드)', async () => {
  const { page: pf } = await newPage(browser, 'forgot')
  await pf.goto(BASE, { waitUntil: 'networkidle' })
  await pf.waitForTimeout(1500)
  await pf.locator('button', { hasText: /^(Log in|로그인)$/ }).first().click()
  await pf.waitForTimeout(300)
  await pf.locator('button', { hasText: /Forgot password/ }).first().click()
  await pf.waitForTimeout(300)
  if (await pf.locator('input[type="password"]').count()) throw new Error('forgot 모드에 비밀번호칸 잔존')
  await pf.locator('input[type="email"]').fill(A.email)
  await pf.locator('button', { hasText: /Send reset link/ }).first().click()
  // 실메일이면 성공 안내, 테스트 도메인이면 invalid 에러 — 어느 쪽이든 API 왕복 결과가 표시될 때까지 폴링
  let shown = false, last = ''
  for (let i = 0; i < 10; i++) {
    await pf.waitForTimeout(1000)
    last = await pf.evaluate(() => document.body.innerText)
    if (/재설정 링크를 이메일로|sent a reset link|invalid/i.test(last)) { shown = true; break }
  }
  if (!shown) throw new Error('발송 결과 표시 없음: ' + last.slice(0, 100))
  await pf.locator('button', { hasText: /Back to log in/ }).first().click()
  await pf.waitForTimeout(300)
  if (!(await pf.locator('input[type="password"]').count())) throw new Error('로그인 모드 복귀 실패')
  await pf.context().close()
})

await step('24 수정된 버튼 3종: insights Edit / ranking 광고카드 / explore 광고 보기', async () => {
  // A는 로그인 상태. insights 진입 경로: mypage → Insights 전체보기
  await pa.goto(BASE, { waitUntil: 'networkidle' })
  await pa.waitForTimeout(2500)
  await nav(pa, 'mypage')
  await pa.waitForTimeout(1500)
  const viewAlls = pa.getByText(/^(전체보기|View all)$/)
  // Insights 섹션의 전체보기는 마지막에서 두 번째쯤 — Insights 헤더 옆 버튼을 텍스트 인접으로 찾기
  await pa.getByText('Insights', { exact: true }).first().scrollIntoViewIfNeeded()
  const insightsRow = pa.locator('div', { has: pa.getByText('Insights', { exact: true }) }).locator('button', { hasText: /전체보기|View all/ }).last()
  await insightsRow.click()
  await pa.waitForTimeout(1200)
  await pa.getByText(/^(Edit|편집)$/).first().click()
  await pa.waitForTimeout(1000)
  const t1 = await pa.evaluate(() => document.body.innerText)
  if (!/Google 캘린더|Google Calendar/.test(t1)) throw new Error('insights Edit → 캘린더 설정 화면 미진입')
  // ranking 광고 카드 본체 → 모달
  await pa.goto(BASE, { waitUntil: 'networkidle' })
  await pa.waitForTimeout(2500)
  await nav(pa, 'ranking')
  await pa.waitForTimeout(1500)
  await pa.getByText('마이프로틴 Korea').first().click()
  await pa.waitForTimeout(1000)
  const t2 = await pa.evaluate(() => document.body.innerText)
  if (!t2.includes('WELLING20')) throw new Error('ranking 광고카드 → 모달 미표시')
  await pa.locator('button', { hasText: /닫기|Close|확인/ }).first().click().catch(() => pa.mouse.click(20, 30))
  await pa.waitForTimeout(500)
  // explore 광고 보기 버튼 → 새 탭(link 슬롯)
  await nav(pa, 'explore')
  await pa.waitForTimeout(1500)
  const popupP = pa.context().waitForEvent('page', { timeout: 5000 }).catch(() => null)
  await pa.locator('button', { hasText: /^(보기|View)$/ }).first().click()
  const popup = await popupP
  if (!popup) throw new Error('explore 보기 버튼 → 새 탭 안 열림')
  await popup.close().catch(() => {})
})

console.log('\n===== RESULTS =====')
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.err ? ' — ' + r.err : ''}`)
console.log(`\n${results.filter(r => r.ok).length}/${results.length} passed`)
console.log('\n===== CONSOLE ERRORS =====')
console.log(consoleErrors.join('\n') || '(none)')
console.log('\nTEST_EMAILS', A.email, B.email)
await browser.close()
