import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { FAILURE_SCENARIOS, getScenario } from '../data/mock'
import { openPrintableVoucher } from '../components/OemPdfVoucher'
import type { ViewId } from '../types'

interface LandingProps {
  onEnter: (v: ViewId, scenario?: '1' | '2' | '3') => void
  onSelectScenario?: (id: '1' | '2' | '3') => void
  onOpenVoiceTranslator?: () => void
}

export default function Landing({
  onEnter,
  onSelectScenario,
  onOpenVoiceTranslator,
}: LandingProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<'1' | '2' | '3'>('1')
  const activeScenario = getScenario(activeScenarioId)

  const handleLaunchScenario = (id: '1' | '2' | '3') => {
    setActiveScenarioId(id)
    onSelectScenario?.(id)
    onEnter('capture', id)
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00c2ff] selection:text-black font-sans">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#1e1e1e] bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00c2ff] text-black font-black text-xs">
              HS
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-white">HASHI SETU</span>
              <span className="rounded border border-[#222] bg-[#111] px-1.5 py-0.5 font-mono text-[9px] text-[#00c2ff]">
                橋・सेतु
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs text-[#888]">
            <a href="#examples" className="hover:text-white transition-colors">Examples</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#results" className="hover:text-white transition-colors">Results</a>
          </nav>

          <div className="flex items-center gap-2.5">
            {onOpenVoiceTranslator && (
              <button
                type="button"
                onClick={onOpenVoiceTranslator}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#00c2ff]/40 bg-[#00c2ff]/10 px-3 py-1.5 text-xs font-semibold text-[#00c2ff] hover:bg-[#00c2ff]/20 transition-all shadow-[0_0_15px_rgba(0,194,255,0.15)]"
                title="Speak in Telugu/English -> Speaks in Japanese out loud"
              >
                <Icon name="mic" className="h-3.5 w-3.5" />
                <span>Voice to Japanese</span>
                <span className="text-[10px] opacity-75 font-mono hidden sm:inline">音声通訳</span>
              </button>
            )}

            <button
              onClick={() => onEnter('dashboard')}
              className="inline-flex items-center gap-2 rounded-full bg-[#00c2ff] px-4 sm:px-5 py-2 text-xs font-bold text-black transition-all hover:bg-[#38d4ff] shadow-md active:scale-95 cursor-pointer"
            >
              <span>Open App</span>
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Simple Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#222] bg-[#0c0c0c] px-3.5 py-1 text-xs text-[#aaa]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Built for Kochi, Chennai & Mumbai Metro Depots</span>
          </div>

          {/* Clean Headline */}
          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Train warranty claims, <br />
            filed in 15 seconds.
          </h1>

          {/* Simple Subtitle */}
          <p className="mx-auto mt-5 max-w-xl text-base text-[#999] leading-relaxed">
            Snap a photo of the damaged train part. Speak what went wrong in your own language (Telugu, Hindi, English). Hashi Setu writes the official claim and speaks Japanese out loud to the OEM.
          </p>

          {/* Simple Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onEnter('capture')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#00c2ff] px-7 py-3 text-sm font-bold text-black hover:bg-[#34d4ff] transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>Create a Claim</span>
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>

            {onOpenVoiceTranslator && (
              <button
                type="button"
                onClick={onOpenVoiceTranslator}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#00c2ff]/40 bg-[#00c2ff]/10 px-6 py-3 text-sm font-semibold text-[#00c2ff] hover:bg-[#00c2ff]/20 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,194,255,0.15)]"
              >
                <Icon name="mic" className="h-4 w-4" />
                <span>Voice Bridge (Telugu &rarr; Japanese)</span>
              </button>
            )}

            <button
              onClick={() => openPrintableVoucher(activeScenario)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#262626] bg-[#111] px-6 py-3 text-sm font-medium text-white hover:bg-[#1a1a1a] transition-all cursor-pointer"
            >
              <span>Download Sample PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3 COMMON TRAIN FAILURES (Interactive) ───────────────────── */}
      <section id="examples" className="py-14 px-6 border-t border-[#1a1a1a] bg-[#080808]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              Try 3 real failure examples
            </h2>
            <p className="mt-1 text-xs text-[#888]">
              Click an example to see its details and download the claim PDF.
            </p>
          </div>

          {/* 3 Simple Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {FAILURE_SCENARIOS.map((sc) => {
              const isSelected = activeScenarioId === sc.id
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScenarioId(sc.id)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#00c2ff] bg-[#0c1824] ring-1 ring-[#00c2ff]'
                      : 'border-[#1e1e1e] bg-[#0e0e0e] hover:border-[#2a2a2a]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#888]">Example {sc.id}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ₹{(sc.amountInr / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-2">{sc.equipment}</h3>
                  <p className="text-xs text-[#00c2ff] mt-0.5">{sc.oemName}</p>
                  <p className="text-xs text-[#777] mt-2 line-clamp-2">{sc.symptom}</p>
                </button>
              )
            })}
          </div>

          {/* Selected Example Detail Box */}
          <div className="mt-6 rounded-xl border border-[#222] bg-[#0e0e0e] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {activeScenario.equipment}
                </h3>
                <p className="text-xs text-[#888] mt-0.5">
                  Made by {activeScenario.oemName} · Serial: <span className="font-mono text-white">{activeScenario.serialNo}</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => openPrintableVoucher(activeScenario)}
                  className="rounded-lg border border-[#262626] bg-[#161616] px-4 py-2 text-xs font-semibold text-white hover:bg-[#222] cursor-pointer"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => handleLaunchScenario(activeScenario.id)}
                  className="rounded-lg bg-[#00c2ff] px-4 py-2 text-xs font-bold text-black hover:bg-[#34d4ff] cursor-pointer"
                >
                  Test this claim in App →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 text-xs">
              <div className="rounded-lg bg-[#141414] p-3.5 border border-[#1f1f1f]">
                <p className="text-[#888] font-semibold text-[11px]">Voice note recorded:</p>
                <p className="mt-1.5 italic text-white">"{activeScenario.transcript[0]?.source}"</p>
                <p className="mt-1.5 text-[#00c2ff]">→ {activeScenario.transcript[0]?.translation}</p>
              </div>

              <div className="rounded-lg bg-[#141414] p-3.5 border border-[#1f1f1f]">
                <p className="text-[#888] font-semibold text-[11px]">What broke:</p>
                <p className="mt-1.5 text-neutral-300 leading-relaxed">{activeScenario.failureDescription}</p>
                <p className="mt-2 text-emerald-400 font-mono text-[10px]">Error code: {activeScenario.faultCode}</p>
              </div>

              <div className="rounded-lg bg-[#141414] p-3.5 border border-[#1f1f1f]">
                <p className="text-[#888] font-semibold text-[11px]">Claim amount:</p>
                <p className="mt-1 text-xl font-bold font-mono text-white">
                  ₹{activeScenario.amountInr.toLocaleString('en-IN')}
                </p>
                <p className="text-[#00c2ff] font-mono text-[11px]">¥{activeScenario.amountJpy.toLocaleString('ja-JP')} JPY</p>
                <p className="mt-1 text-[#777] text-[10px]">Includes new part + depot labor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (3 Simple Steps) ──────────────────────────── */}
      <section id="how-it-works" className="py-16 px-6 border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">How it works</h2>
            <p className="mt-1 text-xs text-[#888]">Three simple steps from depot floor to claim settlement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5">
              <span className="font-mono text-xs font-bold text-[#00c2ff]">Step 1</span>
              <h3 className="font-bold text-sm text-white mt-2">Take a photo & voice note</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Photograph the serial plate on the train part. Describe the issue in Tamil, Hindi, or English.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5">
              <span className="font-mono text-xs font-bold text-[#00c2ff]">Step 2</span>
              <h3 className="font-bold text-sm text-white mt-2">Instant warranty match</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                The system reads the serial number, error code, and checks if the part is still under manufacturer warranty.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5">
              <span className="font-mono text-xs font-bold text-[#00c2ff]">Step 3</span>
              <h3 className="font-bold text-sm text-white mt-2">Download official claim PDF</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Get a clean bilingual Japanese-English claim document with inspector stamp ready to send to the manufacturer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS ─────────────────────────────────────────────────── */}
      <section id="results" className="py-12 px-6 border-t border-[#1a1a1a] bg-[#080808]">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-4">
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">₹1.84 Cr</p>
              <p className="mt-1 text-xs text-[#888]">Warranty recovered</p>
            </div>
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-4">
              <p className="text-2xl sm:text-3xl font-black text-[#00c2ff] font-mono">15 sec</p>
              <p className="mt-1 text-xs text-[#888]">Time to create claim</p>
            </div>
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-4">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100%</p>
              <p className="mt-1 text-xs text-[#888]">Manufacturer accepted</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a] py-8 px-6 text-center text-xs text-[#666]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-bold text-white">HASHI SETU 橋・सेतु</span>
          <span>·</span>
          <span>Connecting Indian Metro Depots with Japanese Train Manufacturers</span>
        </div>
        <p>© 2026 Hashi Setu. All rights reserved.</p>
      </footer>
    </div>
  )
}
