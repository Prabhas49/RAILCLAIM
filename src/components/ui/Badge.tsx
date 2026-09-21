import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import type { ClaimStatus, FieldSource } from '../../types'
import { STATUS_BADGE } from '../../lib/status'

const BADGE_TOKENS: Record<string,string> = {
  'IN_REVIEW': 'bg-[#292010] text-[#FFB703] border border-[#FFB703]/30',
  'SUBMITTED': 'bg-[#141414] text-white border border-[#27272a]',
  'RFI': 'bg-[#292010] text-[#FFB703] border border-[#FFB703]/30',
  'APPROVED': 'bg-[#0a2618] text-[#10B981] border border-[#10B981]/30',
  'REJECTED': 'bg-[#2b1218] text-[#FF4D6D] border border-[#FF4D6D]/30',
  'PAID': 'bg-[#0a2618] text-[#10B981] border border-[#10B981]/30',
}

// soft pastel for generic badge
export function Badge({ children, variant, className }: { children: ReactNode; variant?: string; className?: string }){
  const token = variant ? (BADGE_TOKENS[variant] ?? 'bg-[#141414] text-white border border-[#262626]') : 'bg-[#141414] text-white border border-[#262626]'
  return <span className={cx('inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium capitalize tracking-[-0.01em] leading-none',token,className)}>{children}</span>
}

export function StatusBadge({ status, className }: { status: ClaimStatus; className?: string }){
  const cfg = STATUS_BADGE[status]
  return <span className={cx('inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium capitalize tracking-[-0.01em] leading-none border',cfg.className,className)}>{cfg.label.toLowerCase()}</span>
}

export function StatusPill(props: { status: ClaimStatus; className?: string }){ return StatusBadge(props) }
export function SourceChip({ source, className }: { source: FieldSource; className?: string }){
  return <span className={cx('inline-flex items-center rounded-full border border-[#262626] bg-[#141414] px-2.5 py-1 text-[11px] font-medium capitalize text-neutral-300',className)}>{source}</span>
}
export function OemChip({ oem, className }: { oem: string; className?: string }){
  return <span className={cx('inline-flex items-center text-[13px] text-white font-medium',className)}>{oem}</span>
}
