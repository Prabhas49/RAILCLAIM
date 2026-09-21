import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { CLAIM_QUEUE, OEM_BY_ID } from '../data/mock'
import type { ViewId } from '../types'

export default function Dashboard({ onNavigate }: { onNavigate: (v: ViewId) => void }) {
  const [wokenServers, setWokenServers] = useState(false)

  return (
    <div className="relative min-h-[calc(100vh-64px)] pb-24 text-white">
      {/* ── Title & Greeting ────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold tracking-wider uppercase text-[#526E94]">
          MAINTENANCE OPERATIONS
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Good morning, Arjun
        </h1>
        <p className="mt-1 text-sm text-[#7D93B2]">
          Here’s the operating picture across your warranty claims.
        </p>
      </div>

      {/* ── Primary Action Button ───────────────────────────────────── */}
      <div className="mt-6">
        <button
          onClick={() => onNavigate('capture')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00C2FF] px-5 py-2.5 text-sm font-bold text-black shadow-sm transition-all hover:bg-[#26cbff] active:scale-[0.98]"
        >
          <span className="text-lg leading-none font-black">+</span>
          <span>Create new claim</span>
        </button>
      </div>

      {/* ── 4 Stat Metric Cards ─────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total claims */}
        <div className="rounded-xl border border-[#162740] bg-[#0B1526] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A263B] border border-[#00C2FF]/20 text-[#00C2FF]">
              <Icon name="file" className="h-5 w-5" />
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-[#7D93B2]">Total claims</span>
              <p className="mt-1 text-3xl font-extrabold text-white">24</p>
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-[#00C2FF]">
            ↑ 12% this month
          </p>
        </div>

        {/* Card 2: Awaiting review */}
        <div className="rounded-xl border border-[#162740] bg-[#0B1526] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#292010] border border-[#FFB703]/20 text-[#FFB703]">
              <Icon name="clock" className="h-5 w-5" />
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-[#7D93B2]">Awaiting review</span>
              <p className="mt-1 text-3xl font-extrabold text-white">06</p>
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-[#FFB703]">
            Needs your attention
          </p>
        </div>

        {/* Card 3: Missing evidence */}
        <div className="rounded-xl border border-[#162740] bg-[#0B1526] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2B1218] border border-[#FF4D6D]/20 text-[#FF4D6D]">
              <Icon name="alert" className="h-5 w-5" />
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-[#7D93B2]">Missing evidence</span>
              <p className="mt-1 text-3xl font-extrabold text-white">04</p>
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-[#FF4D6D]">
            Action required
          </p>
        </div>

        {/* Card 4: Submitted to OEM */}
        <div className="rounded-xl border border-[#162740] bg-[#0B1526] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C271E] border border-[#06D6A0]/20 text-[#06D6A0]">
              <Icon name="send" className="h-5 w-5" />
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-[#7D93B2]">Submitted to OEM</span>
              <p className="mt-1 text-3xl font-extrabold text-white">09</p>
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-[#06D6A0]">
            ↑ 3 this month
          </p>
        </div>
      </div>

      {/* ── Bottom Section: LIVE WORK QUEUE & PORTFOLIO ─────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: LIVE WORK QUEUE */}
        <div className="lg:col-span-8 rounded-xl border border-[#162740] bg-[#0B1526] p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#152338] pb-4">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#526E94]">
              LIVE WORK QUEUE
            </h2>
            <button
              onClick={() => onNavigate('claims')}
              className="text-xs font-semibold text-[#00C2FF] hover:underline"
            >
              View all claims →
            </button>
          </div>

          <div className="divide-y divide-[#152338]">
            {CLAIM_QUEUE.slice(0, 5).map((claim) => {
              const oem = OEM_BY_ID[claim.oem]
              return (
                <div
                  key={claim.id}
                  onClick={() => onNavigate('claims')}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-2 hover:bg-[#0E1E36] rounded-lg transition-colors cursor-pointer gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white bg-[#10243E] px-2 py-0.5 rounded border border-[#182F4D]">
                      {claim.id}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{claim.assetName}</p>
                      <p className="text-xs text-[#7D93B2]">{claim.depot} · {oem.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right sm:text-right">
                    <div>
                      <p className="font-mono text-xs font-bold text-white">₹{(claim.amountInr).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-[#526E94]">{Math.round(claim.confidence * 100)}% confidence</p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        claim.status === 'ready'
                          ? 'bg-[#0A2E46] text-[#00C2FF] border border-[#00C2FF]/30'
                          : claim.status === 'needs_info'
                          ? 'bg-[#292010] text-[#FFB703] border border-[#FFB703]/30'
                          : 'bg-[#10243E] text-[#7D93B2]'
                      }`}
                    >
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: PORTFOLIO */}
        <div className="lg:col-span-4 rounded-xl border border-[#162740] bg-[#0B1526] p-5 shadow-sm">
          <div className="border-b border-[#152338] pb-4">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#526E94]">
              PORTFOLIO
            </h2>
            <p className="text-xs font-semibold text-white mt-1">Status overview</p>
          </div>

          <div className="mt-5 space-y-3.5">
            {[
              { label: 'Submitted to OEM', count: 9, share: 37, color: 'bg-[#06D6A0]' },
              { label: 'Awaiting review', count: 6, share: 25, color: 'bg-[#FFB703]' },
              { label: 'Ready to submit', count: 5, share: 21, color: 'bg-[#00C2FF]' },
              { label: 'Missing evidence', count: 4, share: 17, color: 'bg-[#FF4D6D]' },
            ].map((st) => (
              <div key={st.label} className="space-y-1 text-xs font-medium">
                <div className="flex justify-between text-[#7D93B2]">
                  <span>{st.label}</span>
                  <span className="font-mono text-white font-bold">{st.count} ({st.share}%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0E1E36] overflow-hidden">
                  <div className={`h-full rounded-full ${st.color}`} style={{ width: `${st.share}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#152338] flex items-center justify-between text-xs">
            <span className="text-[#7D93B2]">OEM Partner SLA Status</span>
            <span className="text-[#06D6A0] font-bold">100% In-Window</span>
          </div>
        </div>
      </div>

      {/* ── Floating Bottom Pill Banner (From Screenshot) ───────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-4 rounded-full bg-[#121E30]/95 backdrop-blur-md border border-[#1E3352] px-5 py-2 text-xs font-medium text-white shadow-2xl">
          <span>
            {wokenServers
              ? 'Backend servers active. Real-time telemetry synchronized.'
              : 'Frontend Preview Only. Please wake servers to enable backend functionality.'}
          </span>
          <button
            onClick={() => setWokenServers(!wokenServers)}
            className={`rounded-full px-3 py-1 font-semibold transition-all ${
              wokenServers
                ? 'bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/40'
                : 'bg-[#133C4A] text-[#00C2FF] border border-[#00C2FF]/40 hover:bg-[#184D5E]'
            }`}
          >
            {wokenServers ? 'Servers active ✓' : 'Wake up servers'}
          </button>
        </div>
      </div>
    </div>
  )
}
