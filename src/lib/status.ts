import type { Accent, ClaimStatus, FieldSource } from '../types'

/** Status reads as coloured text plus a dot — never a filled chip. */
export const STATUS_META: Record<ClaimStatus, { label: string; dot: string; text: string }> = {
  draft: { label: 'Draft', dot: 'bg-slate-400', text: 'text-slate-500' },
  processing: { label: 'Processing', dot: 'bg-sky-500', text: 'text-sky-600' },
  needs_info: { label: 'Needs info', dot: 'bg-amber-500', text: 'text-amber-600' },
  ready: { label: 'Ready', dot: 'bg-indigo-500', text: 'text-indigo-600' },
  submitted: { label: 'Submitted', dot: 'bg-blue-500', text: 'text-blue-600' },
  reimbursed: { label: 'Reimbursed', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  rejected: { label: 'Rejected', dot: 'bg-rose-500', text: 'text-rose-600' },
}

export const ACCENT_META: Record<Accent, { text: string; bar: string }> = {
  indigo: { text: 'text-indigo-600', bar: 'bg-indigo-500' },
  rose: { text: 'text-rose-600', bar: 'bg-rose-500' },
  amber: { text: 'text-amber-600', bar: 'bg-amber-500' },
  emerald: { text: 'text-emerald-600', bar: 'bg-emerald-500' },
  sky: { text: 'text-sky-600', bar: 'bg-sky-500' },
}

export const SOURCE_META: Record<FieldSource, { label: string }> = {
  voice: { label: 'voice' },
  photo: { label: 'photo' },
  metadata: { label: 'metadata' },
  inferred: { label: 'inferred' },
}

/** Below this a field is not trusted to auto-submit. */
export const CONFIDENCE_FLOOR = 0.75

export function confidenceTone(value: number) {
  if (value >= 0.85) return 'emerald'
  if (value >= CONFIDENCE_FLOOR) return 'amber'
  return 'rose'
}
