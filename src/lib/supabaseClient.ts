import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// blob: URL은 세션 밖에서 죽으므로 게시 이미지는 반드시 Storage에 올리고 영구 URL을 저장한다
export async function uploadPostImage(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('post-images').upload(path, file, { contentType: file.type || 'image/jpeg' })
  if (error) return null
  return supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl
}
