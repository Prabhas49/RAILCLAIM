import { cx } from '../lib/cx'
import { Icon, type IconName } from './ui/Icon'
import type { ViewId } from '../types'

interface NavItem {
  id: ViewId
  label: string
  icon: IconName
}

/** Ordered the way a claim flows, so the list doubles as the product story. */
const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'capture', label: 'New claim', icon: 'mic' },
  { id: 'pipeline', label: 'AI pipeline', icon: 'sparkle' },
  { id: 'review', label: 'Review', icon: 'clipboard' },
  { id: 'oem', label: 'Submit', icon: 'building' },
  { id: 'audit', label: 'Audit trail', icon: 'shield' },
]

interface SidebarProps {
  current: ViewId
  onNavigate: (view: ViewId) => void
  running?: boolean
}

export function Sidebar({ current, onNavigate, running }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[224px] shrink-0 flex-col border-r border-slate-200/70 bg-white lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <Icon name="layers" className="h-4 w-4 text-white" strokeWidth={2} />
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          RailClaim
        </span>
      </div>

      <nav className="flex-1 px-3">
        {NAV.map((item) => {
          const active = current === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                active
                  ? 'bg-slate-100 font-medium text-slate-900'
                  : 'font-normal text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon
                name={item.icon}
                className={cx(
                  'h-4 w-4 shrink-0',
                  active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500',
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.id === 'pipeline' && running && (
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="px-5 py-5">
        <p className="text-[11px] leading-relaxed text-slate-400">
          Simulated pipeline. No live OEM connection.
        </p>
      </div>
    </aside>
  )
}
