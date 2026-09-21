import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, PanelHead } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { cx } from '../lib/cx'
import { clockFromMs } from '../lib/format'
import { CAPTURE_META, EVIDENCE_PHOTOS, LANGUAGES, TRANSCRIPT } from '../data/mock'

type Phase = 'idle' | 'recording' | 'captured'

const SAMPLE_DURATION = 26400
const BAR_COUNT = 44

export function Capture({ onAnalyse }: { onAnalyse: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [language, setLanguage] = useState('ta')

  useEffect(() => {
    if (phase !== 'recording') return
    const startedAt = Date.now()
    setElapsed(0)
    const id = window.setInterval(() => setElapsed(Date.now() - startedAt), 100)
    return () => window.clearInterval(id)
  }, [phase])

  const lang = LANGUAGES.find((l) => l.code === language)!
  const captured = phase === 'captured'

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_296px]">
      <div className="space-y-5">
        <Card className="flex flex-col items-center py-12">
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <span
              className={cx(
                'h-1.5 w-1.5 rounded-full',
                phase === 'recording' ? 'animate-pulse bg-rose-500' : 'bg-slate-300',
              )}
            />
            {phase === 'recording' ? 'Recording' : captured ? 'Captured' : 'Ready'}
          </div>

          <button
            type="button"
            onClick={() => (phase === 'recording' ? setPhase('captured') : (setElapsed(0), setPhase('recording')))}
            aria-label={phase === 'recording' ? 'Stop recording' : 'Start recording'}
            className={cx(
              'relative mt-8 flex h-20 w-20 items-center justify-center rounded-full text-white transition-all duration-200',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/25',
              phase === 'recording'
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-indigo-600 shadow-mic hover:bg-indigo-500',
            )}
          >
            {phase === 'recording' && (
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-rose-400/30" />
            )}
            <Icon
              name={phase === 'recording' ? 'x' : 'mic'}
              className="relative h-7 w-7"
              strokeWidth={1.9}
            />
          </button>

          <div className="num mt-7 text-[30px] font-semibold leading-none tracking-[-0.02em] text-slate-900">
            {clockFromMs(elapsed)}
          </div>

          <p className="mt-3 text-[13px] text-slate-500">
            {phase === 'recording'
              ? `Speak in ${lang.label} — technical terms survive translation`
              : captured
                ? 'Tap to record again'
                : 'Tap to record the fault report'}
          </p>

          <Waveform active={phase === 'recording'} captured={captured} />

          <div className="mt-8 flex items-center gap-2">
            {!captured && phase !== 'recording' && (
              <Button
                variant="subtle"
                size="sm"
                icon="play"
                onClick={() => (setElapsed(SAMPLE_DURATION), setPhase('captured'))}
              >
                Use sample report
              </Button>
            )}
            {phase === 'recording' && (
              <Button variant="ghost" size="sm" onClick={() => setPhase('idle')}>
                Discard
              </Button>
            )}
            {captured && (
              <Button
                variant="ghost"
                size="sm"
                icon="refresh"
                onClick={() => (setElapsed(0), setPhase('idle'))}
              >
                Clear
              </Button>
            )}
          </div>

          <AnimatePresence>
            {captured && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 max-w-md overflow-hidden px-6 text-center text-[13px] italic leading-relaxed text-slate-500"
              >
                “{TRANSCRIPT[0].translation}”
              </motion.p>
            )}
          </AnimatePresence>
        </Card>

        <Card flush className="overflow-hidden">
          <PanelHead
            title="Evidence"
            description={`${EVIDENCE_PHOTOS.length} photos attached`}
          />
          <div className="grid gap-5 px-6 pb-6 sm:grid-cols-3">
            {EVIDENCE_PHOTOS.map((photo) => (
              <div key={photo.id}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                  <div className="absolute inset-0 grid-paper opacity-50" />
                  {photo.annotations.slice(0, 1).map((a) => (
                    <span
                      key={a.id}
                      className="absolute rounded-sm border border-sky-500/60 bg-sky-500/10"
                      style={{
                        left: `${a.x}%`,
                        top: `${a.y}%`,
                        width: `${a.w}%`,
                        height: `${a.h}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-3 text-[13px] text-slate-600">{photo.caption}</div>
                <div className="num mt-1 text-[11px] text-slate-400">
                  {photo.annotations.length
                    ? `${photo.annotations.length} values read`
                    : 'reference only'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <span className="micro">Language</span>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={cx(
                  'rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                  l.code === language
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                )}
              >
                {l.native}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <span className="micro">Auto-stamped</span>
            <dl className="mt-4 space-y-3">
              <Meta label="GPS" value={CAPTURE_META.gps} />
              <Meta label="Asset" value={CAPTURE_META.assetId} mono />
              <Meta label="Crew" value={CAPTURE_META.crewId} />
              <Meta label="Captured" value={CAPTURE_META.capturedAt} />
              <Meta
                label="Conditions"
                value={`${CAPTURE_META.ambientTemp} · ${CAPTURE_META.runningHours}`}
              />
            </dl>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
              <Icon name="lock" className="mt-px h-3 w-3 shrink-0" />
              Signed on device. Crews cannot edit after capture.
            </p>
          </div>
        </Card>

        <Button
          variant="primary"
          size="lg"
          full
          icon="sparkle"
          disabled={!captured}
          onClick={onAnalyse}
        >
          {captured ? 'Analyse claim' : 'Record a voice note'}
        </Button>
        <p className="text-center text-[11px] text-slate-400">
          Runs six stages: speech, translation, OCR, extraction, mapping, compliance.
        </p>
      </div>
    </div>
  )
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className={cx('truncate text-right text-[13px] text-slate-700', mono && 'num')}>
        {value}
      </dd>
    </div>
  )
}

function Waveform({ active, captured }: { active: boolean; captured: boolean }) {
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setSeed((s) => s + 1), 110)
    return () => window.clearInterval(id)
  }, [active])

  const bars = useMemo(() => {
    if (!active && !captured) return Array.from({ length: BAR_COUNT }, () => 0.06)
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const wave =
        Math.sin((i / BAR_COUNT) * Math.PI * 3 + seed * 0.45) * 0.5 +
        Math.sin((i / BAR_COUNT) * Math.PI * 7.3 + seed * 0.9) * 0.3 +
        Math.sin(i * 1.7 + seed * 1.6) * 0.2
      const envelope = Math.sin((i / (BAR_COUNT - 1)) * Math.PI)
      const value = Math.abs(wave) * envelope
      return active ? Math.max(0.08, value) : Math.max(0.1, value * 0.7)
    })
  }, [active, captured, seed])

  return (
    <div className="mt-8 flex h-10 w-full max-w-[420px] items-center justify-center gap-[3px] px-6">
      {bars.map((b, i) => (
        <span
          key={i}
          className={cx(
            'w-[2px] shrink-0 rounded-full transition-[height] duration-100 ease-out',
            active ? 'bg-rose-400' : captured ? 'bg-indigo-300' : 'bg-slate-200',
          )}
          style={{ height: `${Math.max(2, b * 38)}px` }}
        />
      ))}
    </div>
  )
}
