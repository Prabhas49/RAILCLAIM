import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, PanelHead } from '../components/ui/Card'
import { Icon, type IconName } from '../components/ui/Icon'
import { cx } from '../lib/cx'
import { formatInr } from '../lib/format'
import {
  ACTIVE_CLAIM,
  CLAIM_FIELDS,
  COMPLIANCE_CHECKS,
  EVIDENCE_PHOTOS,
  OEMS,
  OEM_BY_ID,
  OEM_SCHEMA,
} from '../data/mock'
import type { OemId } from '../types'

export function OemOutput({ onContinue }: { onContinue: () => void }) {
  const [oemId, setOemId] = useState<OemId>(ACTIVE_CLAIM.oem)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const oem = OEM_BY_ID[oemId]

  const payload = useMemo(() => {
    const mapped: Record<string, string | number> = {
      CLAIM_REF: ACTIVE_CLAIM.id,
      OPERATOR: ACTIVE_CLAIM.operator,
      DEPOT: ACTIVE_CLAIM.depot,
      CURRENCY: 'INR',
      CLAIM_AMOUNT: ACTIVE_CLAIM.amountInr,
    }
    for (const field of CLAIM_FIELDS) {
      const key = OEM_SCHEMA[field.id]?.[oemId]
      if (key) mapped[key] = field.value
    }
    return { portal: oem.portal, payload: mapped }
  }, [oemId, oem.portal])

  const json = useMemo(() => JSON.stringify(payload, null, 2), [payload])

  /** Kawasaki needs a warranty proof document this claim does not carry. */
  const missing = oem.requiredFields.filter((id) => !CLAIM_FIELDS.some((f) => f.id === id))
  const satisfied = oem.requiredFields.length - missing.length

  const downloadJson = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ACTIVE_CLAIM.id}-${oemId}-claim.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const submit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1600)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-200/70 pb-1">
        {OEMS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              setOemId(o.id)
              setSubmitted(false)
            }}
            className={cx(
              '-mb-px border-b-2 pb-3 text-[13px] transition-colors',
              o.id === oemId
                ? 'border-slate-900 font-medium text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            )}
          >
            {o.name}
          </button>
        ))}
        <span className="num ml-auto text-[11px] text-slate-400">
          {oem.slaDays} day SLA · {oem.portal}
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card className="bg-slate-100/60 p-5">
            <motion.div
              key={oemId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              className="mx-auto max-w-[680px] rounded-lg bg-white p-7 shadow-paper"
            >
              <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
                <div>
                  <div className="micro">warranty claim</div>
                  <div className="mt-2 text-[15px] font-semibold text-slate-900">
                    {oem.legalName}
                  </div>
                  <div className="mt-1 text-[13px] text-slate-500">
                    {oem.hq} · {oem.portal}
                  </div>
                </div>
                <div className="text-right">
                  <div className="num text-[13px] font-medium text-slate-900">
                    {ACTIVE_CLAIM.id}
                  </div>
                  <div className="num mt-1 text-[11px] text-slate-400">{ACTIVE_CLAIM.coacheset}</div>
                  <div className="mt-2 text-[11px] font-medium text-emerald-600">in warranty</div>
                </div>
              </div>

              <dl className="divide-y divide-slate-100">
                {CLAIM_FIELDS.filter((f) => OEM_SCHEMA[f.id]).map((f) => (
                  <div key={f.id} className="grid grid-cols-[170px_minmax(0,1fr)] gap-4 py-2.5">
                    <dt className="num text-[11px] text-slate-400">
                      {OEM_SCHEMA[f.id][oemId]}
                    </dt>
                    <dd className="num text-[13px] text-slate-900">{f.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-5">
                <div>
                  <div className="micro">total claimed</div>
                  <div className="num mt-2 text-[20px] font-semibold text-slate-900">
                    {formatInr(ACTIVE_CLAIM.amountInr)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="micro">response due</div>
                  <div className="num mt-2 text-[13px] text-slate-700">within {oem.slaDays} days</div>
                </div>
              </div>
            </motion.div>
          </Card>

          <Card flush className="overflow-hidden">
            <PanelHead
              title="Payload"
              description="Machine-readable, ready for the portal API"
              action={
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" icon="download" onClick={downloadJson}>
                    JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={copied ? 'check' : 'file'}
                    onClick={copyJson}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              }
            />
            <pre className="max-h-[280px] overflow-auto scroll-slim bg-slate-900 px-6 py-5 font-mono text-[11px] leading-relaxed text-slate-300">
              {json}
            </pre>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <span className="micro">Compliance</span>
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <span className="body">Required fields</span>
              <span className="num text-[13px] font-medium text-slate-900">
                {satisfied}/{oem.requiredFields.length}
              </span>
            </div>
            <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-slate-100">
              <div
                className={cx(
                  'h-full rounded-full transition-all',
                  missing.length ? 'bg-amber-500' : 'bg-emerald-500',
                )}
                style={{ width: `${(satisfied / oem.requiredFields.length) * 100}%` }}
              />
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              {COMPLIANCE_CHECKS.map((c) => (
                <Check key={c.id} state={c.state} title={c.rule} detail={c.detail} />
              ))}
              {missing.map((m) => (
                <Check
                  key={m}
                  state="fail"
                  title={`${m.replace(/_/g, ' ')} missing`}
                  detail={`${oem.name} will not accept this claim without it.`}
                />
              ))}
            </div>
          </Card>

          <Card>
            <span className="micro">Evidence bundle</span>
            <ul className="mt-4 space-y-3">
              <Bundle title="Voice note · Tamil" detail="26.4 s" />
              <Bundle title="Translation" detail="EN + JA" />
              {EVIDENCE_PHOTOS.map((p) => (
                <Bundle key={p.id} title={p.caption} detail={`${p.annotations.length} reads`} />
              ))}
              <Bundle title="Metadata attestation" detail="hashed" />
            </ul>
          </Card>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="panel p-6"
              >
                <div className="flex items-center gap-2 text-[13px] font-medium text-emerald-600">
                  <Icon name="circleCheck" className="h-4 w-4" />
                  Filed to {oem.portal}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                  {ACTIVE_CLAIM.id} submitted. Response due within {oem.slaDays} days.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  full
                  className="mt-4"
                  iconRight="arrowRight"
                  onClick={onContinue}
                >
                  View audit trail
                </Button>
              </motion.div>
            ) : (
              <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  variant="primary"
                  size="lg"
                  full
                  icon="send"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : `Submit to ${oem.name}`}
                </Button>
                <p className="mt-3 text-center text-[11px] text-slate-400">
                  {missing.length > 0
                    ? `${missing.length} required document(s) missing — expect an RFI.`
                    : 'Demo only. Nothing leaves this session.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Check({
  state,
  title,
  detail,
}: {
  state: 'pass' | 'warn' | 'fail'
  title: string
  detail: string
}) {
  const icon: IconName = state === 'pass' ? 'circleCheck' : state === 'warn' ? 'alert' : 'circleX'
  return (
    <div className="flex items-start gap-3">
      <Icon
        name={icon}
        className={cx(
          'mt-0.5 h-3.5 w-3.5 shrink-0',
          state === 'pass' && 'text-emerald-500',
          state === 'warn' && 'text-amber-500',
          state === 'fail' && 'text-rose-500',
        )}
      />
      <div className="min-w-0">
        <div className="text-[13px] font-medium capitalize text-slate-800">{title}</div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{detail}</p>
      </div>
    </div>
  )
}

function Bundle({ title, detail }: { title: string; detail: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span className="truncate text-[13px] text-slate-600">{title}</span>
      <span className="num shrink-0 text-[11px] text-slate-400">{detail}</span>
    </li>
  )
}
