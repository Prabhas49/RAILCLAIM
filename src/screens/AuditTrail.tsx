import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, PanelHead } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { cx } from '../lib/cx'
import { ACTIVE_CLAIM, AUDIT_EVENTS, OEM_BY_ID } from '../data/mock'
import type { AuditEvent } from '../types'

const DOT: Record<AuditEvent['kind'], string> = {
  capture: 'bg-violet-500',
  ai: 'bg-sky-500',
  human: 'bg-emerald-500',
  system: 'bg-amber-500',
}

const LABEL: Record<AuditEvent['kind'], string> = {
  capture: 'capture',
  ai: 'ai',
  human: 'human',
  system: 'system',
}

export function AuditTrail({ onBack }: { onBack: () => void }) {
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const oem = OEM_BY_ID[ACTIVE_CLAIM.oem]

  const verify = () => {
    setVerifying(true)
    window.setTimeout(() => {
      setVerifying(false)
      setVerified(true)
    }, 1300)
  }

  const exportBundle = () => {
    const blob = new Blob([JSON.stringify(AUDIT_EVENTS, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ACTIVE_CLAIM.id}-audit-trail.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-4 py-5">
        <div className="min-w-0 flex-1">
          <div className="strong">{ACTIVE_CLAIM.id}</div>
          <p className="mt-1 text-[13px] text-slate-500">
            {AUDIT_EVENTS.length} events · retained 7 years for supplier recovery
          </p>
        </div>

        {verified && (
          <span className="flex items-center gap-2 text-[13px] font-medium text-emerald-600">
            <Icon name="circleCheck" className="h-4 w-4" />
            chain intact
          </span>
        )}

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" icon="download" onClick={exportBundle}>
            Export
          </Button>
          <Button
            size="sm"
            variant={verified ? 'ghost' : 'primary'}
            icon="shield"
            onClick={verify}
            disabled={verifying || verified}
          >
            {verifying ? 'Verifying…' : verified ? 'Verified' : 'Verify chain'}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {verifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-full"
          >
            <div className="h-[3px] overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full w-1/3 bg-indigo-500"
                animate={{ x: ['-100%', '320%'] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card flush className="overflow-hidden">
          <PanelHead title="Record" description="Append only — nothing here is editable" />
          <ol className="relative px-6 pb-6">
            <span
              className="absolute bottom-9 left-[3px] top-2 w-px bg-slate-100"
              aria-hidden="true"
            />
            {AUDIT_EVENTS.map((event, i) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="relative flex gap-5 pb-6 pl-6 last:pb-0"
              >
                <span
                  className={cx(
                    'absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full',
                    DOT[event.kind],
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="strong">{event.action}</span>
                    <span className="text-[11px] text-slate-400">{LABEL[event.kind]}</span>
                    <span className="num ml-auto text-[11px] text-slate-300">{event.hash}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                    {event.detail}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 text-[11px] text-slate-400">
                    <span>{event.actor}</span>
                    <span className="num">{event.at}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </Card>

        <div className="space-y-5">
          <Card>
            <span className="micro">Why this holds up</span>
            <ul className="mt-4 space-y-4">
              <Reason
                title="Capture-side metadata"
                detail="GPS, asset and timestamp signed on device. No back-dating."
              />
              <Reason
                title="Every AI step logged"
                detail="Transcript, OCR reads and mapping recorded with their confidence."
              />
              <Reason
                title="Human sign-off"
                detail="Overriding a low-confidence field attaches identity and time."
              />
              <Reason
                title="Hash chain"
                detail="Each event commits the previous hash, so edits break verification."
              />
            </ul>
          </Card>

          <Card>
            <span className="micro">Submission</span>
            <dl className="mt-4 space-y-3">
              <Row label="Reference" value={ACTIVE_CLAIM.id} mono />
              <Row label="Contract" value={`${oem.name} · ${oem.slaDays}d`} />
              <Row label="Portal" value={oem.portal} mono />
              <Row label="Artefacts" value="5" />
            </dl>
            <Button variant="secondary" size="sm" full className="mt-6" onClick={onBack}>
              Back to dashboard
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Reason({ title, detail }: { title: string; detail: string }) {
  return (
    <li>
      <div className="text-[13px] font-medium text-slate-800">{title}</div>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{detail}</p>
    </li>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className={cx('truncate text-right text-[13px] text-slate-700', mono && 'num')}>
        {value}
      </dd>
    </div>
  )
}
