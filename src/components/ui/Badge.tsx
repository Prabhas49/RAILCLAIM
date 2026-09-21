import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import type { ClaimStatus, FieldSource } from '../../types'
import { STATUS_BADGE } from '../../lib/status'

const BADGE_TOKENS: Record<string,string> = {
  'IN_REVIEW': 'bg-[#FFF7ED] text-[#9A3412] border border-[#FFEDD5]',
  'SUBMITTED': 'bg-ink text-white border border-ink',
  'RFI': 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
  'APPROVED': 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]',
  'REJECTED': 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]',
  'PAID': 'bg-[#065F46] text-white border border-[#065F46]',
}

// soft pastel for generic badge
export function Badge({ children, variant, className }: { children: ReactNode; variant?: string; className?: string }){
  const token = variant ? (BADGE_TOKENS[variant] ?? 'bg-subtle text-ink border border-line') : 'bg-subtle text-ink border border-line'
  return <span className={cx('inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium capitalize tracking-[-0.01em] leading-none',token,className)}>{children}</span>
}

export function StatusBadge({ status, className }: { status: ClaimStatus; className?: string }){
  const cfg = STATUS_BADGE[status]
  return <span className={cx('inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium capitalize tracking-[-0.01em] leading-none border',cfg.className,className)}>{cfg.label.toLowerCase()}</span>
}

export function StatusPill(props: { status: ClaimStatus; className?: string }){ return StatusBadge(props) }
export function SourceChip({ source, className }: { source: FieldSource; className?: string }){
  return <span className={cx('inline-flex items-center rounded-full border border-line bg-subtle px-2.5 py-1 text-[11px] font-medium capitalize text-muted',className)}>{source}</span>
}
export function OemChip({ oem, className }: { oem: string; className?: string }){
  return <span className={cx('inline-flex items-center text-[13px] text-ink',className)}>{oem}</span>
}
