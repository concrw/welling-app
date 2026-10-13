import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'ko' | 'en'

// 언어 선택 UI에 노출하는 표기. 언어명은 번역하지 않고 해당 언어 그대로 보여준다.
export const LANG_LABELS: Record<Lang, string> = { ko: '한국어', en: 'English' }

// 한국 제품이므로 브라우저 로케일과 무관하게 기본값은 한국어다. 사용자가 명시적으로 토글해야 영어로 바뀐다.
export function detectDeviceLang(): Lang {
  return 'ko'
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
    // v2 deliberately resets the old browser-locale-derived value. From this version on,
    // English is persisted only after the user explicitly chooses it in the language toggle.
    { name: 'welling_lang_v2' }
  )
)
