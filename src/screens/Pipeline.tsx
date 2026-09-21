import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, PanelHead } from '../components/ui/Card'
import { Icon, type IconName } from '../components/ui/Icon'
import { ConfidenceRing } from '../components/ui/Confidence'
import { cx } from '../lib/cx'
import {
  ACTIVE_CLAIM,
  CLAIM_FIELDS,
  COMPLIANCE_CHECKS,
  EVIDENCE_PHOTOS,
  OEM_BY_ID,
  OEM_SCHEMA,
  PIPELINE_STAGES,
  TRANSCRIPT,
} from '../data/mock'

const STAGE_ICONS: Record<string, IconName> = {
  asr: 'mic',
  translate: 'translate',
  ocr: 'scan',
  extract: 'layers',
  oem_map: 'building',
  compliance: 'shield',
}

/** One plain sentence per stage instead of a cluster of badges. */
const SUMMARY: string[] = [
  `${TRANSCRIPT.length} utterances · 26.4 s audio`,
  'translated to English and Japanese, terms preserved',
  `${EVIDENCE_PHOTOS.reduce((s, p) => s + p.annotations.length, 0)} values read from 3 photos`,
  `${CLAIM_FIELDS.length} fields · 1 below the confidence floor`,
  '8 keys remapped into MELCO-WS format',
  '4 passed · 2 warnings',
]

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'i')
  const set = new Set(terms.map((t) => t.toLowerCase()))
  return (
    <>
      {text.split(pattern).map((part, i) =>
        set.has(part.toLowerCase()) ? (
          <span key={i} className="font-medium text-slate-900">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export function Pipeline({
  onRunningChange,
  onContinue,
}: {
  onRunningChange: (running: boolean) => void
  onContinue: () => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  const timer = useRef<number | undefined>(undefined)
  const oem = OEM_BY_ID[ACTIVE_CLAIM.oem]
  const total = PIPELINE_STAGES.length
  const finished = hasRun && !running && activeIndex >= total

  useEffect(() => {
    const t = window.setTimeout(() => setRunning(true), 400)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    onRunningChange(running)
  }, [running, onRunningChange])

  useEffect(() => () => onRunningChange(false), [onRunningChange])

  useEffect(() => {
    if (!running) return
    let i = 0
    let cancelled = false
    const step = () => {
      if (cancelled) return
      if (i >= total) {
        setHasRun(true)
        setRunning(false)
        return
      }
      setActiveIndex(i)
      timer.current = window.setTimeout(() => {
        i += 1
        step()
      }, PIPELINE_STAGES[i].durationMs)
    }
    step()
    return () => {
      cancelled = true
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [running, total])

  const restart = () => {
    setHasRun(false)
    setActiveIndex(0)
    setRunning(true)
  }

  const panelIndex = Math.min(activeIndex, total - 1)
  const panelStage = PIPELINE_STAGES[panelIndex]
  const overall = finished ? 1 : activeIndex / total

  const statusOf = (i: number) => {
    if (running) return i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'
    if (finished) return 'done'
    return i < activeIndex ? 'done' : 'pending'
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-6 py-5">
        <ConfidenceRing value={finished ? 0.89 : Math.min(0.89, 0.3 + overall * 0.6)} size={52} />

        <div className="min-w-[200px] flex-1">
          <div className="strong">
            {finished
              ? 'Analysis complete'
              : running
                ? PIPELINE_STAGES[activeIndex]?.label
                : 'Ready to run'}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-indigo-500"
              animate={{ width: `${Math.max(3, overall * 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

       {(finished || !running) && (
          <Button
            variant={finished ? 'secondary' : 'primary'}
            icon={finished ? 'refresh' : 'play'}
            onClick={restart}
          >
            {finished ? 'Replay' : 'Run'}
          </Button>
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card flush className="overflow-hidden">
          <PanelHead title="Stages" />
          <ol className="relative px-6 pb-6">
            <span
              className="absolute bottom-9 left-[27px] top-2 w-px bg-slate-100"
              aria-hidden="true"
            />
            {PIPELINE_STAGES.map((stage, i) => {
              const s = statusOf(i)
              return (
                <li key={stage.id} className="relative flex gap-4 pb-6 last:pb-0">
                  <span
                    className={cx(
                      'relative z-10 mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full ring-4 ring-white transition-colors',
                      s === 'done' && 'bg-indigo-600',
                      s === 'active' && 'animate-pulse bg-sky-500',
                      s === 'pending' && 'bg-slate-200',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        name={STAGE_ICONS[stage.id]}
                        className={cx('h-3.5 w-3.5', s === 'pending' ? 'text-slate-300' : 'text-slate-400')}
                      />
                      <span className={cx('strong', s === 'pending' && 'text-slate-400')}>
                        {stage.label}
                      </span>
                    </div>

                    {s === 'active' && (
                      <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          key={activeIndex}
                          className="h-full rounded-full bg-sky-400"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: stage.durationMs / 1000, ease: 'linear' }}
                        />
                      </div>
                    )}

                    {s === 'done' ? (
                      <p className="mt-1.5 text-[13px] leading-snug text-slate-500">{SUMMARY[i]}</p>
                    ) : (
                      s === 'pending' && (
                        <p className="mt-1.5 text-[13px] leading-snug text-slate-300">{stage.blurb}</p>
                      )
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>

        <Card flush className="flex min-h-[520px] flex-col overflow-hidden">
          <PanelHead title={panelStage.label} />
          <div className="min-h-0 flex-1 overflow-y-auto scroll-slim px-6 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={panelIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <Artifact index={panelIndex} />
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {finished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap items-center gap-4 border-t border-slate-100 px-6 py-4"
              >
                <span className="body">
                  {CLAIM_FIELDS.length} fields mapped to{' '}
                  <span className="num text-slate-900">{oem.portal}</span> · 2 warnings
                </span>
                <Button
                  variant="primary"
                  className="ml-auto"
                  iconRight="arrowRight"
                  onClick={onContinue}
                >
                  Review
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}

function Artifact({ index }: { index: number }) {
  if (index === 0 || index === 1) return <Transcript showTranslation={index === 1} />
  if (index === 2) return <Ocr />
  if (index === 3) return <Extracted />
  if (index === 4) return <Mapping />
  return <Compliance />
}

function Transcript({ showTranslation }: { showTranslation: boolean }) {
  return (
    <div className="divide-y divide-slate-100">
      {TRANSCRIPT.map((line, i) => (
        <motion.div
          key={line.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          className="py-4 first:pt-0 last:pb-0"
        >
          <p className="text-[13px] leading-relaxed text-slate-800">{line.source}</p>
          {showTranslation && (
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
              <Highlight text={line.translation} terms={line.terms} />
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function Ocr() {
  const photo = EVIDENCE_PHOTOS.find((p) => p.kind === 'hmi') ?? EVIDENCE_PHOTOS[0]
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-xl bg-slate-900">
        <div className="relative flex aspect-[16/9] items-center justify-center">
          <div className="text-center">
            <div className="num text-[11px] uppercase tracking-[0.2em] text-emerald-400/60">
              fault
            </div>
            <div className="num mt-1 text-[26px] font-semibold text-emerald-300">E-042</div>
            <div className="num mt-1 text-[13px] text-emerald-200/70">145.0 °C</div>
          </div>

          {photo.annotations.map((a, i) => (
            <motion.span
              key={a.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.4 }}
              className="absolute rounded-sm border border-sky-400/70"
              style={{
                left: `${a.x}%`,
                top: `${a.y}%`,
                width: `${a.w}%`,
                height: `${a.h}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {EVIDENCE_PHOTOS.flatMap((p) => p.annotations).map((a) => (
          <div key={a.id} className="flex items-center gap-3">
            <span className="num flex-1 text-[13px] text-slate-800">{a.value}</span>
            <span className="text-[13px] text-slate-400">{a.label}</span>
            <span className="num w-10 text-right text-[11px] text-slate-400">
              {Math.round(a.confidence * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Extracted() {
  const grouped = useMemo(() => {
    const order = ['voice', 'photo', 'metadata', 'inferred'] as const
    return order
      .map((source) => ({ source, fields: CLAIM_FIELDS.filter((f) => f.source === source) }))
      .filter((g) => g.fields.length > 0)
  }, [])

  return (
    <div className="space-y-6">
      {grouped.map((group, gi) => (
        <div key={group.source}>
          <span className="micro">from {group.source}</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.fields.map((f, i) => (
              <motion.span
                key={f.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: gi * 0.06 + i * 0.04 }}
                className={cx(
                  'inline-flex items-baseline gap-2 rounded-lg border px-3 py-2',
                  f.confidence < 0.75 ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200',
                )}
              >
                <span className="text-[11px] text-slate-400">{f.label}</span>
                <span className="num text-[13px] text-slate-900">{f.value}</span>
              </motion.span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Mapping() {
  const oem = OEM_BY_ID[ACTIVE_CLAIM.oem]
  const mapped = CLAIM_FIELDS.filter((f) => OEM_SCHEMA[f.id])

  return (
    <div>
      <p className="body">
        Re-keyed for <span className="strong">{oem.name}</span> ·{' '}
        <span className="num">{oem.portal}</span>
      </p>
      <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
        {mapped.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 py-3"
          >
            <span className="num w-[132px] shrink-0 text-[13px] text-slate-400">{f.id}</span>
            <span className="num min-w-0 flex-1 truncate text-[13px] font-medium text-rose-600">
              {OEM_SCHEMA[f.id][ACTIVE_CLAIM.oem]}
            </span>
            <span className="num shrink-0 text-[13px] text-slate-900">{f.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Compliance() {
  const icon: Record<string, IconName> = {
    pass: 'circleCheck',
    warn: 'alert',
    fail: 'circleX',
  }
  return (
    <div className="divide-y divide-slate-100">
      {COMPLIANCE_CHECKS.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.07 }}
          className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
        >
          <Icon
            name={icon[c.state]}
            className={cx(
              'mt-0.5 h-4 w-4 shrink-0',
              c.state === 'pass' && 'text-emerald-500',
              c.state === 'warn' && 'text-amber-500',
              c.state === 'fail' && 'text-rose-500',
            )}
          />
          <div className="min-w-0">
            <div className="strong">{c.rule}</div>
            <p className="mt-1 text-[13px] leading-snug text-slate-500">{c.detail}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
