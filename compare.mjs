import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = '/Users/brandactivist/Desktop/WELLING/screenshots';
const DESIGN_FILE = '/Users/brandactivist/Desktop/WELLING/design_handoff_welling/WELLING.dc.html';
const APP_URL = 'https://welling.today';

mkdirSync(OUT, { recursive: true });

const SCREENS = [
  // [label, appNavAction]
  ['Onboarding-Username', null],
  ['Feed', 'feed'],
  ['Explore', 'explore'],
  ['MyPage', 'mypage'],
  ['Ranking', 'ranking'],
  ['RoutineHistory', 'routine-history'],
  ['RoutinePrivacy', 'routine-privacy'],
  ['GoalVsActual', 'goal-vs-actual'],
  ['Insights', 'insights'],
  ['Settings', 'settings'],
  ['Notifications', 'notifications'],
  ['Alarm', 'alarm'],
  ['Messages', 'messages'],
  ['ChatThread', 'chat-thread'],
  ['CommunityDetail', 'community-detail'],
  ['AdminUsers', 'admin-users'],
  ['AdminAds', 'admin-ads'],
  ['AdPage', 'ad-page'],
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });

// ── 원본: 각 data-screen-label 섹션 스크린샷 ──
const orig = await ctx.newPage();
await orig.goto('file://' + DESIGN_FILE, { waitUntil: 'networkidle', timeout: 30000 });
await orig.waitForTimeout(2000);

for (const [label] of SCREENS) {
  try {
    // 해당 섹션을 뷰포트 안으로 스크롤
    await orig.evaluate((lbl) => {
      const el = document.querySelector(`[data-screen-label="${lbl}"]`);
      if (el) el.scrollIntoView({ block: 'start' });
    }, label);
    await orig.waitForTimeout(300);
    await orig.screenshot({ path: `${OUT}/orig_${label}.png` });
    console.log(`orig_${label}.png saved`);
  } catch (e) {
    console.log(`orig_${label} SKIP:`, e.message);
  }
}

// ── 앱: 화면별 스크린샷 ──
const app = await ctx.newPage();
const errors = [];
app.on('pageerror', e => errors.push(e.message));

// 먼저 SKIP TO DEMO로 메인 진입
await app.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
await app.waitForTimeout(1000);

// 온보딩 스크린샷
await app.screenshot({ path: `${OUT}/app_Onboarding-Username.png` });
console.log('app_Onboarding-Username.png saved');

// SKIP TO DEMO 클릭
await app.evaluate(() => {
  // Zustand store 직접 접근
  const store = window.__ZUSTAND_STORE__;
  if (store) store.getState().goFeedDemo();
});
// 버튼 텍스트로 찾기
const skipBtn = app.getByText('SKIP TO DEMO');
if (await skipBtn.count() > 0) {
  await skipBtn.click();
  await app.waitForTimeout(800);
}

// 각 탭/화면 스크린샷
for (const [label, navTarget] of SCREENS.slice(1)) {
  try {
    await app.evaluate((target) => {
      const keys = Object.keys(window);
      // Zustand store 찾기
      for (const k of keys) {
        const v = window[k];
        if (v && typeof v === 'object' && typeof v.getState === 'function') {
          const s = v.getState();
          if (s && s.navigate) {
            s.navigate(target);
            return;
          }
        }
      }
    }, navTarget);
    await app.waitForTimeout(600);
    await app.screenshot({ path: `${OUT}/app_${label}.png` });
    console.log(`app_${label}.png saved`);
  } catch (e) {
    console.log(`app_${label} SKIP:`, e.message);
  }
}

if (errors.length) console.log('앱 에러:', errors);
await browser.close();
console.log('\nDONE — screenshots at', OUT);
