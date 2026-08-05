import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'ko' | 'en'

// 언어 선택 UI에 노출하는 표기. 언어명은 번역하지 않고 해당 언어 그대로 보여준다.
export const LANG_LABELS: Record<Lang, string> = { ko: '한국어', en: 'English' }

export function detectDeviceLang(): Lang {
  const l = typeof navigator !== 'undefined' ? navigator.language : ''
  return l.toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: detectDeviceLang(),
      setLang: (lang) => set({ lang }),
    }),
    { name: 'welling_lang_v1' }
  )
)
