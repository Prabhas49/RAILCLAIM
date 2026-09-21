import type { ViewId } from '../types'

const TITLES: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  capture: 'New claim',
  pipeline: 'AI pipeline',
  review: 'Review',
  oem: 'Submit',
  audit: 'Audit trail',
}

interface TopbarProps {
  view: ViewId
  running?: boolean
}

export function Topbar({ view, running }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-4 px-6 py-4">
        <h1 className="title truncate">{TITLES[view]}</h1>

        {running && (
          <span className="flex items-center gap-2 text-[11px] font-medium text-sky-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
            analysing
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="num hidden text-[11px] text-slate-400 sm:block">S. Iyer</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-medium text-white">
            SI
          </span>
        </div>
      </div>
    </header>
  )
}
