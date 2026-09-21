import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { STATUS_META, SOURCE_META, ACCENT_META } from '../../lib/status'
import { OEM_BY_ID } from '../../data/mock'
import type { ClaimStatus, FieldSource, OemId } from '../../types'

export type Tone = 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'blue'

const TONES: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-600',
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  sky: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
  blue: 'bg-blue-50 text-blue-700',
}

/** Used sparingly — prefer plain text unless the value is genuinely categorical. */
export function Badge({ children, tone = 'slate', className }: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusPill({ status, className }: { status: ClaimStatus; className?: string }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 text-[13px] font-medium',
        meta.text,
        className,
      )}
    >
      <span className={cx('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}

/** Provenance as quiet text, not a coloured chip. */
export function SourceChip({ source, className }: { source: FieldSource; className?: string }) {
  return (
    <span className={cx('text-[11px] text-slate-400', className)}>
      {SOURCE_META[source].label}
    </span>
  )
}

/** A dot carries the OEM colour; the label stays neutral so rows don't shout. */
export function OemChip({ oem, className }: { oem: OemId; className?: string }) {
  const meta = OEM_BY_ID[oem]
  const accent = ACCENT_META[meta.accent]
  return (
    <span className={cx('inline-flex items-center gap-2 text-[13px] text-slate-600', className)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', accent.bar)} />
      {meta.name}
    </span>
  )
}
