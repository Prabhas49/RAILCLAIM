import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './ui/Icon'
import {
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

export function VoiceTranslatorModal({
  isOpen,
  onClose,
  onInsertClaimNote,
}: VoiceTranslatorModalProps) {
  const [isListening, setIsListening] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    initSpeechVoices()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = navigator.language || 'en-IN'
    rec.onstart = () => { setIsListening(true); setErrorMessage(null) }
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? ''
      if (text) {
        setInputText(text)
        handleGo(text)
      }
    }
    rec.onerror = (e: any) => {
      setIsListening(false)
      if (e.error === 'not-allowed') setErrorMessage('Microphone blocked. Allow access or just type below.')
      else if (e.error !== 'no-speech') setErrorMessage('Could not hear you. Try again or type below.')
    }
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec
    return () => { try { rec.abort() } catch { /* noop */ } }
  }, [])

  const toggleListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setErrorMessage('Voice input needs Chrome or Edge. You can still type below.')
      return
    }
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      setErrorMessage(null)
      try { recognitionRef.current?.start() }
      catch { setErrorMessage('Microphone busy. Try again.') }
    }
  }

  const handleGo = async (textOverride?: string) => {
    const text = (textOverride ?? inputText).trim()
    if (!text || isWorking) return
    stopAudio()
    setIsWorking(true)
    setErrorMessage(null)
    try {
      const res = await translateToJapanese(text, 'auto')
      setResult(res)
      await playAudio(res.japaneseText)
    } catch (err: any) {
      setErrorMessage(err.message || 'Translation failed. Check your connection.')
    } finally {
      setIsWorking(false)
    }
  }

  const playAudio = async (text: string) => {
    setIsSpeaking(true)
    try {
      await speakJapanese(text, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      })
    } finally {
      setIsSpeaking(false)
    }
  }

  const stopAudio = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    document.querySelectorAll('audio').forEach(a => a.pause())
    setIsSpeaking(false)
  }

  const handleCopy = () => {
    if (result?.japaneseText) navigator.clipboard.writeText(result.japaneseText)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md bg-[#0c0c0c] border border-[#262626] rounded-2xl overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
          <div>
            <h2 className="font-bold text-sm">Voice to Japanese</h2>
            <p className="text-[11px] text-neutral-500">Speak or type → hear it in Japanese</p>
          </div>
          <button onClick={() => { stopAudio(); onClose() }} className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Mic */}
          <div className="flex flex-col items-center py-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-white text-black scale-105 shadow-[0_0_30px_rgba(255,255,255,0.35)]'
                  : 'bg-white/10 text-white border border-white/25 hover:bg-white/20'
              }`}
            >
              <Icon name="mic" className="h-6 w-6" />
            </button>
            <p className={`mt-2.5 text-xs ${isListening ? 'text-white animate-pulse' : 'text-neutral-500'}`}>
              {isListening ? 'Listening… tap to stop' : 'Tap mic to record'}
            </p>
          </div>

          {/* Text input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGo() }}
            placeholder="Or type here in any language…"
            rows={3}
            className="w-full bg-black border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/60 transition-colors resize-none"
          />

          {/* Single action */}
          <button
            type="button"
            onClick={() => handleGo()}
            disabled={!inputText.trim() || isWorking}
            className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
          >
            {isWorking ? 'Translating…' : isSpeaking ? '🔊 Playing Japanese…' : 'Translate & Speak Japanese'}
          </button>

          {errorMessage && (
            <p className="text-xs text-red-400 text-center">{errorMessage}</p>
          )}

          {/* Result */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/15 bg-white/[0.04] p-4">
              <p className="text-lg font-bold leading-relaxed">{result.japaneseText}</p>
              {result.romaji && (
                <p className="mt-1.5 text-xs font-mono text-neutral-400 italic">{result.romaji}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => (isSpeaking ? stopAudio() : playAudio(result.japaneseText))}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${isSpeaking ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-neutral-200'}`}
                >
                  {isSpeaking ? 'Stop' : '🔊 Replay'}
                </button>
                <button onClick={handleCopy} className="rounded-lg border border-white/20 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:border-white/50 transition-colors">
                  Copy
                </button>
                {onInsertClaimNote && (
                  <button
                    onClick={() => onInsertClaimNote(result.japaneseText, result.originalText)}
                    className="rounded-lg border border-white/20 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:border-white/50 transition-colors"
                  >
                    Add to claim
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
