import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { PIPELINE_STAGES } from '../data/mock'

const STAGE_LOGS: Record<string, string[]> = {
  asr: [
    '> Initializing acoustic model with rail vocabulary bias...',
    '> Decoding Tamil audio buffer (48kHz, 24.2s duration)...',
    '> Extracted terms: [டிராக்ஷன் மோட்டார், IGBT பால்ட், E-042, 145°C]',
    '> ASR confidence score: 0.962 (PASS)',
  ],
  translate: [
    '> Loading JIS E 4001 technical translation dictionary...',
    '> Pinning equipment identifiers: [MB-5085-A, E-042, CS-10]...',
    '> Synthesized English technical standard: "Traction motor thermal overload..."',
    '> Terminology alignment: 100% compliance',
  ],
  ocr: [
    '> Running multi-spectral vision detector on 3 attached frames...',
    '> Frame 1 (Nameplate): Detected serial "MB5085-2274-K" (conf: 0.914)',
    '> Frame 2 (HMI): Detected diagnostic code "E-042" (conf: 0.941)',
    '> Spatial coordinates registered to evidence metadata',
  ],
  extract: [
    '> Normalizing unstructured symptoms into OEM failure taxonomy...',
    '> Diagnostic code E-042 mapped to supplier failure code: F042',
    '> Failure classification: thermal_overload (Severity: High)',
    '> Estimated labor operation: REPLACE_STATOR_CORE',
  ],
  oem_map: [
    '> Compiling claim parameters into target OEM schema: MELCO-WS...',
    '> Re-keyed 8 fields to MELCO-WS XML specifications',
    '> Verified asset ID: RS-10-KM-0421 against Kochi fleet registry',
    '> Currency conversion: ₹4,82,400 → ¥872,000 equivalent',
  ],
  compliance: [
    '> Validating contractual warranty window (Expires: 2027-03-14)... VALID',
    '> Verifying 3 required attachments for Mitsubishi portal... VALID',
    '> Calculating SHA-256 Merkle block hash: 7f4c9a81e2b04f...',
    '> Ready for inspector sign-off',
  ],
}

export default function Pipeline({
  onRunningChange,
  onContinue,
}: {
  onRunningChange: (v: boolean) => void
  onContinue: () => void
}) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    onRunningChange(true)
    const startTime = Date.now()

    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startTime)
    }, 100)

    const stageInterval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev >= PIPELINE_STAGES.length - 1) {
          clearInterval(stageInterval)
          clearInterval(timer)
          setIsCompleted(true)
          onRunningChange(false)
          return prev
        }
        return prev + 1
      })
    }, 1400)

    return () => {
      clearInterval(stageInterval)
      clearInterval(timer)
      onRunningChange(false)
    }
  }, [onRunningChange])

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16 text-white">
      {/* ── Pipeline Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-[#00c2ff] animate-pulse'}`} />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">
              Neural Telemetry Engine // Job Ref #2026-KM-0421
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white tracking-tight">
            Multi-Stage Neural Pipeline
          </h1>
          <p className="font-mono text-xs text-[#a1a1aa] mt-1">
            Real-time multimodal normalization for Mitsubishi MELCO-WS
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded-full bg-[#141414] px-4 py-1.5 text-[#a1a1aa] font-bold border border-[#262626]">
            Elapsed: {(elapsedMs / 1000).toFixed(1)}s
          </span>
          <span
            className={`rounded-full px-4 py-1.5 font-bold ${
              isCompleted
                ? 'bg-[#062618] text-[#10b981] border border-[#059669]/40'
                : 'bg-[#00c2ff] text-black'
            }`}
          >
            {isCompleted ? 'COMPLETED' : `STAGE ${currentStageIdx + 1}/6`}
          </span>
        </div>
      </div>

      {/* ── Stages Execution List ───────────────────────────────────── */}
      <div className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm overflow-hidden">
        <div className="border-b border-[#1e1e1e] bg-black px-6 py-4 flex justify-between items-center text-xs font-mono text-[#71717a] font-bold">
          <span>PIPELINE STAGES & LIVE DIAGNOSTIC STREAM</span>
          <span className="text-[#00c2ff]">TARGET OEM: MITSUBISHI ELECTRIC</span>
        </div>

        <div className="divide-y divide-[#1e1e1e] p-3">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isFinished = idx < currentStageIdx || isCompleted
            const isActive = idx === currentStageIdx && !isCompleted

            return (
              <div
                key={stage.id}
                className={`p-6 transition-colors rounded-xl ${
                  isActive ? 'bg-[#141414]' : isFinished ? 'bg-[#0a0a0a]' : 'opacity-40'
                }`}
              >
                <div className="flex items-start gap-5">
                  {/* Status Indicator */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                      isFinished
                        ? 'bg-[#00c2ff] text-black'
                        : isActive
                        ? 'bg-white text-black'
                        : 'bg-[#141414] border border-[#262626] text-neutral-500'
                    }`}
                  >
                    {isFinished ? (
                      <Icon name="check" className="h-4 w-4 text-black" />
                    ) : isActive ? (
                      <span className="animate-spin font-sans text-xs">◌</span>
                    ) : (
                      `0${idx + 1}`
                    )}
                  </div>

                  {/* Stage Title & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white uppercase">
                          {stage.label}
                        </span>
                        <span className="font-mono text-[10px] text-[#71717a] font-semibold">({stage.blurb})</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#71717a] font-bold uppercase">
                        {isFinished ? 'COMPLETED' : isActive ? 'PROCESSING' : 'QUEUED'}
                      </span>
                    </div>

                    <p className="font-mono text-xs text-[#a1a1aa] mt-1">{stage.detail}</p>

                    {/* Stage Progress Bar */}
                    {isActive && (
                      <div className="mt-4 h-1.5 w-full rounded-full bg-[#262626] overflow-hidden">
                        <motion.div
                          className="h-full bg-[#00c2ff]"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.4, ease: 'linear' }}
                        />
                      </div>
                    )}

                    {/* Diagnostic Logs Stream */}
                    {(isActive || isFinished) && STAGE_LOGS[stage.id] && (
                      <div className="mt-4 rounded-xl bg-black border border-[#1e1e1e] p-4 font-mono text-xs text-neutral-300 space-y-1.5">
                        {STAGE_LOGS[stage.id].map((log, lIdx) => (
                          <p key={lIdx} className={lIdx === STAGE_LOGS[stage.id].length - 1 ? 'text-[#00c2ff] font-bold' : ''}>
                            {log}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Completion & Transition Card ────────────────────────────── */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] p-8 shadow-sm text-white"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00c2ff] text-black">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <h3 className="font-mono text-sm font-bold text-white uppercase">
                    Compilation Succeeded // Sub-15s Target Met
                  </h3>
                </div>
                <p className="font-mono text-xs text-[#a1a1aa] mt-2">
                  Draft claim initialized with 8 standardized parameters and cryptographic audit verification hash.
                </p>
              </div>

              <button
                onClick={onContinue}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#00c2ff] px-8 py-4 font-mono text-xs font-bold text-black hover:bg-[#2ed2ff] transition-colors shadow-sm"
              >
                <span>PROCEED TO REVIEW</span>
                <Icon name="arrowRight" className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
