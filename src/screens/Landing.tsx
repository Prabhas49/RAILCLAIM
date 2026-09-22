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

const STEPS = [
  {
    num: '01',
    title: 'Photograph the nameplate',
    body: 'Serial number, model and manufacturer are read automatically.',
  },
  {
    num: '02',
    title: 'Record the fault',
    body: 'Speak in Telugu, Hindi or English. It is transcribed and translated to Japanese.',
  },
  {
    num: '03',
    title: 'Send the claim',
    body: 'A bilingual PDF with error code, photos and claim amount, ready for the OEM.',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as const },
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
    <div className="min-h-screen bg-black font-sans text-white antialiased">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] font-black text-black">
              HS
            </div>
            <span className="text-sm font-semibold tracking-tight">Hashi Setu</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenVoiceTranslator && (
              <button
                type="button"
                onClick={onOpenVoiceTranslator}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#a1a1aa] transition-colors hover:text-white cursor-pointer"
              >
                <Icon name="mic" className="h-3.5 w-3.5" />
                Voice bridge
              </button>
            )}
            <button
              onClick={() => onEnter('dashboard')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#d4d4d8] cursor-pointer"
            >
              Open App
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-28 pt-44 text-center sm:pb-36 sm:pt-52">
        {/* soft top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_55%_45%_at_50%_-5%,rgba(255,255,255,0.08),transparent)]" />

        <motion.div {...fadeUp} className="relative mx-auto max-w-4xl">
          <h1 className="bg-gradient-to-b from-white via-white to-[#71717a] bg-clip-text text-5xl font-extrabold leading-[1.04] tracking-tighter text-transparent sm:text-7xl">
            Train warranty claims,
            <br />
            filed in 15 seconds.
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[#a1a1aa]">
            Photograph the failed part, describe the fault in your own language, and get a bilingual claim PDF the OEM accepts.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => onEnter('capture')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#d4d4d8] cursor-pointer"
            >
              Create a claim
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>
            <button
              onClick={() => openPrintableVoucher(activeScenario)}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#a1a1aa] transition-colors hover:text-white cursor-pointer"
            >
              View sample claim PDF
              <Icon name="chevronRight" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-28 sm:py-36">
        <motion.div {...fadeUp} className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">How it works.</h2>
          <p className="mt-3 text-sm text-[#71717a]">Three steps from depot floor to claim settlement.</p>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="rounded-3xl border border-white/5 bg-[#0d0d0d] p-8 transition-colors hover:border-white/10"
              >
                <span className="font-mono text-4xl font-bold tracking-tight text-[#3f3f46]">{step.num}</span>
                <h3 className="mt-8 text-lg font-bold tracking-tight">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#a1a1aa]">{step.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Real examples ───────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-28 sm:py-36">
        <motion.div {...fadeUp} className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Real examples.</h2>
          <p className="mt-3 text-sm text-[#71717a]">Pick one to inspect the claim, or open it in the app.</p>

          {/* Scenario selector */}
          <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-3">
            {FAILURE_SCENARIOS.map((sc) => {
              const isSelected = activeScenarioId === sc.id
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScenarioId(sc.id)}
                  className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-white/70 bg-white/[0.05]'
                      : 'border-white/5 bg-[#0d0d0d] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#71717a]">{sc.faultCode}</span>
                    <span className="font-mono font-semibold text-white">
                      ₹{(sc.amountInr / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold tracking-tight">{sc.equipment}</h3>
                  <p className="mt-0.5 text-xs text-[#71717a]">{sc.oemName}</p>
                </button>
              )
            })}
          </div>

          {/* Claim document preview */}
          <motion.div
            key={activeScenario.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 overflow-hidden rounded-3xl border border-white/8 bg-[#0b0b0b]"
          >
            <div className="flex flex-col gap-5 border-b border-white/5 p-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight">{activeScenario.equipment}</h3>
                <p className="mt-1 text-xs text-[#71717a]">
                  {activeScenario.oemName} · Serial{' '}
                  <span className="font-mono text-[#d4d4d8]">{activeScenario.serialNo}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => openPrintableVoucher(activeScenario)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/5 cursor-pointer"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => handleLaunchScenario(activeScenario.id)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-[#d4d4d8] cursor-pointer"
                >
                  Open in app
                </button>
              </div>
            </div>

            <div className="grid gap-x-10 gap-y-6 p-7 text-sm md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a]">Fault code</p>
                <p className="mt-1.5 font-mono text-white">{activeScenario.faultCode}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a]">Claim amount</p>
                <p className="mt-1.5 font-mono text-white">
                  ₹{activeScenario.amountInr.toLocaleString('en-IN')}
                  <span className="text-[#71717a]"> · ¥{activeScenario.amountJpy.toLocaleString('ja-JP')}</span>
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a]">What broke</p>
                <p className="mt-1.5 leading-relaxed text-[#d4d4d8]">{activeScenario.failureDescription}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a]">Reported by technician</p>
                <p className="mt-1.5 leading-relaxed text-[#a1a1aa]">
                  “{activeScenario.transcript[0]?.source}”
                  {activeScenario.transcript[0]?.translation && (
                    <>
                      {' '}— <span className="text-white">{activeScenario.transcript[0]?.translation}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 text-xs text-[#71717a] sm:flex-row sm:items-center sm:justify-between">
          <span>Hashi Setu — warranty claims for Indian metro depots</span>
          <span>© 2026 Hashi Setu</span>
        </div>
      </footer>
    </div>
  )
}
