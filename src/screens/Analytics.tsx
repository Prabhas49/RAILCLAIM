import { useState } from 'react'
import type { ViewId } from '../types'

export default function Analytics({
  onNavigate,
}: {
  onNavigate?: (v: ViewId) => void
}) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  // 12 bars — Oct 2025 → Sep 2026
  const monthlyData = [
    { label: 'Oct', value: 8, height: 33 },
    { label: 'Nov', value: 12, height: 50 },
    { label: 'Dec', value: 9, height: 38 },
    { label: 'Jan', value: 16, height: 65 },
    { label: 'Feb', value: 14, height: 58 },
    { label: 'Mar', value: 19, height: 80 },
    { label: 'Apr', value: 13, height: 52 },
    { label: 'May', value: 21, height: 88 },
    { label: 'Jun', value: 18, height: 74 },
    { label: 'Jul', value: 21, height: 88 },
    { label: 'Aug', value: 21, height: 88 },
    { label: 'Sep', value: 21, height: 88 },
  ]

  // Radial progress calculations for 78%
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (78 / 100) * circumference

  return (
    <div className="relative min-h-[calc(100vh-64px)] pb-28 text-white select-none">
      {/* ── Title & Eyebrow ────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
          MAINTENANCE OPERATIONS
        </p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Analytics
        </h1>
        <p className="mt-1.5 text-sm text-[#a1a1aa]">
          A clear view of claim throughput and evidence readiness.
        </p>
      </div>

      {/* ── Top Two Cards Grid ──────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Preparation Volume (Claims Over Time) */}
        <div className="lg:col-span-7 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
                  CLAIMS OVER TIME
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
                  Preparation volume
                </h2>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white">24</span>
                <span className="text-sm font-medium text-[#a1a1aa] ml-1.5">claims</span>
              </div>
            </div>
          </div>

          {/* 12-Month Bar Chart */}
          <div className="mt-8">
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-[#1e1e1e] pb-2">
              {monthlyData.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip on hover */}
                  {hoveredBar === i && (
                    <div className="absolute -top-8 bg-black border border-[#1e1e1e] text-[#FFFFFF] text-[10px] font-bold py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                      {d.value} claims
                    </div>
                  )}

                  {/* Gradient Bar */}
                  <div
                    className="w-full rounded-t-[4px] transition-all duration-300 group-hover:brightness-110"
                    style={{
                      height: `${d.height}%`,
                      background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 60%, #FFFFFF 100%)',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between gap-2 sm:gap-3 px-2 mt-2.5 text-[11px] font-medium text-[#71717a]">
              {monthlyData.map((d, i) => (
                <span key={i} className="flex-1 text-center">
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Readiness Score (Evidence Completeness) */}
        <div className="lg:col-span-5 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-7 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#10b981]">
              READINESS SCORE
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
              Evidence completeness
            </h2>
          </div>

          {/* Radial Donut Gauge */}
          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#1e1e1e"
                  strokeWidth="16"
                />
                {/* Active Amber Progress Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#FFFFFF"
                  strokeWidth="16"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Percentage in center */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  78%
                </span>
              </div>
            </div>

            {/* Month-over-month indicator */}
            <p className="mt-5 text-xs font-semibold text-[#10b981] flex items-center gap-1">
              <span>↑ 9% compared with last month</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Lower Breakdown Section ─────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-sm">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
            DISPUTE AVOIDANCE
          </p>
          <p className="mt-2 text-3xl font-extrabold text-white">99.4%</p>
          <p className="mt-1 text-xs text-[#a1a1aa]">
            Claims accepted on first submission without OEM dispute
          </p>
          <div className="mt-4 h-1.5 w-full bg-[#1e1e1e] rounded-full overflow-hidden">
            <div className="h-full bg-[#10b981] rounded-full" style={{ width: '99.4%' }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-sm">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
            AVERAGE REVIEW SPEED
          </p>
          <p className="mt-2 text-3xl font-extrabold text-[#FFFFFF]">3.2 hrs</p>
          <p className="mt-1 text-xs text-[#a1a1aa]">
            Time from depot incident capture to engineer dispatch
          </p>
          <div className="mt-4 h-1.5 w-full bg-[#1e1e1e] rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-sm">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
            WARRANTY RECOVERY
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-400">₹38,20,000</p>
          <p className="mt-1 text-xs text-[#a1a1aa]">
            Recovered from Japanese OEM warranty clauses this quarter
          </p>
          <div className="mt-4 h-1.5 w-full bg-[#1e1e1e] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>
      </div>

    </div>
  )
}
