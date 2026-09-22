import { cx } from '../lib/cx'
import { Icon, type IconName } from './ui/Icon'
import type { AuthUser } from '../lib/auth'
import type { ViewId } from '../types'

interface NavItem {
  id: string
  viewId?: ViewId
  label: string
  icon: IconName
  badge?: string | number
}

const WORKSPACE_NAV: NavItem[] = [
  { id: 'dashboard', viewId: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'claims', viewId: 'claims', label: 'Claims', icon: 'file' },
  { id: 'create', viewId: 'capture', label: 'Create claim', icon: 'plus' },
  { id: 'evidence', viewId: 'evidence', label: 'Evidence', icon: 'cloud' },
  { id: 'analytics', viewId: 'analytics', label: 'Analytics', icon: 'analytics' },
]

const SYSTEM_NAV: NavItem[] = [
  { id: 'audit', viewId: 'audit', label: 'Audit Trail', icon: 'shield' },
]

export function Sidebar({
  current,
  onNavigate,
  onOpenVoiceTranslator,
  user,
  onLogout,
}: {
  current: ViewId
  onNavigate: (v: ViewId) => void
  running?: boolean
  onOpenVoiceTranslator?: () => void
  user?: AuthUser | null
  onLogout?: () => void
}) {
  return (
    <aside className="w-[230px] shrink-0 min-h-screen bg-black border-r border-[#1e1e1e] flex flex-col p-4 select-none">
      {/* ── Brand Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-2 py-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div className="h-8 w-8 rounded-[6px] bg-white flex items-center justify-center font-black text-black text-xs tracking-tight shadow-sm">
          HS
        </div>
        <span className="font-extrabold tracking-tight text-white text-sm">
          HASHI SETU
        </span>
      </div>

      {/* ── WORKSPACE Section ───────────────────────────────────────── */}
      <div className="mt-6">
        <p className="px-3 text-[10px] font-bold tracking-widest text-[#71717a] uppercase">
          WORKSPACE
        </p>

        <nav className="mt-2 space-y-1">
          {WORKSPACE_NAV.map((item) => {
            const isActive =
              (item.id === 'dashboard' && current === 'dashboard') ||
              (item.id === 'create' && current === 'capture') ||
              (item.id === 'evidence' && current === 'evidence') ||
              (item.id === 'claims' && (current === 'claims' || current === 'review' || current === 'oem')) ||
              (item.id === 'analytics' && (current === 'analytics' || current === 'audit'))

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.viewId) onNavigate(item.viewId)
                }}
                className={cx(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-[#141414] text-white border border-[#2a2a2a] shadow-sm'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#111111]'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name={item.icon}
                    className={cx('h-4 w-4', isActive ? 'text-[#FFFFFF]' : 'text-[#71717a]')}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="h-5 min-w-[20px] px-1 rounded-full bg-[#241a08] text-[#FFFFFF] text-[10px] font-bold flex items-center justify-center border border-[#FFFFFF]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── SYSTEM Section ─────────────────────────────────────────── */}
      <div className="mt-8">
        <p className="px-3 text-[10px] font-bold tracking-widest text-[#71717a] uppercase">
          SYSTEM
        </p>

        <nav className="mt-2 space-y-1">
          {SYSTEM_NAV.map((item) => {
            const isActive = item.viewId && current === item.viewId
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.viewId) onNavigate(item.viewId)
                }}
                className={cx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-[#141414] text-white border border-[#2a2a2a] shadow-sm'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#111111]'
                )}
              >
                <Icon
                  name={item.icon}
                  className={cx('h-4 w-4', isActive ? 'text-[#FFFFFF]' : 'text-[#71717a]')}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom spacer */}
      <div className="flex-1" />

      {user && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-[#222] bg-[#0c0c0c] px-3 py-2 text-xs">
          <span className="text-neutral-400 truncate">{user.username}</span>
          <button type="button" onClick={onLogout} className="font-bold text-white hover:underline shrink-0 ml-2">
            Sign out
          </button>
        </div>
      )}

      {/* ── Voice Bridge ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onOpenVoiceTranslator}
        className="mt-4 flex items-center gap-3 rounded-lg border border-[#262626] bg-[#0c0c0c] px-3 py-2.5 text-xs font-semibold text-[#a1a1aa] hover:text-white hover:border-[#3a3a3a] transition-colors cursor-pointer"
      >
        <Icon name="mic" className="h-4 w-4" />
        <span>Voice bridge</span>
        <span className="ml-auto font-mono text-[9px] text-[#71717a]">TA/EN→JA</span>
      </button>
    </aside>
  )
}
