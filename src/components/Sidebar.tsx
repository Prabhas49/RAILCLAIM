import { cx } from '../lib/cx'
import { Icon, type IconName } from './ui/Icon'
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
  { id: 'claims', viewId: 'claims', label: 'Claims', icon: 'file', badge: 6 },
  { id: 'create', viewId: 'capture', label: 'Create claim', icon: 'plus' },
  { id: 'evidence', viewId: 'evidence', label: 'Evidence', icon: 'cloud' },
  { id: 'analytics', viewId: 'analytics', label: 'Analytics', icon: 'analytics' },
]

const SYSTEM_NAV: NavItem[] = [
  { id: 'audit', viewId: 'audit', label: 'Audit Trail', icon: 'shield' },
  { id: 'landing', viewId: 'landing', label: 'Public Landing', icon: 'bolt' },
]

export function Sidebar({
  current,
  onNavigate,
  onOpenVoiceTranslator,
}: {
  current: ViewId
  onNavigate: (v: ViewId) => void
  running?: boolean
  onOpenVoiceTranslator?: () => void
}) {
  return (
    <aside className="w-[230px] shrink-0 min-h-screen bg-black border-r border-[#1e1e1e] flex flex-col p-4 select-none">
      {/* ── Brand Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-2 py-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div className="h-8 w-8 rounded-[6px] bg-[#00C2FF] flex items-center justify-center font-black text-black text-xs tracking-tight shadow-sm">
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
                    className={cx('h-4 w-4', isActive ? 'text-[#00C2FF]' : 'text-[#71717a]')}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="h-5 min-w-[20px] px-1 rounded-full bg-[#0a1b28] text-[#00C2FF] text-[10px] font-bold flex items-center justify-center border border-[#00C2FF]/30">
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
                  className={cx('h-4 w-4', isActive ? 'text-[#00C2FF]' : 'text-[#71717a]')}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom spacer */}
      <div className="flex-1" />

      {/* ── Voice Bridge Card ─────────────────────────────────────── */}
      <div className="mt-4 p-3 rounded-xl bg-gradient-to-b from-[#111620] to-[#0d1017] border border-[#00c2ff]/30 shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-white">
              VOICE BRIDGE
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#00c2ff]">Telugu/EN &rarr; JA</span>
        </div>
        <p className="text-[10px] text-[#718295] leading-snug mb-2.5">
          Speak in Telugu or English &bull; Instant Japanese voice readout
        </p>
        <button
          type="button"
          onClick={onOpenVoiceTranslator}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#00c2ff] text-black font-bold text-xs hover:bg-[#33d0ff] transition-all shadow-[0_0_15px_rgba(0,194,255,0.3)]"
        >
          <Icon name="mic" className="h-3.5 w-3.5" />
          <span>Launch Voice Bridge</span>
        </button>
      </div>
    </aside>
  )
}
