import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export function Card({ className, children, flush }: { className?:string; children:ReactNode; flush?:boolean }){
  return <div className={cx('rounded-[8px] border border-[#1e1e1e] bg-[#0a0a0a] text-white',!flush&&'p-6',className)}>{children}</div>
}
export function PanelHead({ title, description, action, className }: { title:string; description?:string; action?:ReactNode; className?:string }){
  return (
    <div className={cx('flex items-start justify-between gap-4',className)}>
      <div className="min-w-0">
        <h3 className="text-[14px] font-semibold text-white">{title}</h3>
        {description && <p className="mt-1 text-[13px] text-neutral-400">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
