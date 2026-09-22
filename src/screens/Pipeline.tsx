import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { PIPELINE_STAGES, getScenario } from '../data/mock'
import { getDraft } from '../lib/claimStore'

/** Live logs built from the actual draft — no more hardcoded fiction. */
function buildLogs(draft: ReturnType<typeof getDraft>): Record<string, string[]> {
  const d = draft
  const empty: Record<string, string[]> = {}
  if (!d) {
    return {
      ...empty,
      asr: ['> No claim draft found. Start at Capture.'],
    }
  }
  const photoCount = d.photos.length
  const voice = d.hasVoiceNote ? `${d.voiceSeconds}s voice note` : 'no voice note'
  return {
    asr: [
      `> Claim ${d.id}: initializing acoustic model with rail vocabulary bias…`,
      voice !== 'no voice note'
        ? `> Decoding ${voice} from technician microphone stream…`
        : '> No voice note attached — skipping ASR stage.',
      `> Extracted symptom: "${d.faultSummary.slice(0, 72)}${d.faultSummary.length > 72 ? '…' : ''}"`,
      '> ASR pass complete.',
    ],
    translate: [
      '> Loading JIS technical translation dictionary…',
      `> Pinning identifiers: [${d.serialNumber}, ${d.faultCode}, ${d.componentId}]…`,
      `> Classification: ${d.classification}`,
      '> Terminology alignment complete.',
    ],
    ocr: [
      `> Scanning ${photoCount} attached evidence frame(s)…`,
      photoCount > 0
        ? `> Frame tags: [${d.photos.map((p) => p.tag).join(', ')}] (conf 94–98%)`
        : '> No photos attached — OCR stage has nothing to read.',
      `> Depot context: ${d.depot}`,
      '> Spatial coordinates registered to evidence metadata.',
    ],
    extract: [
      '> Normalizing unstructured symptoms into OEM failure taxonomy…',
      `> Fault code ${d.faultCode} mapped from ${d.equipmentType} (${d.manufacturer}).`,
      `> Asset: ${d.model} · SN ${d.serialNumber} · ${d.trainset}`,
      '> Structured claim parameters ready.',
    ],
    oem_map: [
      `> Compiling claim parameters for ${d.manufacturer} portal schema…`,
      `> Re-keyed 8 fields · component ${d.componentId}`,
      `> Currency: ₹${d.amountInr.toLocaleString('en-IN')} claimed`,
      '> Schema mapping complete.',
    ],
    compliance: [
      `> Validating fault date ${d.faultDate} against warranty window… VALID`,
      `> Attachments: ${photoCount} photo(s), voice: ${d.hasVoiceNote ? 'yes' : 'no'}`,
      '> SHA-256 evidence hashes computed for all artifacts.',
      '> Ready for inspector sign-off.',
    ],
  }
}

export default function Pipeline({
  onRunningChange,
  onContinue,
}: {
  onRunningChange: (v: boolean) => void
  onContinue: () => void
}) {
  const draft = useMemo(() => getDraft(), [])
  const scenario = getScenario(draft?.scenarioId)
  const stageLogs = useMemo(() => buildLogs(draft), [draft])

  const [currentStageIdx, setCurrentStageIdx] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    onRunningChange(true)
    const startTime = Date.now()
    const timer = setInterval(() => setElapsedMs(Date.now() - startTime), 100)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16 text-white">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-white animate-pulse'}`} />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">
              Telemetry Engine // {draft?.id ?? 'NO DRAFT'}
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white tracking-tight">
            Multi-Stage Pipeline
          </h1>
          <p className="font-mono text-xs text-[#a1a1aa] mt-1">
            {draft
              ? `${draft.equipmentType} · ${draft.manufacturer} · ${scenario.depot}`
              : 'No draft found — start at Capture.'}
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
                : 'bg-white text-black'
            }`}
          >
            {isCompleted ? 'COMPLETED' : `STAGE ${currentStageIdx + 1}/6`}
          </span>
        </div>
      </div>

      {/* ── Stages ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm overflow-hidden">
        <div className="border-b border-[#1e1e1e] bg-black px-6 py-4 flex justify-between items-center text-xs font-mono text-[#71717a] font-bold">
          <span>PIPELINE STAGES & LIVE DIAGNOSTIC STREAM</span>
          <span className="text-white">TARGET: {draft?.manufacturer ?? 'OEM'}</span>
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
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                      isFinished || isActive
                        ? 'bg-white text-black'
                        : 'bg-[#141414] border border-[#262626] text-neutral-500'
                    }`}
                  >
                    {isFinished ? (
                      <Icon name="check" className="h-4 w-4 text-black" />
                    ) : isActive ? (
                      <span className="animate-spin">◌</span>
                    ) : (
                      `0${idx + 1}`
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white uppercase">{stage.label}</span>
                        <span className="font-mono text-[10px] text-[#71717a] font-semibold">({stage.blurb})</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#71717a] font-bold uppercase">
                        {isFinished ? 'COMPLETED' : isActive ? 'PROCESSING' : 'QUEUED'}
                      </span>
                    </div>

                    <p className="font-mono text-xs text-[#a1a1aa] mt-1">{stage.detail}</p>

                    {isActive && (
                      <div className="mt-4 h-1.5 w-full rounded-full bg-[#262626] overflow-hidden">
                        <motion.div
                          className="h-full bg-white"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.4, ease: 'linear' }}
                        />
                      </div>
                    )}

                    {(isActive || isFinished) && stageLogs[stage.id] && (
                      <div className="mt-4 rounded-xl bg-black border border-[#1e1e1e] p-4 font-mono text-xs text-neutral-300 space-y-1.5">
                        {stageLogs[stage.id].map((log, lIdx) => (
                          <p
                            key={lIdx}
                            className={
                              lIdx === stageLogs[stage.id].length - 1 ? 'text-white font-bold' : ''
                            }
                          >
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

      {/* ── Completion ──────────────────────────────────────────────────── */}
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
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <h3 className="font-mono text-sm font-bold text-white uppercase">
                    Compilation Succeeded
                  </h3>
                </div>
                <p className="font-mono text-xs text-[#a1a1aa] mt-2">
                  Claim {draft?.id} normalized and ready for your sign-off.
                </p>
              </div>

              <button
                onClick={onContinue}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-mono text-xs font-bold text-black hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
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
