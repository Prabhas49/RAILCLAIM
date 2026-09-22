import { useState, useMemo } from 'react'
import type { ViewId } from '../types'
import { getDraft, getSubmittedClaims } from '../lib/claimStore'

interface ClaimRow {
  id: string
  equipment: string
  fault: string
  date: string
  status: 'Draft in progress' | 'Under Engineer Review' | 'Missing Information' | 'Submitted to OEM'
  engineer: string
  live?: boolean
}

const DEMO_CLAIMS: ClaimRow[] = [
  {
    id: 'HS-2026-0881',
    equipment: 'Traction Motor',
    fault: 'Abnormal vibration during acceleration',
    date: '18 Feb 2026',
    status: 'Under Engineer Review',
    engineer: 'Pragna Rao',
  },
  {
    id: 'HS-2026-0882',
    equipment: 'Brake Control Unit',
    fault: 'Intermittent pressure loss',
    date: '18 Feb 2026',
    status: 'Missing Information',
    engineer: 'S. Rao',
  },
  {
    id: 'HS-2026-0883',
    equipment: 'Door Actuator',
    fault: 'Door fails to lock at station',
    date: '18 Feb 2026',
    status: 'Submitted to OEM',
    engineer: 'Pragna Rao',
  },
  {
    id: 'HS-2026-0884',
    equipment: 'HVAC Compressor',
    fault: 'Refrigerant cycle high pressure trip',
    date: '18 Feb 2026',
    status: 'Submitted to OEM',
    engineer: 'R. Iyer',
  },
  {
    id: 'HS-2026-0885',
    equipment: 'Pantograph Assembly',
    fault: 'Arcing detected on collector strip',
    date: '18 Feb 2026',
    status: 'Under Engineer Review',
    engineer: 'S. Rao',
  },
  {
    id: 'HS-2026-0886',
    equipment: 'Auxiliary Power Unit',
    fault: 'Phase inverter temperature sensor fault',
    date: '18 Feb 2026',
    status: 'Missing Information',
    engineer: 'R. Iyer',
  },
]

const STATUS_OPTIONS = [
  'All statuses',
  'Draft in progress',
  'Under Engineer Review',
  'Missing Information',
  'Submitted to OEM',
] as const

export default function Claims({
  onNavigate,
  onSelectClaim,
}: {
  onNavigate: (v: ViewId) => void
  onSelectClaim?: () => void
}) {
  const draft = useMemo(() => getDraft(), [])
  const submitted = useMemo(() => getSubmittedClaims(), [])

  const rows: ClaimRow[] = useMemo(() => {
    const live: ClaimRow[] = []
    if (draft && draft.status !== 'submitted') {
      live.push({
        id: draft.id,
        equipment: draft.equipmentType,
        fault: draft.faultSummary,
        date: new Date(draft.faultDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        status:
          draft.status === 'review' ? 'Under Engineer Review' : 'Draft in progress',
        engineer: 'You',
        live: true,
      })
    }
    const filed: ClaimRow[] = submitted.map((s) => ({
      id: s.id,
      equipment: s.equipment,
      fault: s.fault,
      date: s.date,
      status: 'Submitted to OEM',
      engineer: 'You',
    }))
    return [...live, ...filed, ...DEMO_CLAIMS]
  }, [draft, submitted])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All statuses')
  const [openDropdown, setOpenDropdown] = useState<'status' | null>(null)

  const filteredClaims = useMemo(() => {
    return rows.filter((c) => {
      if (statusFilter !== 'All statuses' && c.status !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        c.id.toLowerCase().includes(q) ||
        c.equipment.toLowerCase().includes(q) ||
        c.fault.toLowerCase().includes(q) ||
        c.engineer.toLowerCase().includes(q)
      )
    })
  }, [rows, searchQuery, statusFilter])

  const statusBadge = (status: ClaimRow['status']) => {
    switch (status) {
      case 'Draft in progress':
        return 'bg-[#141414] text-[#a1a1aa] border border-[#27272a]'
      case 'Under Engineer Review':
        return 'bg-[rgba(255,255,255,0.08)] text-white border border-[#FFFFFF]/30'
      case 'Missing Information':
        return 'bg-[#2B1218] text-[#FF4D6D] border border-[#FF4D6D]/30'
      case 'Submitted to OEM':
        return 'bg-[#0C271E] text-[#06D6A0] border border-[#06D6A0]/30'
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] pb-16 text-white">
      {/* ── Title ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
            MAINTENANCE OPERATIONS
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">Claims</h1>
          <p className="mt-1.5 text-sm text-[#a1a1aa]">
            Track, review, and move evidence-backed claims forward.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('create')}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 transition-colors cursor-pointer self-start"
        >
          <span className="text-lg leading-none font-black">+</span>
          <span>Create new claim</span>
        </button>
      </div>

      {/* ── Search & Filter ─────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#71717a]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims, equipment, or fault"
            className="w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#71717a] focus:border-white/60 focus:outline-none"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
            className="flex items-center gap-2.5 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-2.5 text-xs text-[#a1a1aa] transition-colors hover:text-white hover:border-[#333333] cursor-pointer"
          >
            <span>{statusFilter}</span>
            <svg className="w-3.5 h-3.5 text-[#71717a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'status' && (
            <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] py-1 shadow-xl">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt)
                    setOpenDropdown(null)
                  }}
                  className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[#141414] hover:text-white cursor-pointer ${
                    statusFilter === opt ? 'font-bold text-white' : 'text-[#a1a1aa]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e] text-[11px] font-semibold tracking-wider text-[#71717a] uppercase">
              <th className="py-4 px-6 font-semibold w-44">CLAIM ID</th>
              <th className="py-4 px-6 font-semibold">EQUIPMENT / FAULT</th>
              <th className="py-4 px-6 font-semibold w-40">DATE</th>
              <th className="py-4 px-6 font-semibold w-56">STATUS</th>
              <th className="py-4 px-6 font-semibold w-36">ENGINEER</th>
              <th className="py-4 px-6 text-right w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-[#71717a]">
                  No claims found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredClaims.map((claim) => (
                <tr
                  key={claim.id}
                  onClick={() => {
                    if (claim.live) onNavigate('approval')
                    else onSelectClaim?.()
                  }}
                  className="group hover:bg-[#111111] transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6 text-xs font-bold text-white">
                    <span className="inline-flex items-center gap-2">
                      {claim.id}
                      {claim.live && (
                        <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-black">
                          YOUR DRAFT
                        </span>
                      )}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <p className="text-xs font-semibold text-white">{claim.equipment}</p>
                    <p className="mt-0.5 text-xs text-[#a1a1aa]">{claim.fault}</p>
                  </td>

                  <td className="py-4 px-6 text-xs text-[#d1d5db]">{claim.date}</td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-[4px] text-xs font-medium ${statusBadge(claim.status)}`}
                    >
                      {claim.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-xs text-[#d1d5db]">{claim.engineer}</td>

                  <td className="py-4 px-6 text-right">
                    <svg
                      className="w-4 h-4 text-[#52525b] group-hover:text-white transition-colors ml-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-[#71717a]">
        Demo rows shown for context — your draft and dispatched claims always appear at the top.
      </p>
    </div>
  )
}
