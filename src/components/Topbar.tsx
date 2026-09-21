import { Icon } from './ui/Icon'
import type { ViewId } from '../types'

const VIEW_TITLES: Record<ViewId, string> = {
  landing: 'LANDING',
  dashboard: 'DASHBOARD',
  claims: 'CLAIMS',
  capture: 'NEW CLAIM',
  evidence: 'EVIDENCE VAULT',
  pipeline: 'SIGNALS',
  review: 'CLAIMS',
  oem: 'OEM DISPATCH',
  audit: 'ANALYTICS & AUDIT',
  analytics: 'ANALYTICS',
}

export function Topbar({ currentView = 'dashboard' }: { currentView?: ViewId; running?: boolean }) {
  const currentTitle = VIEW_TITLES[currentView] ?? 'DASHBOARD'

  return (
    <header className="h-16 px-8 border-b border-[#152338] bg-[#090E17] flex items-center justify-between select-none">
      {/* ── Breadcrumbs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#526E94]">
        <span>RAILCLAIM AI</span>
        <span>&gt;</span>
        <span className="text-white">{currentTitle}</span>
      </div>

      {/* ── Right Icons ────────────────────────────────────────────── */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <button
          type="button"
          className="text-[#7086A3] hover:text-white transition-colors"
          title="Search"
        >
          <Icon name="search" className="h-4 w-4" />
        </button>

        {/* Bell with notification dot */}
        <button
          type="button"
          className="relative text-[#7086A3] hover:text-white transition-colors"
          title="Notifications"
        >
          <Icon name="bell" className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#00C2FF]" />
        </button>

        {/* User avatar AM */}
        <div className="h-7 w-7 rounded-full bg-[#13385C] border border-[#00C2FF]/30 flex items-center justify-center font-bold text-[10px] text-[#00C2FF]">
          AM
        </div>
      </div>
    </header>
  )
}
