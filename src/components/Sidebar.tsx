import { useState } from 'react'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './ui/Icon'
import type { ViewId } from '../types'

interface NavItem { id: ViewId; label: string; icon: IconName }

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: 'home' },
  { id: 'capture', label: 'New Claim', icon: 'sparkles' },
  { id: 'pipeline', label: 'Activity', icon: 'activity' },
  { id: 'review', label: 'Exports', icon: 'export' },
  { id: 'audit', label: 'History', icon: 'history' },
]

// map for oem view fallback etc
const FALLBACK_LABEL: Record<string,string> = { oem: 'Exports' }

export function Sidebar({ current, onNavigate, running }: { current: ViewId; onNavigate: (v: ViewId)=>void; running?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {/* mobile toggle */}
      <button type="button" onClick={()=>setOpen(!open)} className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft border border-line lg:hidden">
        <Icon name={open ? 'x' : 'grid'} className="h-4 w-4 text-ink" />
      </button>
      {open && <div onClick={()=>setOpen(false)} className="fixed inset-0 z-20 bg-ink/10 backdrop-blur-sm lg:hidden" />}
      <aside className={cx('fixed left-4 top-4 z-30 flex h-[calc(100vh-32px)] w-[280px] flex-col rounded-card border border-white/60 bg-white/80 shadow-float backdrop-blur-xl transition-transform lg:sticky lg:top-4 lg:m-4 lg:shrink-0', open ? 'translate-x-0' : '-translate-x-[calc(100%+16px)] lg:translate-x-0')}>
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink shadow-soft">
            <Icon name="layers" className="h-5 w-5 text-white" />
          </span>
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-ink">RailClaim</span>
          <span className="ml-auto hidden rounded-full bg-subtle px-2 py-1 text-[10px] font-medium text-muted lg:inline">Warm</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-widest text-tertiary">Menu</p>
          {NAV.map(item => {
            const active = current===item.id || (current==='oem' && item.id==='review')
            return (
              <button key={item.id} type="button" onClick={()=>{ onNavigate(item.id); setOpen(false)}} aria-current={active?'page':undefined}
                className={cx('flex w-full items-center gap-3 rounded-full px-2 py-2 text-[14px] transition-all',
                  active ? 'bg-ink text-white shadow-soft' : 'text-muted hover:bg-subtle hover:text-ink')}>
                <span className={cx('flex h-8 w-8 items-center justify-center rounded-full', active ? 'bg-white/15' : 'bg-subtle')}>
                  <Icon name={item.icon} className={cx('h-4 w-4', active ? 'text-white' : 'text-muted')} />
                </span>
                <span className="flex-1 text-left font-medium">{FALLBACK_LABEL[item.id] ?? item.label}</span>
                {item.id==='pipeline' && running && <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />}
              </button>
            )
          })}
        </nav>

        <div className="p-4">
          <div className="flex items-center gap-3 rounded-card bg-canvas border border-line p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-400 text-sm font-semibold text-white">SI</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-ink">S. Iyer</p>
              <p className="text-[11px] text-muted">RailCorp HQ · 12 day streak 🔥</p>
            </div>
          </div>
          <p className="mt-3 px-1 text-[11px] leading-relaxed text-tertiary">Simulated pipeline. No live OEM connection.</p>
        </div>
      </aside>
    </>
  )
}
