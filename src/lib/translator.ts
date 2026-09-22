/**
 * Hashi Setu Voice Bridge — Translation & Speech Synthesis Engine
 *
 * Translation: Google Translate GTX endpoint (auto language detection → Japanese)
 * TTS: Vite-proxied Google TTS (via /api/tts → no CORS) → ResponsiveVoice → Web Speech fallback
 */

export interface TranslationResult {
  originalText: string
  japaneseText: string
  romaji: string
  detectedLang: string
  detectedLangName: string
}

export interface SupportedVoiceLang {
  code: string
  bcp47: string
  label: string
  nativeLabel: string
  flag: string
}

export const SUPPORTED_INPUT_LANGS: SupportedVoiceLang[] = [
  { code: 'te', bcp47: 'te-IN', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
  { code: 'en', bcp47: 'en-IN', label: 'English (India)', nativeLabel: 'English', flag: '🇮🇳' },
  { code: 'en-US', bcp47: 'en-US', label: 'English (US)', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'hi', bcp47: 'hi-IN', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', bcp47: 'ta-IN', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ml', bcp47: 'ml-IN', label: 'Malayalam', nativeLabel: 'മലയാളം', flag: '🇮🇳' },
  { code: 'ja', bcp47: 'ja-JP', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵' },
  { code: 'auto', bcp47: 'te-IN', label: 'Auto Detect', nativeLabel: 'Auto', flag: '🌐' },
]

const LANG_NAMES: Record<string, string> = {
  te: 'Telugu (తెలుగు)',
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  ta: 'Tamil (தமிழ்)',
  ml: 'Malayalam (മലയാളം)',
  ja: 'Japanese (日本語)',
  kn: 'Kannada (ಕನ್ನಡ)',
  bn: 'Bengali (বাংলা)',
  mr: 'Marathi (मराठी)',
  es: 'Spanish',
  de: 'German',
  fr: 'French',
}

// ─────────────────────────────────────────────────────────────────────────────
// Translation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Translates input text from any language into Japanese.
 * Returns Kanji/Kana text + Romaji transliteration.
 */
export async function translateToJapanese(
  text: string,
  sourceLang = 'auto'
): Promise<TranslationResult> {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Input text is empty')

  const encoded = encodeURIComponent(trimmed)
  const sl = sourceLang === 'auto' ? 'auto' : sourceLang.split('-')[0]

  // Primary: Google GTX endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=ja&dt=t&dt=rm&q=${encoded}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      let japaneseText = ''
      let romaji = ''
      if (Array.isArray(data[0])) {
        for (const segment of data[0]) {
          if (segment && segment[0] && typeof segment[0] === 'string') japaneseText += segment[0]
          if (segment && segment[2] && typeof segment[2] === 'string' && !romaji) romaji = segment[2]
        }
      }
      const detectedLang = typeof data[2] === 'string' ? data[2] : (sl !== 'auto' ? sl : 'unknown')
      const detectedLangName = LANG_NAMES[detectedLang] || detectedLang.toUpperCase()
      if (japaneseText) {
        return { originalText: trimmed, japaneseText, romaji: romaji || trimmed, detectedLang, detectedLangName }
      }
    }
  } catch (err) {
    console.warn('Primary translation API failed, trying fallback:', err)
  }

  // Fallback: MyMemory
  try {
    const fallbackLangPair = sl === 'auto' ? 'en|ja' : `${sl}|ja`
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=${fallbackLangPair}`)
    if (res.ok) {
      const json = await res.json()
      if (json.responseData?.translatedText) {
        return {
          originalText: trimmed,
          japaneseText: json.responseData.translatedText,
          romaji: '',
          detectedLang: sl,
          detectedLangName: LANG_NAMES[sl] || sl.toUpperCase(),
        }
      }
    }
  } catch (err) {
    console.error('Fallback translation API failed:', err)
  }

  throw new Error('Unable to translate at this time. Please check your internet connection.')
}

// ─────────────────────────────────────────────────────────────────────────────
// Text-to-Speech
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Speaks Japanese text out loud.
 *
 * Priority order:
 *  1. Vite proxy (/api/tts → Google Translate TTS) — fetched as blob, played locally, no CORS
 *  2. ResponsiveVoice "Japanese Female" — CDN script loaded in index.html
 *  3. Web Speech API ja-JP — fallback (requires Japanese voice pack on Windows)
 */
export async function speakJapanese(
  japaneseText: string,
  options: {
    rate?: number
    pitch?: number
    onStart?: () => void
    onEnd?: () => void
    onError?: (err: any) => void
  } = {}
): Promise<void> {
  const rate = options.rate ?? 1.0

  // ── 1. Vite proxy → Google TTS ──────────────────────────────────────────
  try {
    const chunks = japaneseText.length > 180
      ? japaneseText.split(/(?<=[。！？、,])\s*/).filter(Boolean)
      : [japaneseText]

    let started = false

    for (const chunk of chunks) {
      if (!chunk.trim()) continue
      const encoded = encodeURIComponent(chunk)
      // Vite proxies /api/tts → https://translate.googleapis.com/translate_tts
      const res = await fetch(`/api/tts?ie=UTF-8&q=${encoded}&tl=ja&client=tw-ob`)
      if (!res.ok) throw new Error(`Proxy TTS returned ${res.status}`)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)

      await new Promise<void>((resolve, reject) => {
        const audio = new Audio(blobUrl)
        audio.playbackRate = Math.max(0.5, Math.min(rate, 2))
        audio.onplay = () => {
          if (!started) { started = true; options.onStart?.() }
        }
        audio.onended = () => { URL.revokeObjectURL(blobUrl); resolve() }
        audio.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error('audio error')) }
        audio.play().catch((err) => { URL.revokeObjectURL(blobUrl); reject(err) })
      })
    }

    options.onEnd?.()
    return
  } catch (proxyErr) {
    console.warn('[TTS] Proxy failed, trying ResponsiveVoice:', proxyErr)
  }

  // ── 2. ResponsiveVoice ──────────────────────────────────────────────────
  const rv = (window as any).responsiveVoice
  if (rv && typeof rv.speak === 'function') {
    return new Promise((resolve) => {
      rv.speak(japaneseText, 'Japanese Female', {
        rate,
        pitch: options.pitch ?? 1,
        volume: 1,
        onstart: () => options.onStart?.(),
        onend: () => { options.onEnd?.(); resolve() },
        onerror: (err: any) => { options.onError?.(err); resolve() },
      })
    })
  }

  // ── 3. Web Speech API ───────────────────────────────────────────────────
  if (!('speechSynthesis' in window)) {
    throw new Error('No TTS engine available. Please check your browser.')
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(japaneseText)
  utterance.lang = 'ja-JP'
  utterance.rate = rate
  utterance.pitch = options.pitch ?? 1.0

  const voices = window.speechSynthesis.getVoices()
  const jaVoice = voices.find(v => v.lang.toLowerCase().startsWith('ja')) ?? null
  if (jaVoice) utterance.voice = jaVoice

  return new Promise((resolve, reject) => {
    utterance.onstart = () => options.onStart?.()
    utterance.onend = () => { options.onEnd?.(); resolve() }
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      if (e.error === 'interrupted') { resolve(); return }
      options.onError?.(e)
      reject(e)
    }
    setTimeout(() => {
      window.speechSynthesis.resume()
      window.speechSynthesis.speak(utterance)
    }, 50)
  })
}

/**
 * Preload speech synthesis voices on page load (for Web Speech fallback)
 */
export function initSpeechVoices(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.getVoices()
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      window.speechSynthesis.getVoices()
    }, { once: true })
  }
}
