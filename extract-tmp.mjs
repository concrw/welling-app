import { SAMPLE_POSTS, SAMPLE_USERS, generateHistoricalPosts } from './src/data/demo.ts'
const all = [...SAMPLE_POSTS, ...generateHistoricalPosts()]
const users = new Map(SAMPLE_USERS.map(u => [u.name, u]))
const byUser = {}
for (const p of all) byUser[p.user] = (byUser[p.user]||0)+1
console.log('총 게시물:', all.length)
console.log('작성자별:', JSON.stringify(byUser))
console.log('커뮤니티별:', JSON.stringify(all.reduce((a,p)=>(a[p.community]=(a[p.community]||0)+1,a),{})))
console.log('SAMPLE_USERS 이름:', SAMPLE_USERS.map(u=>u.name).join(','))
console.log('댓글 있는 글:', all.filter(p=>p.comments?.length).length)
