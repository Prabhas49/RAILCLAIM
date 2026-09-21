import { cx } from '../../lib/cx'
import { confidenceTone } from '../../lib/status'

const TONE_BAR: Record<string, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

const TONE_TEXT: Record<string, string> = {
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
}

export function ConfidenceBar({
  value,
  compact,
  className,
}: {
  value: number
  compact?: boolean
  className?: string
}) {
  const tone = confidenceTone(value)
  return (
    <div className={cx('flex items-center gap-2.5', className)}>
      <div
        className={cx('relative flex-1 overflow-hidden rounded-full bg-slate-100', compact ? 'h-[3px]' : 'h-1')}
        role="meter"
        aria-valuenow={Math.round(value * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Extraction confidence"
      >
        <div
          className={cx('h-full rounded-full transition-[width] duration-700 ease-out', TONE_BAR[tone])}
          style={{ width: `${Math.max(3, value * 100)}%` }}
        />
      </div>
      <span className={cx('num shrink-0 text-[11px] font-medium', TONE_TEXT[tone])}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  )
}

export function ConfidencePill({ value }: { value: number }) {
  const tone = confidenceTone(value)
  return (
    <span className={cx('num text-[11px] font-medium', TONE_TEXT[tone])}>
      {(value * 100).toFixed(0)}%
    </span>
  )
}

export function ConfidenceRing({
  value,
  size = 56,
  stroke = 4,
  label,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
}) {
  const tone = confidenceTone(value)
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const dash = circumference * Math.min(1, Math.max(0, value))
  const strokeColor = tone === 'emerald' ? '#10b981' : tone === 'amber' ? '#f59e0b' : '#f43f5e'

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f6" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className="transition-[stroke-dasharray] duration-1000 ease-out"
          />
        </svg>
        <span className="num absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-slate-900">
          {Math.round(value * 100)}%
        </span>
      </div>
      {label && (
        <div className="leading-tight">
          <div className="strong">{label}</div>
          <div className={cx('mt-1 text-[11px] font-medium', TONE_TEXT[tone])}>
            {tone === 'emerald' ? 'Safe to auto-file' : tone === 'amber' ? 'Needs a check' : 'Needs review'}
          </div>
        </div>
      )}
    </div>
  )
}
