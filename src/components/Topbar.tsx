import { useState } from 'react'
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
  audit: 'CRYPTOGRAPHIC AUDIT',
  analytics: 'ANALYTICS',
}

export function Topbar({
  currentView = 'dashboard',
  onNavigate,
  onOpenVoiceTranslator,
}: {
  currentView?: ViewId
  running?: boolean
  onNavigate?: (v: ViewId) => void
  onOpenVoiceTranslator?: () => void
}) {
  const currentTitle = VIEW_TITLES[currentView] ?? 'DASHBOARD'
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="h-16 px-6 md:px-8 border-b border-[#1e1e1e] bg-black flex items-center justify-between select-none relative z-30">
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

      {/* ── Right Navigation & User Controls ────────────────────────── */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Voice to Japanese Live Speech Button */}
        <button
          type="button"
          onClick={onOpenVoiceTranslator}
          className="inline-flex items-center gap-2 rounded-full border border-[#00C2FF]/40 bg-[#00C2FF]/10 px-3 py-1 md:px-3.5 md:py-1.5 text-xs font-semibold text-[#00C2FF] hover:bg-[#00C2FF]/20 hover:border-[#00C2FF] transition-all shadow-[0_0_15px_rgba(0,194,255,0.15)] group cursor-pointer"
          title="Speak in Telugu/English -> Speaks in Japanese out loud"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C2FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C2FF]"></span>
          </span>
          <Icon name="mic" className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          <span>Voice to Japanese</span>
          <span className="text-[10px] opacity-80 font-mono hidden md:inline">音声通訳</span>
        </button>

        {/* Switch to Public Landing Page button */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('landing')}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#2a2a2a] bg-[#111] px-3 py-1 text-[11px] font-medium text-[#a1a1aa] hover:text-white hover:border-[#444] transition-colors"
          >
            <span>Public Landing</span>
            <Icon name="arrowRight" className="h-3 w-3" />
          </button>
        )}

        {/* Search */}
        <button
          type="button"
          onClick={() => onNavigate?.('claims')}
          className="text-[#7086A3] hover:text-white transition-colors p-1.5"
          title="Search claims & parts"
        >
          <Icon name="search" className="h-4 w-4" />
        </button>

        {/* Bell with notification drawer */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-[#7086A3] hover:text-white transition-colors p-1.5"
            title="Recent Telemetry Notifications"
          >
            <Icon name="bell" className="h-4 w-4" />
            <span className="absolute 0 top-0.5 right-0.5 h-2 w-2 rounded-full bg-[#00C2FF] animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-xl border border-[#222] bg-[#0c0c0c] p-4 shadow-2xl text-xs z-50">
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2">
                <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                  Depot Notifications
                </span>
                <span className="text-[10px] text-[#00c2ff] font-mono">3 New</span>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="rounded-lg bg-[#141414] p-2.5 border border-[#1f1f1f]">
                  <p className="font-bold text-white text-[11px]">Mitsubishi Electric ACK</p>
                  <p className="text-[10px] text-[#888] mt-0.5">Claim HS-2026-0881 received · Melco-WS Token Valid</p>
                  <span className="text-[9px] text-[#555] font-mono">4 mins ago</span>
                </div>
                <div className="rounded-lg bg-[#141414] p-2.5 border border-[#1f1f1f]">
                  <p className="font-bold text-white text-[11px]">Brake Pressure Alert</p>
                  <p className="text-[10px] text-[#888] mt-0.5">BCU-80 main reservoir drop &lt; 6.4 bar logged</p>
                  <span className="text-[9px] text-[#555] font-mono">22 mins ago</span>
                </div>
                <div className="rounded-lg bg-[#141414] p-2.5 border border-[#1f1f1f]">
                  <p className="font-bold text-white text-[11px]">Cryptographic Seal Verified</p>
                  <p className="text-[10px] text-[#888] mt-0.5">SHA-256 ledger validated for KMRL Muttom shift</p>
                  <span className="text-[9px] text-[#555] font-mono">1 hr ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown - Pragna Rao */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-7 w-7 rounded-full bg-[#13385C] border border-[#00C2FF]/40 flex items-center justify-center font-bold text-[10px] text-[#00C2FF] group-hover:scale-105 transition-transform">
              PR
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-neutral-300 group-hover:text-white">
              Pragna Rao
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-72 rounded-xl border border-[#222] bg-[#0c0c0c] p-4 shadow-2xl text-xs z-50">
              <div className="flex items-center gap-3 border-b border-[#1f1f1f] pb-3">
                <div className="h-10 w-10 rounded-full bg-[#13385C] border border-[#00c2ff]/40 flex items-center justify-center font-bold text-sm text-[#00c2ff]">
                  PR
                </div>
                <div>
                  <p className="font-bold text-white">Pragna Rao</p>
                  <p className="text-[10px] text-[#00c2ff] font-medium">Chief Rolling Stock Engineer</p>
                  <p className="text-[10px] text-[#71717a]">Kochi Metro Rail Ltd · Muttom</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-[#a1a1aa]">
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span>Authorization</span>
                  <span className="text-white font-mono text-[11px]">KM-T04-PRAGNA</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span>Active Shift</span>
                  <span className="text-emerald-400 font-medium">Duty Lead · Shift A</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>JIS Certification</span>
                  <span className="text-white">Level 4 (Rolling Stock)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
