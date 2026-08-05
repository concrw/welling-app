// UI 문구 하드코딩 재발 방지 체크.
// src 내 .ts/.tsx에서 한글 리터럴을 찾아내며, i18n 카탈로그(src/i18n)와
// 데이터 파일(src/data)만 허용한다. 주석 안의 한글은 허용.
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(import.meta.dirname, '..', 'src')
const ALLOWED = ['i18n/', 'data/']
const KOREAN = /[가-힣]/

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return walk(p)
    return /\.(ts|tsx)$/.test(e.name) ? [p] : []
  })
}

// 주석(//, /* */)을 제거해 코드 주석 속 한글은 통과시킨다.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

const violations = []
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file)
  if (ALLOWED.some((a) => rel.startsWith(a))) continue
  const lines = stripComments(readFileSync(file, 'utf8')).split('\n')
  lines.forEach((line, i) => {
    if (KOREAN.test(line)) violations.push(`src/${rel}:${i + 1}: ${line.trim().slice(0, 80)}`)
  })
}

if (violations.length) {
  console.error('하드코딩된 한글 UI 문구가 발견되었습니다. src/i18n 카탈로그로 옮기세요.\n')
  for (const v of violations) console.error('  ' + v)
  console.error(`\n총 ${violations.length}건`)
  process.exit(1)
}
console.log('check-hardcoded-text: OK')
