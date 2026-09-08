import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  getLanguage,
  getLocaleTag,
  initI18n,
  Language,
  LANGUAGES,
  setLanguage as persistLanguage,
  subscribe,
  translate,
  TranslateParams,
  TranslationKey,
  watchLanguageChanges
} from './core'

export * from './core'

type TranslateFn = (key: TranslationKey, params?: TranslateParams) => string

interface I18nContextType {
  language: Language
  languages: Language[]
  setLanguage: (language: Language) => void
  localeTag: string
  t: TranslateFn
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getLanguage)

  useEffect(() => {
    const unsubscribe = subscribe(setLanguageState)
    const unwatch = watchLanguageChanges()
    initI18n().then(setLanguageState)
    return () => {
      unsubscribe()
      unwatch()
    }
  }, [])

  const t = useCallback<TranslateFn>(
    (key, params) => translate(key, params, language),
    [language]
  )

  const setLanguage = useCallback((next: Language) => {
    void persistLanguage(next)
  }, [])

  const value = useMemo<I18nContextType>(
    () => ({
      language,
      languages: LANGUAGES,
      setLanguage,
      localeTag: getLocaleTag(language),
      t
    }),
    [language, setLanguage, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

/**
 * Renders a translated string, swapping its `{placeholder}` slots for React
 * nodes. Use it when a value needs its own markup — plain string values should
 * go through `t(key, params)` instead.
 */
export const Interpolate: React.FC<{
  text: string
  values: Record<string, React.ReactNode>
}> = ({ text, values }) => (
  <>
    {text.split(/(\{\w+\})/g).map((part, index) => {
      const match = part.match(/^\{(\w+)\}$/)
      return (
        <React.Fragment key={index}>
          {match && match[1] in values ? values[match[1]] : part}
        </React.Fragment>
      )
    })}
  </>
)

/**
 * Renders a translated string that contains `<b>…</b>` emphasis markers as
 * real elements. Only `<b>` is recognised — everything else stays literal
 * text, so translations can never inject markup.
 */
export const RichText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(<b>.*?<\/b>)/g).map((part, index) => {
      const match = part.match(/^<b>(.*?)<\/b>$/)
      return match ? <strong key={index}>{match[1]}</strong> : <React.Fragment key={index}>{part}</React.Fragment>
    })}
  </>
)
