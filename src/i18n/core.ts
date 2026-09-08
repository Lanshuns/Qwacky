import { en, TranslationKey, Translations } from './locales/en'
import { es } from './locales/es'

export type { TranslationKey, Translations }

export type Language = 'en' | 'es'

export const LANGUAGES: Language[] = ['en', 'es']

export const STORAGE_KEY = 'language'

const bundles: Record<Language, Translations> = { en, es }

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (LANGUAGES as string[]).includes(value)

export const detectLanguage = (): Language => {
  const candidates = [
    ...(typeof navigator !== 'undefined' && Array.isArray(navigator.languages)
      ? navigator.languages
      : []),
    typeof navigator !== 'undefined' ? navigator.language : ''
  ]

  for (const candidate of candidates) {
    const base = String(candidate || '').toLowerCase().split('-')[0]
    if (isLanguage(base)) return base
  }

  return 'en'
}

const readStoredLanguage = (): Language | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) return saved
  } catch {}
  return null
}

let currentLanguage: Language = readStoredLanguage() ?? detectLanguage()

const listeners = new Set<(language: Language) => void>()

export const getLanguage = (): Language => currentLanguage

export const subscribe = (listener: (language: Language) => void): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const applyLanguage = (language: Language) => {
  if (language === currentLanguage) return
  currentLanguage = language
  try {
    document.documentElement.lang = language
  } catch {}
  listeners.forEach(listener => listener(language))
}

export interface TranslateParams {
  [key: string]: string | number | undefined
  count?: number
}

const interpolate = (template: string, params?: TranslateParams): string => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

/**
 * Translate a key for the current language.
 *
 * When `params.count` is present, `<key>_one` / `<key>_other` variants are
 * preferred over the bare key, so callers get the right plural form.
 */
export const translate = (
  key: TranslationKey,
  params?: TranslateParams,
  language: Language = currentLanguage
): string => {
  const bundle = bundles[language] || en

  let template: string | undefined
  if (params && typeof params.count === 'number') {
    const variant = `${key}_${params.count === 1 ? 'one' : 'other'}` as TranslationKey
    template = bundle[variant] ?? en[variant]
  }

  template = template ?? bundle[key] ?? en[key]

  if (template === undefined) {
    return key
  }

  return interpolate(template, params)
}

export const t = translate

/** BCP 47 tag used for Intl date/number formatting. */
export const getLocaleTag = (language: Language = currentLanguage): string =>
  translate('locale.tag', undefined, language)

/**
 * Load the persisted language (if any) and keep this context in sync with
 * changes made from other extension pages.
 */
export const initI18n = async (): Promise<Language> => {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    if (isLanguage(result?.[STORAGE_KEY])) {
      applyLanguage(result[STORAGE_KEY])
      try {
        localStorage.setItem(STORAGE_KEY, result[STORAGE_KEY])
      } catch {}
    } else {
      await chrome.storage.local.set({ [STORAGE_KEY]: currentLanguage })
    }
  } catch {}

  try {
    document.documentElement.lang = currentLanguage
  } catch {}

  return currentLanguage
}

export const watchLanguageChanges = (): (() => void) => {
  const handleChange = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName !== 'local') return
    const next = changes[STORAGE_KEY]?.newValue
    if (isLanguage(next)) {
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {}
      applyLanguage(next)
    }
  }

  try {
    chrome.storage.onChanged.addListener(handleChange)
  } catch {
    return () => {}
  }

  return () => {
    try {
      chrome.storage.onChanged.removeListener(handleChange)
    } catch {}
  }
}

export const setLanguage = async (language: Language): Promise<void> => {
  if (!isLanguage(language)) return
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {}
  applyLanguage(language)
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: language })
  } catch {}
}
