import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from './ui/Icon'
import {
  SUPPORTED_INPUT_LANGS,
  translateToJapanese,
  speakJapanese,
  initSpeechVoices,
  type TranslationResult,
} from '../lib/translator'

interface VoiceTranslatorModalProps {
  isOpen: boolean
  onClose: () => void
  onInsertClaimNote?: (japaneseText: string, originalText: string) => void
}

const PRESET_PHRASES = [
  {
    lang: 'te',
    label: 'బ్రేకుల సమస్య (Telugu)',
    text: 'నమస్కారం, రైలు బ్రేకులు పనిచేయడం లేదు, అత్యవసర తనిఖీ అవసరం.',
    meaning: 'Hello, train brakes are not working, urgent inspection needed.',
  },
  {
    lang: 'te',
    label: 'మోటారు వేడెక్కడం (Telugu)',
    text: 'ట్రాక్షన్ మోటారు ఉష్ణోగ్రత 85 డిగ్రీలు దాటింది.',
    meaning: 'Traction motor temperature exceeded 85 degrees.',
  },
  {
    lang: 'en',
    label: 'Brake Pressure Drop (English)',
    text: 'Main reservoir brake cylinder pressure dropped below 4.5 bar.',
    meaning: 'BCU cylinder pressure loss logged on Kochi line.',
  },
  {
    lang: 'hi',
    label: 'पैंटोग्राफ खराबी (Hindi)',
    text: 'ओवरहेड वायर पर पैंटोग्राफ से स्पार्किंग हो रही है।',
    meaning: 'Pantograph arcing observed on overhead catenary wire.',
  },
]

export function VoiceTranslatorModal({
  isOpen,
  onClose,
  onInsertClaimNote,
}: VoiceTranslatorModalProps) {
  const [selectedLang, setSelectedLang] = useState('te') // Default to Telugu as requested!
  const [isListening, setIsListening] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [inputText, setInputText] = useState('')
  const [interimText, setInterimText] = useState('')
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [copied, setCopied] = useState(false)
  const [inserted, setInserted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)

  // Initialize voices on mount
  useEffect(() => {
    initSpeechVoices()
  }, [])

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true

      // Map language code to BCP-47
      const langConfig = SUPPORTED_INPUT_LANGS.find((l) => l.code === selectedLang)
      recognition.lang = langConfig?.bcp47 || 'te-IN'

      recognition.onstart = () => {
        setIsListening(true)
        setErrorMessage(null)
        setInterimText('')
      }

      recognition.onresult = (event: any) => {
        let finalTrans = ''
        let interimTrans = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript
          } else {
            interimTrans += event.results[i][0].transcript
          }
        }

        if (interimTrans) {
          setInterimText(interimTrans)
        }

        if (finalTrans) {
          setInputText(finalTrans)
          setInterimText('')
          // Auto translate on speech complete
          handleTranslate(finalTrans)
        }
      }

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions or type your text below.')
        } else if (event.error === 'no-speech') {
          // Silent timeout, safe to ignore
        } else {
          setErrorMessage(`Audio note: ${event.error}. You can also type directly in the box below.`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [selectedLang])

  const toggleListening = () => {
    setErrorMessage(null)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type in the box below.'
      )
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        const langConfig = SUPPORTED_INPUT_LANGS.find((l) => l.code === selectedLang)
        if (recognitionRef.current) {
          recognitionRef.current.lang = langConfig?.bcp47 || 'te-IN'
          recognitionRef.current.start()
        }
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err)
        // If already started, stop and restart
        recognitionRef.current?.abort()
        setTimeout(() => {
          try {
            recognitionRef.current?.start()
          } catch (e) {
            setErrorMessage('Could not initialize microphone. Please type your phrase below.')
          }
        }, 150)
      }
    }
  }

  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate ?? inputText
    if (!text.trim()) return

    setIsTranslating(true)
    setErrorMessage(null)

    try {
      const res = await translateToJapanese(text, selectedLang)
      setResult(res)

      if (autoSpeak && res.japaneseText) {
        speak(res.japaneseText)
      }
    } catch (err: any) {
      console.error('Translation error:', err)
      setErrorMessage(err.message || 'Translation failed. Please verify your connection.')
    } finally {
      setIsTranslating(false)
    }
  }

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  const speak = async (japaneseText?: string) => {
    const text = japaneseText ?? result?.japaneseText
    if (!text) return

    // If already speaking, stop first then replay
    if (isSpeaking) {
      stopSpeaking()
      // Small delay so cancel() fully flushes before we start again
      await new Promise((r) => setTimeout(r, 120))
    }

    setIsSpeaking(true)
    try {
      await speakJapanese(text, {
        rate: playbackSpeed,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      })
    } catch {
      // Ignore — onerror callback already clears isSpeaking
    } finally {
      setIsSpeaking(false)
    }
  }

  const handleCopy = () => {
    if (!result?.japaneseText) return
    navigator.clipboard.writeText(result.japaneseText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    if (!result?.japaneseText) return
    onInsertClaimNote?.(result.japaneseText, result.originalText)
    setInserted(true)
    setTimeout(() => setInserted(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-[#0d0f12] border border-[#222933] rounded-2xl shadow-[0_0_50px_rgba(0,194,255,0.15)] flex flex-col overflow-hidden text-white"
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c222c] bg-[#11141a]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#00c2ff]/10 border border-[#00c2ff]/40 flex items-center justify-center text-[#00c2ff]">
              <Icon name="translate" className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm tracking-wide text-white">
                  VOICE TO JAPANESE
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00c2ff]/20 text-[#00c2ff] border border-[#00c2ff]/30 font-bold">
                  音声ブリッジ
                </span>
              </div>
              <p className="text-[11px] text-[#8696a7]">
                Speak in Telugu, English, or any language &bull; Instant Japanese Voice Output
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#718295] hover:text-white hover:bg-[#1a202a] transition-colors"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Language Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#718295] uppercase">
                YOUR SPOKEN LANGUAGE
              </span>
              <span className="text-[10px] text-[#00c2ff] font-mono">
                Target: 日本語 (Japanese)
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {SUPPORTED_INPUT_LANGS.slice(0, 4).map((lang) => {
                const isSelected = selectedLang === lang.code
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.code)
                      if (isListening) {
                        recognitionRef.current?.stop()
                        setIsListening(false)
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#00c2ff]/15 border-[#00c2ff] text-white shadow-[0_0_15px_rgba(0,194,255,0.25)]'
                        : 'bg-[#141820] border-[#222933] text-[#8ea0b4] hover:text-white hover:border-[#354050]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Secondary Language Chips */}
            <div className="flex items-center gap-2 mt-2">
              {SUPPORTED_INPUT_LANGS.slice(4).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code)
                    if (isListening) {
                      recognitionRef.current?.stop()
                      setIsListening(false)
                    }
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    selectedLang === lang.code
                      ? 'bg-[#00c2ff]/20 border-[#00c2ff] text-white'
                      : 'bg-[#101318] border-[#1d232c] text-[#718295] hover:text-neutral-300'
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Central Microphone / Speech Bar */}
          <div className="relative rounded-2xl bg-[#12161f] border border-[#202733] p-5 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Ambient Animated Glow when listening */}
            {isListening && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.15),transparent_70%)] pointer-events-none animate-pulse" />
            )}

            {/* Speaking audio wave animation */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />
            )}

            {/* Big Glow Microphone Button */}
            <div className="relative my-2">
              {isListening && (
                <>
                  <span className="absolute -inset-3 rounded-full bg-[#00c2ff]/30 animate-ping" />
                  <span className="absolute -inset-6 rounded-full bg-[#00c2ff]/10 animate-pulse" />
                </>
              )}

              <button
                type="button"
                onClick={toggleListening}
                className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                  isListening
                    ? 'bg-[#00c2ff] text-black scale-110 shadow-[0_0_35px_rgba(0,194,255,0.8)]'
                    : 'bg-[#1a212d] text-[#00c2ff] border border-[#00c2ff]/40 hover:scale-105 hover:border-[#00c2ff] hover:bg-[#202938]'
                }`}
                title={isListening ? 'Click to Stop' : 'Click to Speak'}
              >
                <Icon name="mic" className="h-8 w-8" />
              </button>
            </div>

            {/* Status & Soundwave Indicator */}
            <div className="mt-3 flex flex-col items-center gap-1.5">
              <span
                className={`font-mono text-xs font-bold tracking-widest ${
                  isListening
                    ? 'text-[#00c2ff] animate-pulse'
                    : isSpeaking
                    ? 'text-emerald-400'
                    : 'text-[#8ea0b4]'
                }`}
              >
                {isListening
                  ? selectedLang === 'te'
                    ? '🎙️ మాట్లాడండి (LISTENING TO TELUGU...)'
                    : '🎙️ LISTENING TO YOUR SPEECH...'
                  : isSpeaking
                  ? '🔊 SPEAKING IN JAPANESE (日本語で発音中)...'
                  : 'CLICK MIC TO SPEAK OR TYPE BELOW'}
              </span>

              {/* Animated Soundwave bars when active */}
              {(isListening || isSpeaking) && (
                <div className="flex items-center gap-1 h-5 mt-1">
                  {[40, 75, 95, 60, 80, 100, 50, 85, 65, 90, 45].map((h, i) => (
                    <motion.span
                      key={i}
                      className={`w-1 rounded-full ${isSpeaking ? 'bg-emerald-400' : 'bg-[#00c2ff]'}`}
                      animate={{
                        height: ['4px', `${(h / 100) * 18}px`, '4px'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.7,
                        delay: (i * 0.08) % 0.5,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Real-time Interim speech preview */}
            {interimText && (
              <div className="mt-3 px-4 py-2 rounded-xl bg-[#090b0e] border border-[#00c2ff]/30 text-neutral-300 text-xs font-medium italic animate-pulse max-w-md">
                "{interimText}..."
              </div>
            )}
          </div>

          {/* Spoken Text / Input Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold tracking-widest text-[#718295] uppercase">
                TRANSCRIPT / INPUT TEXT
              </label>
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="text-[10px] text-[#718295] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  selectedLang === 'te'
                    ? 'ఇక్కడ తెలుగులో మాట్లాడండి లేదా టైప్ చేయండి (ఉదా: రైలు బ్రేకులు పనిచేయడం లేదు)...'
                    : 'Speak or type any sentence here...'
                }
                rows={2}
                className="w-full bg-[#12161f] border border-[#202733] rounded-xl px-4 py-3 text-sm text-white placeholder-[#546274] focus:outline-none focus:border-[#00c2ff] focus:ring-1 focus:ring-[#00c2ff] transition-all resize-none"
              />

              <div className="absolute right-2.5 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTranslate()}
                  disabled={!inputText.trim() || isTranslating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00c2ff] text-black font-bold text-xs hover:bg-[#33d0ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isTranslating ? (
                    <>
                      <Icon name="refresh" className="h-3.5 w-3.5 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="sparkle" className="h-3.5 w-3.5" />
                      <span>Translate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Railway Presets (1-Click demo in Telugu & English) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#718295] uppercase">
              QUICK TEST PRESETS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_PHRASES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedLang(preset.lang)
                    setInputText(preset.text)
                    handleTranslate(preset.text)
                  }}
                  className="text-left p-2.5 rounded-xl bg-[#11141b] border border-[#1d232e] hover:border-[#00c2ff]/50 hover:bg-[#151923] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#00c2ff]">
                      {preset.label}
                    </span>
                    <Icon
                      name="arrowRight"
                      className="h-3 w-3 text-[#546274] group-hover:text-white group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                  <p className="text-xs text-white mt-1 line-clamp-1">{preset.text}</p>
                  <p className="text-[10px] text-[#6d7f94] mt-0.5">{preset.meaning}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <Icon name="alert" className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── Japanese Translation Output Card ────────────────────── */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-[#0e1722] border border-[#00c2ff]/40 p-5 space-y-4 shadow-[0_0_30px_rgba(0,194,255,0.08)]"
            >
              <div className="flex items-center justify-between border-b border-[#1b2b3d] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇯🇵</span>
                  <div>
                    <h3 className="font-extrabold text-white text-xs tracking-wider">
                      JAPANESE OUTPUT (日本語)
                    </h3>
                    <p className="text-[10px] text-[#00c2ff] font-mono">
                      Detected: {result.detectedLangName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed toggle */}
                  <div className="flex items-center gap-1 bg-[#09111a] rounded-lg p-0.5 border border-[#1a2d40] text-[10px] font-mono">
                    {[0.8, 1.0, 1.2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-0.5 rounded ${
                          playbackSpeed === speed
                            ? 'bg-[#00c2ff] text-black font-bold'
                            : 'text-[#708aa8] hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  {/* Stop / Replay button — always clickable */}
                  <button
                    onClick={() =>
                      isSpeaking ? stopSpeaking() : speak(result.japaneseText)
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      isSpeaking
                        ? 'bg-red-500 text-white hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Icon name="x" className="h-3.5 w-3.5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Icon name="play" className="h-3 w-3 fill-black" />
                        <span>Play Japanese 🔊</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Japanese Kanji/Kana Primary Display with big replay button */}
              <div className="relative bg-[#080d14] rounded-xl p-4 border border-[#152332] group">
                <p className="text-xl sm:text-2xl font-bold text-white tracking-wide leading-relaxed font-sans pr-12">
                  {result.japaneseText}
                </p>

                {/* Big floating replay button on the card — always visible, one tap to replay */}
                <button
                  onClick={() => speak(result.japaneseText)}
                  title={isSpeaking ? 'Replaying...' : 'Tap to replay Japanese'}
                  className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                    isSpeaking
                      ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-110'
                      : 'bg-[#152332] text-[#00c2ff] border border-[#1e3348] hover:bg-[#00c2ff] hover:text-black hover:scale-105'
                  }`}
                >
                  {isSpeaking ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="text-sm"
                    >
                      🔊
                    </motion.span>
                  ) : (
                    <span className="text-sm">↺</span>
                  )}
                </button>

                {/* Romaji Phonetics */}
                {result.romaji && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#121c27] flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#00c2ff] font-bold">
                      ROMAJI:
                    </span>
                    <span className="text-xs font-mono text-[#a1b7cf] italic">
                      {result.romaji}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Copy / Insert */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-[#8095ad] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="rounded border-[#253648] bg-[#101924] text-[#00c2ff] focus:ring-0"
                  />
                  <span>Auto-speak Japanese on voice input</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#21354a] bg-[#0c141e] text-xs font-medium text-[#9eb6ce] hover:text-white hover:border-[#00c2ff]/40 transition-colors"
                  >
                    <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy Japanese'}</span>
                  </button>

                  {onInsertClaimNote && (
                    <button
                      type="button"
                      onClick={handleInsert}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00c2ff]/30 bg-[#00c2ff]/10 text-xs font-medium text-[#00c2ff] hover:bg-[#00c2ff]/20 transition-colors"
                    >
                      <Icon name={inserted ? 'check' : 'plus'} className="h-3.5 w-3.5" />
                      <span>{inserted ? 'Inserted' : 'Add to Claim Note'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-[#1b222d] bg-[#0d1016] flex items-center justify-between text-[11px] text-[#6d7f94]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Web Speech &bull; ja-JP Audio Engine Active</span>
          </div>
          <span>Hashi Setu Rolling Stock Field Voice Bridge</span>
        </div>
      </motion.div>
    </div>
  )
}
