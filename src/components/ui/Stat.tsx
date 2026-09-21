import { cx } from '../../lib/cx'

interface StatProps {
  label: string
  value: string
  hint?: string
  delta?: { value: string; direction: 'up' | 'down' | 'flat'; good?: boolean }
  spark?: { data: number[]; color: string }
}

export function Stat({ label, value, hint, delta, spark }: StatProps) {
  return (
    <div className="panel p-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="micro">{label}</span>
        {delta && (
          <span
            className={cx(
              'num text-[11px] font-medium',
              delta.direction === 'flat'
                ? 'text-slate-400'
                : (delta.good ?? delta.direction === 'up')
                  ? 'text-emerald-600'
                  : 'text-rose-600',
            )}
          >
            {delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : '·'} {delta.value}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="display">{value}</div>
          {hint && <p className="mt-2 text-[13px] leading-snug text-slate-500">{hint}</p>}
        </div>
        {spark && spark.data.length > 1 && <Sparkline data={spark.data} color={spark.color} />}
      </div>
    </div>
  )
}

export function Sparkline({
  data,
  color,
  className,
}: {
  data: number[]
  color: string
  className?: string
}) {
  const w = 72
  const h = 26
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)

  const points = data.map((d, i) => [i * step, h - ((d - min) / range) * (h - 4) - 2] as const)
  const line = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
  const gradId = `spark-${color.replace('#', '')}`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cx('h-[26px] w-[72px] shrink-0', className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
