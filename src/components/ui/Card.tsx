import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface CardProps {
  className?: string
  children: ReactNode
  /** Skip default padding when the card lays out its own content. */
  flush?: boolean
}

export function Card({ className, children, flush }: CardProps) {
  return <div className={cx('panel', !flush && 'p-6', className)}>{children}</div>
}

interface PanelHeadProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/** One header shape for every panel. No icons, no eyebrow labels. */
export function PanelHead({ title, description, action, className }: PanelHeadProps) {
  return (
    <div className={cx('panel-head', className)}>
      <div className="min-w-0">
        <h3 className="title truncate">{title}</h3>
        {description && <p className="mt-1 text-[13px] leading-snug text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
