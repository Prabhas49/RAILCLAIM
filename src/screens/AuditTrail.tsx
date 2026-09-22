import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getAuditLog } from '../lib/auditLog'

const KIND_CONFIG: Record<string, { label: string; badge: string }> = {
  capture: { label: 'FILED', badge: 'bg-[#141414] text-white border border-[#262626]' },
  ai: { label: 'SYSTEM', badge: 'bg-[#241a08] text-[#FFFFFF] border border-[#FFFFFF]/30' },
  human: { label: 'APPROVAL', badge: 'bg-[rgba(255,255,255,0.08)] text-[#FFFFFF] border border-[#FFFFFF]/30 font-bold' },
  system: { label: 'DISPATCH', badge: 'bg-[#0C271E] text-[#06D6A0] border border-[#06D6A0]/30' },
}

export default function AuditTrail({ onBack }: { onBack: () => void }) {
  const [events, setEvents] = useState(getAuditLog)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const sync = () => setEvents(getAuditLog())
    sync()
    window.addEventListener('hs-audit-sync', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('hs-audit-sync', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const list = filter === 'all' ? events : events.filter((e) => e.kind === filter)

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <button
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#71717a] hover:text-white transition-colors"
          >
            <span>← Back to Command Center</span>
          </button>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">
            Activity ledger
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white tracking-tight">
            What happened, when, and who did it
          </h1>
          <p className="font-mono text-xs text-[#a1a1aa] mt-1">
            Every entry below is a real action taken in this workspace — claim filed, approval, dispatch.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0a0a0a] border border-[#1e1e1e] p-4 font-mono text-xs">
          <p className="font-bold text-white">{events.length} events recorded</p>
          <p className="text-[10px] text-[#71717a] mt-1 font-medium">
            Stored locally in this browser
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-[#71717a] mr-2 font-bold">Filter:</span>
        {['all', 'capture', 'human', 'system', 'ai'].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-4 py-1.5 font-mono text-xs font-semibold uppercase transition-colors border ${
              filter === k
                ? 'bg-white text-black border-[#FFFFFF]'
                : 'bg-[#141414] text-[#a1a1aa] border-[#262626] hover:border-white hover:text-white'
            }`}
          >
            {k === 'all' ? `All (${events.length})` : k}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0a0a0a] p-12 text-center">
          <p className="text-sm font-semibold">No events yet</p>
          <p className="mt-1 font-mono text-xs text-[#71717a]">File a claim and it shows up here.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#1e1e1e] ml-2 sm:ml-4 space-y-6 pl-4 sm:pl-6 py-2">
          {list.map((event, idx) => {
            const cfg = KIND_CONFIG[event.kind] ?? {
              label: event.kind.toUpperCase(),
              badge: 'bg-[#141414] text-white border border-[#262626]',
            }
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                className="relative rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-6"
              >
                <div className="absolute -left-[31px] top-7 flex h-4 w-4 items-center justify-center rounded-full bg-black border-2 border-[#FFFFFF]">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e1e1e] pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <h3 className="font-mono text-sm font-bold text-white">{event.action}</h3>
                  </div>
                  <span className="font-mono text-xs text-[#71717a] font-medium">{event.at}</span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs">
                  <p className="text-neutral-300 leading-relaxed font-sans text-sm">{event.detail}</p>
                  <div className="pt-3 border-t border-[#1e1e1e] text-xs text-[#71717a]">
                    <span>Done by: </span>
                    <span className="text-white font-bold">{event.actor}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
