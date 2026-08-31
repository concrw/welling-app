import { chromium, devices } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ ...devices['iPhone 13'] })
const p = await ctx.newPage()
await p.goto('http://localhost:4174', { waitUntil: 'networkidle' })
const d = p.getByRole('button', { name: 'Skip to demo' })
if (await d.count() > 0) { await d.click(); await p.waitForTimeout(800) }
await p.evaluate(() => { const s=document.querySelector('.app-shell > div > div'); s.scrollTop=s.scrollHeight })
await p.waitForTimeout(500)
console.log(JSON.stringify(await p.evaluate(() => {
  const s=document.querySelector('.app-shell > div > div')
  const last=[...s.querySelectorAll('[data-testid="feed-post"]')].pop().getBoundingClientRect()
  const nav=document.querySelector('[data-testid="bottom-nav"]').getBoundingClientRect()
  return { lastPostBottom:Math.round(last.bottom), navTop:Math.round(nav.top),
           gap: Math.round(nav.top-last.bottom) }
})))
await p.screenshot({ path:'/tmp/nogap.png' })
await b.close()
