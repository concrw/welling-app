import type { PostCategory } from '../store/appStore'
import { CATEGORY_KEYWORDS } from '../data/categoryKeywords'

const MIN_LENGTH_FOR_CHECK = 10

export function looksUnrelatedToCategory(text: string, category: PostCategory): boolean {
  const trimmed = text.trim()
  if (trimmed.length < MIN_LENGTH_FOR_CHECK) return false
  const keywords = CATEGORY_KEYWORDS[category]
  return !keywords.some((k) => trimmed.includes(k))
}
