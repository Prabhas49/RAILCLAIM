import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, PanelHead } from '../components/ui/Card'
import { SourceChip } from '../components/ui/Badge'
import { ConfidenceBar, ConfidenceRing } from '../components/ui/Confidence'
import { cx } from '../lib/cx'
import { CONFIDENCE_FLOOR } from '../lib/status'
import {
  ACTIVE_CLAIM,
  CAPTURE_META,
  CLAIM_FIELDS,
  EVIDENCE_PHOTOS,
  OEM_BY_ID,
  TRANSCRIPT,
} from '../data/mock'

export function Review({ onContinue }: { onContinue: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(CLAIM_FIELDS.map((f) => [f.id, f.value])),
  )
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})

  const oem = OEM_BY_ID[ACTIVE_CLAIM.oem]

  const lowConfidence = useMemo(
    () => CLAIM_FIELDS.filter((f) => f.confidence < CONFIDENCE_FLOOR),
    [],
  )
  const unresolved = lowConfidence.filter((f) => !confirmed[f.id])
  const overall = useMemo(
    () => CLAIM_FIELDS.reduce((s, f) => s + f.confidence, 0) / CLAIM_FIELDS.length,
    [],
  )

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-6 py-5">
        <ConfidenceRing value={overall} size={52} />

        <div className="flex flex-wrap items-center gap-8">
          <Metric value={String(CLAIM_FIELDS.length)} label="extracted" />
          <Metric
            value={String(CLAIM_FIELDS.length - lowConfidence.length)}
            label="auto-accepted"
            tone="text-emerald-600"
          />
          <Metric
            value={String(unresolved.length)}
            label="need your check"
            tone={unresolved.length ? 'text-amber-600' : undefined}
          />
        </div>

        <Button
          variant="primary"
          className="ml-auto"
          iconRight="arrowRight"
          disabled={unresolved.length > 0}
          onClick={onContinue}
        >
          {unresolved.length ? `Confirm ${unresolved.length} field(s)` : `Build ${oem.name} package`}
        </Button>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        <div className="space-y-5">
          <Card flush className="overflow-hidden">
            <PanelHead title="Transcript" description="Tamil → English" />
            <div className="divide-y divide-slate-100 px-6 pb-6">
              {TRANSCRIPT.map((line) => (
                <div key={line.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-[13px] leading-relaxed text-slate-800">{line.source}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                    {line.translation}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card flush className="overflow-hidden">
            <PanelHead title="Evidence" description={`${EVIDENCE_PHOTOS.length} photos`} />
            <div className="grid gap-5 px-6 pb-6 sm:grid-cols-3">
              {EVIDENCE_PHOTOS.map((photo) => (
                <div key={photo.id}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                    <div className="absolute inset-0 grid-paper opacity-50" />
                    {photo.annotations.map((a) => (
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
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 px-6 py-4 text-[11px] text-slate-400">
              <span>{CAPTURE_META.gps}</span>
              <span>{CAPTURE_META.capturedAt}</span>
              <span className="ml-auto">metadata signed</span>
            </div>
          </Card>
        </div>

        <Card flush className="overflow-hidden">
          <PanelHead title="Structured claim" description={`${oem.name} schema`} />

          <div className="divide-y divide-slate-100 px-6 pb-6">
            {CLAIM_FIELDS.map((field, i) => {
              const low = field.confidence < CONFIDENCE_FLOOR
              const isConfirmed = confirmed[field.id]
              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.025, 0.25) }}
                  className={cx(
                    'py-4 first:pt-0 last:pb-0',
                    low && !isConfirmed && '-mx-3 rounded-lg bg-amber-50/50 px-3',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <label htmlFor={`f-${field.id}`} className="strong">
                      {field.label}
                    </label>
                    {field.oemRequired && (
                      <span className="text-rose-500" title="Required by this OEM">
                        *
                      </span>
                    )}
                    <SourceChip source={field.source} />
                    {low && isConfirmed && (
                      <span className="ml-auto text-[11px] font-medium text-emerald-600">
                        confirmed
                      </span>
                    )}
                  </div>

                  <input
                    id={`f-${field.id}`}
                    value={values[field.id] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                    className="num mt-2.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 focus:border-indigo-400 focus:outline-none"
                  />

                  <div className="mt-2.5 flex items-center gap-3">
                    <ConfidenceBar value={field.confidence} compact className="flex-1" />
                    {low && !isConfirmed && (
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => setConfirmed((c) => ({ ...c, [field.id]: true }))}
                      >
                        Confirm
                      </Button>
                    )}
                  </div>

                  {field.note && (
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{field.note}</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Metric({ value, label, tone }: { value: string; label: string; tone?: string }) {
  return (
    <div>
      <div className={cx('num text-[20px] font-semibold leading-none', tone ?? 'text-slate-900')}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-slate-400">{label}</div>
    </div>
  )
}
