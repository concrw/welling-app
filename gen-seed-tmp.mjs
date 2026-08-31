import { SAMPLE_POSTS, SAMPLE_USERS, SAMPLE_COMMUNITIES, generateHistoricalPosts } from './src/data/demo.ts'
import crypto from 'crypto'

// 이름 -> 결정적 UUID (재실행해도 동일, 중복 삽입 방지)
const uid = (name) => {
  const h = crypto.createHash('sha256').update('welling-seed:'+name).digest('hex')
  return [h.slice(0,8),h.slice(8,12),'4'+h.slice(13,16),
          ((parseInt(h[16],16)&0x3|0x8).toString(16))+h.slice(17,20),h.slice(20,32)].join('-')
}
const q = s => "'" + String(s).replace(/'/g,"''") + "'"

const all = [...SAMPLE_POSTS, ...generateHistoricalPosts()].filter(p => p.user !== 'Min')
const authors = SAMPLE_USERS.filter(u => all.some(p => p.user === u.name))

// demo가 참조하지만 DB에 없는 커뮤니티
const usedComm = [...new Set(all.map(p=>p.community))]
const known = new Map(SAMPLE_COMMUNITIES.map(c=>[c.id,c]))
const extra = { 'strength-lab': {name:'Strength Lab',initial:'S',members:445,focus:'strength records',desc:'근력 운동 루틴을 함께 기록하는 커뮤니티.'},
                'mind-first':  {name:'Mind First', initial:'M',members:312,focus:'mindfulness records',desc:'명상과 마음 챙김 루틴 공유.'} }

const L = []
L.push('-- 시드 데이터: src/data/demo.ts 기준. 결정적 UUID라 재실행해도 중복되지 않는다.')
L.push('begin;')
L.push('-- 1) 누락 커뮤니티')
for (const id of usedComm) {
  if (known.has(id)) continue
  const c = extra[id]; if (!c) throw new Error('unknown community '+id)
  L.push(`insert into public.communities (id,name,initial,members,focus,"desc") values (${q(id)},${q(c.name)},${q(c.initial)},${c.members},${q(c.focus)},${q(c.desc)}) on conflict (id) do nothing;`)
}
L.push('-- 2) 가상 작성자 프로필')
for (const u of authors)
  L.push(`insert into public.profiles (id,nickname,bio) values (${q(uid(u.name))},${q(u.name)},${q(u.bio)}) on conflict (id) do nothing;`)
L.push('-- 3) 게시물')
for (const p of all) {
  const pid = uid('post:'+p.id)
  L.push(`insert into public.posts (id,user_id,content,community_id,created_at,visibility,category) values (${q(pid)},${q(uid(p.user))},${q(p.content)},${q(p.community)},to_timestamp(${Math.round(p.createdAt/1000)}),'public','habit') on conflict (id) do nothing;`)
  for (const c of (p.comments ?? [])) {
    if (!authors.some(a=>a.name===c.user)) continue
    L.push(`insert into public.post_comments (post_id,user_id,text) select ${q(pid)},${q(uid(c.user))},${q(c.text)} where not exists (select 1 from public.post_comments where post_id=${q(pid)} and user_id=${q(uid(c.user))} and text=${q(c.text)});`)
  }
}
L.push('commit;')
console.log(L.join('\n'))
