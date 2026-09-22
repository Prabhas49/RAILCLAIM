import { useEffect, useState } from 'react'
import { Icon } from './ui/Icon'
import { canApprove, type AuthUser } from '../lib/auth'
import { getSubmittedClaims } from '../lib/claimStore'
import { getPendingInbox, markClaimSeen } from '../lib/inbox'
import type { ViewId } from '../types'

const VIEW_TITLES: Record<ViewId, string> = {
  landing: 'LANDING',
  login: 'SIGN IN',
  dashboard: 'DASHBOARD',
  claims: 'CLAIMS',
  create: 'NEW CLAIM',
  approval: 'APPROVAL',
  evidence: 'EVIDENCE VAULT',
  audit: 'CRYPTOGRAPHIC AUDIT',
  analytics: 'ANALYTICS',
}

export function Topbar({
  currentView = 'dashboard',
  onNavigate,
  onOpenVoiceTranslator,
  user,
  onLogout,
}: {
  currentView?: ViewId
  running?: boolean
  onNavigate?: (v: ViewId) => void
  onOpenVoiceTranslator?: () => void
  user?: AuthUser | null
  onLogout?: () => void
}) {
  const currentTitle = VIEW_TITLES[currentView] ?? 'DASHBOARD'
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifTick, setNotifTick] = useState(0)

  // Live depot → engineer alerts, persistent across logins (same browser).
  useEffect(() => {
    const refresh = () => setNotifTick((t) => t + 1)
    window.addEventListener('focus', refresh)
    window.addEventListener('hs-inbox-sync', refresh)
    window.addEventListener('hs-claim-sync', refresh)
    window.addEventListener('hs-audit-sync', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('hs-inbox-sync', refresh)
      window.removeEventListener('hs-claim-sync', refresh)
      window.removeEventListener('hs-audit-sync', refresh)
    }
  }, [])

  const engineer = canApprove(user)
  const pending = engineer && notifTick >= 0 ? getPendingInbox() : null
  const recentFiled = notifTick >= 0 ? getSubmittedClaims().slice(0, 2) : []
  const liveCount = (pending?.unseen ? 1 : 0) + recentFiled.length

  return (
    <header className="h-16 px-6 md:px-8 border-b border-[#1e1e1e] bg-black items-center justify-between select-none relative z-30 hidden md:flex">
      {/* ── Breadcrumbs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#71717a]">
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="hover:text-white transition-colors"
        >
          HASHI SETU
        </button>
        <span>&gt;</span>
        <span className="text-white font-bold">{currentTitle}</span>
      </div>

      {/* ── Right Navigation & User Controls (desktop only) ────────────────────────── */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Voice bridge */}
        <button
          type="button"
          onClick={() => (onOpenVoiceTranslator ? onOpenVoiceTranslator() : onNavigate?.('create'))}
          className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#111] px-3 py-1.5 text-xs font-medium text-[#a1a1aa] hover:text-white hover:border-[#444] transition-colors cursor-pointer"
        >
          <Icon name="mic" className="h-3.5 w-3.5" />
          <span>Voice bridge</span>
        </button>

        {onNavigate && (
          <button
            onClick={() => onNavigate('landing')}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#2a2a2a] bg-[#111] px-3 py-1 text-[11px] font-medium text-[#a1a1aa] hover:text-white hover:border-[#444] transition-colors cursor-pointer"
          >
            <span>Public site</span>
            <Icon name="arrowRight" className="h-3 w-3" />
          </button>
        )}

        {/* Search */}
        <button
          type="button"
          onClick={() => onNavigate?.('claims')}
          className="text-[#a1a1aa] hover:text-white transition-colors p-1.5 cursor-pointer"
          title="Go to claims"
        >
          <Icon name="search" className="h-4 w-4" />
        </button>

        {/* Bell with notification drawer */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-[#a1a1aa] hover:text-white transition-colors p-1.5 cursor-pointer"
            title="Depot notifications"
          >
            <Icon name="bell" className="h-4 w-4" />
            {liveCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-xl border border-[#222] bg-[#0c0c0c] p-4 shadow-2xl text-xs z-50">
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2">
                <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                  Notifications
                </span>
                <span className="text-[10px] text-[#FFFFFF] font-mono">
                  {liveCount > 0 ? `${liveCount} New` : 'All caught up'}
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                {pending?.unseen && (
                  <button
                    type="button"
                    onClick={() => {
                      markClaimSeen(pending.draft.id)
                      setShowNotifications(false)
                      onNavigate?.('approval')
                    }}
                    className="w-full rounded-lg border border-white/50 bg-white/[0.06] p-2.5 text-left shadow-[0_0_16px_rgba(255,255,255,0.15)] cursor-pointer"
                  >
                    <p className="font-bold text-white text-[11px]">
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      New claim needs review · {pending.draft.id}
                    </p>
                    <p className="text-[10px] text-[#888] mt-0.5">
                      {pending.draft.equipmentType} — {pending.draft.faultSummary}
                    </p>
                  </button>
                )}
                {recentFiled.map((s) => (
                  <div key={s.id} className="rounded-lg bg-[#141414] p-2.5 border border-[#1f1f1f]">
                    <p className="font-bold text-white text-[11px]">Dispatched to {s.oem}</p>
                    <p className="text-[10px] text-[#888] mt-0.5">Claim {s.id} · ₹{s.amountInr.toLocaleString('en-IN')}</p>
                    <span className="text-[9px] text-[#555] font-mono">{s.date}</span>
                  </div>
                ))}
                {liveCount === 0 && (
                  <p className="py-4 text-center text-[11px] text-[#71717a]">
                    Nothing new. Filed claims will ping you here.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center font-bold text-[10px] text-black group-hover:scale-105 transition-transform">
              {user?.initials ?? 'PR'}
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-neutral-300 group-hover:text-white">
              {user?.name ?? 'Pragna Rao'}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-72 rounded-xl border border-[#222] bg-[#0c0c0c] p-4 shadow-2xl text-xs z-50">
              <div className="flex items-center gap-3 border-b border-[#1f1f1f] pb-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center font-bold text-sm text-black">
                  {user?.initials ?? 'PR'}
                </div>
                <div>
                  <p className="font-bold text-white">{user?.name ?? 'Pragna Rao'}</p>
                  <p className="text-[10px] text-neutral-400 font-medium">{user?.role ?? 'Chief Rolling Stock Engineer'}</p>
                  <p className="text-[10px] text-[#71717a]">{user?.depot ?? 'Kochi Metro Rail Ltd · Muttom'}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-[#a1a1aa]">
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span>Signed in as</span>
                  <span className="text-white font-mono text-[11px]">{user?.username ?? '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Active Shift</span>
                  <span className="text-emerald-400 font-medium">Duty Lead · Shift A</span>
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-3 w-full rounded-lg border border-[#2a2a2a] bg-black py-2 text-xs font-bold text-white hover:border-white/50 transition-colors"
                >
                  Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
