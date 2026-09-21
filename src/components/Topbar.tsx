import { Icon } from './ui/Icon'

export function Topbar({ running }: { running?: boolean }) {
  return (
    <div className="sticky top-4 z-20 mx-4 lg:mx-6 flex justify-center">
      <header className="flex h-12 w-full max-w-3xl items-center gap-3 rounded-full border border-white/60 bg-white/80 px-2 shadow-soft backdrop-blur-xl">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-canvas border border-line px-4 py-2">
          <Icon name="search" className="h-4 w-4 text-tertiary" />
          <input placeholder="Ask or search anything… ⌘K" className="w-full bg-transparent text-[13px] text-ink placeholder:text-tertiary outline-none" />
        </div>
        <div className="flex items-center gap-2 pr-1">
          {running && <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] px-3 py-1.5 text-[11px] font-medium text-[#9A3412]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" /> analysing</span>}
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-subtle border border-line px-2.5 py-1 text-[11px] font-medium text-muted">🔥 12</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-400 text-[11px] font-medium text-white">SI</span>
        </div>
      </header>
    </div>
  )
}
