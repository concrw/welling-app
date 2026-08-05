import * as catalogs from './messages'
import { useLangStore, type Lang } from './langStore'

export { useLangStore, detectDeviceLang } from './langStore'
export type { Lang } from './langStore'

type Catalogs = typeof catalogs

// 각 네임스페이스의 ko 카탈로그 형태가 타입의 기준. en은 각 파일에서 `typeof ko`로 강제된다.
export type Messages = { [K in keyof Catalogs]: Catalogs[K]['ko'] }

const cache: Partial<Record<Lang, Messages>> = {}

export function messagesFor(lang: Lang): Messages {
  const cached = cache[lang]
  if (cached) return cached
  const out = {} as Record<string, unknown>
  for (const [ns, cat] of Object.entries(catalogs)) {
    out[ns] = (cat as Record<Lang, unknown>)[lang]
  }
  cache[lang] = out as Messages
  return cache[lang] as Messages
}

// React 컴포넌트에서 사용. 언어 변경 시 리렌더된다.
export function useMessages(): Messages {
  const lang = useLangStore((s) => s.lang)
  return messagesFor(lang)
}

// React 밖(store 액션, lib 유틸)에서 사용.
export function getMessages(): Messages {
  return messagesFor(useLangStore.getState().lang)
}
