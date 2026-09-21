import { cx } from '../../lib/cx'

export function ConfidenceBar({ value, className }: { value: number; className?: string }){
  const pct = Math.round(Math.max(0,Math.min(1,value))*100)
  const low = value < 0.9
  return (
    <div className={cx('flex items-center gap-2',className)}>
      <div className="h-[3px] w-[120px] shrink-0 overflow-hidden rounded-full bg-[#E4E4E7]" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Confidence">
        <div className={cx('h-full rounded-full transition-[width] duration-500', low ? 'bg-[#D97706]' : 'bg-[#09090B]')} style={{width:`${Math.max(3,pct)}%`}} />
      </div>
      <span className="text-[11px] font-medium tabular-nums text-[#09090B]">{pct}%</span>
    </div>
  )
}

export function ConfidenceRing({ value, size=56, stroke=4, label }: { value:number; size?:number; stroke?:number; label?:string }){
  const r=(size-stroke)/2, C=2*Math.PI*r, pct=Math.max(0,Math.min(1,value)), dash=C*pct
  const low = value < 0.9
  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{width:size,height:size}}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E4E4E7" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={low ? '#D97706' : '#09090B'} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${C}`} className="transition-[stroke-dasharray] duration-700" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums text-[#09090B]">{Math.round(pct*100)}%</span>
      </div>
      {label && <div className="text-[13px] font-medium text-[#09090B]">{label}</div>}
    </div>
  )
}

export function SourceChip2({ source, className }: { source: string; className?: string }){
  return <span className={cx('inline-flex items-center rounded-full border border-[#E4E4E7] bg-[#FAFAFA] px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-[#09090B]',className)}>{source}</span>
}
