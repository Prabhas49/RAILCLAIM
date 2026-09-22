import { useState, useMemo } from 'react'
import type { ViewId } from '../types'

export interface ClaimItem {
  id: string
  equipment: string
  fault: string
  date: string
  status: 'Under Engineer Review' | 'Missing Information' | 'Submitted to OEM'
  engineer: string
}

const CLAIMS_DATA: ClaimItem[] = [
  {
    id: 'HS-2026-001',
    equipment: 'Traction Motor',
    fault: 'Abnormal vibration during acceleration',
    date: '18 Feb 2026',
    status: 'Under Engineer Review',
    engineer: 'Pragna Rao',
  },
  {
    id: 'HS-2026-002',
    equipment: 'Brake Control Unit',
    fault: 'Intermittent pressure loss',
    date: '18 Feb 2026',
    status: 'Missing Information',
    engineer: 'S. Rao',
  },
  {
    id: 'HS-2026-003',
    equipment: 'Door Actuator',
    fault: 'Door fails to lock at station',
    date: '18 Feb 2026',
    status: 'Submitted to OEM',
    engineer: 'Pragna Rao',
  },
  {
    id: 'RC-2026-004',
    equipment: 'HVAC Compressor',
    fault: 'Refrigerant cycle high pressure trip',
    date: '18 Feb 2026',
    status: 'Submitted to OEM',
    engineer: 'R. Iyer',
  },
  {
    id: 'RC-2026-005',
    equipment: 'Pantograph Assembly',
    fault: 'Arcing detected on collector strip',
    date: '18 Feb 2026',
    status: 'Under Engineer Review',
    engineer: 'S. Rao',
  },
  {
    id: 'RC-2026-006',
    equipment: 'Auxiliary Power Unit',
    fault: 'Phase inverter temperature sensor fault',
    date: '18 Feb 2026',
    status: 'Missing Information',
    engineer: 'R. Iyer',
  },
]

export default function Claims({
  onNavigate,
  onSelectClaim,
}: {
  onNavigate: (v: ViewId) => void
  onSelectClaim?: (claimId: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [equipmentFilter, setEquipmentFilter] = useState('All equipment')
  const [dateFilter, setDateFilter] = useState('Last 30 days')
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [equipmentDropdownOpen, setEquipmentDropdownOpen] = useState(false)
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false)
  const [wokenServers, setWokenServers] = useState(false)

  const statusOptions = [
    'All statuses',
    'Under Engineer Review',
    'Missing Information',
    'Submitted to OEM',
  ]

  const equipmentOptions = [
    'All equipment',
    'Traction Motor',
    'Brake Control Unit',
    'Door Actuator',
    'Pantograph Assembly',
    'Auxiliary Power Unit',
    'HVAC Compressor',
  ]

  const dateOptions = ['Last 30 days', 'Last 7 days', 'Last 90 days', 'All time']

  const filteredClaims = useMemo(() => {
    return CLAIMS_DATA.filter((c) => {
      if (statusFilter !== 'All statuses' && c.status !== statusFilter) return false
      if (equipmentFilter !== 'All equipment' && c.equipment !== equipmentFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        c.id.toLowerCase().includes(q) ||
        c.equipment.toLowerCase().includes(q) ||
        c.fault.toLowerCase().includes(q) ||
        c.engineer.toLowerCase().includes(q) ||
        c.date.toLowerCase().includes(q)
      )
    })
  }, [searchQuery, statusFilter, equipmentFilter])

  const renderStatusBadge = (status: ClaimItem['status']) => {
    switch (status) {
      case 'Under Engineer Review':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-[4px] text-xs font-medium bg-[#292010] text-[#FFB703] border border-[#FFB703]/30">
            {status}
          </span>
        )
      case 'Missing Information':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-[4px] text-xs font-medium bg-[#2B1218] text-[#FF4D6D] border border-[#FF4D6D]/30">
            {status}
          </span>
        )
      case 'Submitted to OEM':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-[4px] text-xs font-medium bg-[#0C271E] text-[#06D6A0] border border-[#06D6A0]/30">
            {status}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-[4px] text-xs font-medium bg-[#141414] text-[#a1a1aa] border border-[#27272a]">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] pb-28 text-white select-none">
      {/* ── Title & Eyebrow ────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#71717a]">
          MAINTENANCE OPERATIONS
        </p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Claims
        </h1>
        <p className="mt-1.5 text-sm text-[#a1a1aa]">
          Track, review, and move evidence-backed claims forward.
        </p>
      </div>

      {/* ── Primary Action Button ───────────────────────────────────── */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => onNavigate('capture')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00c2ff] px-5 py-2.5 text-sm font-extrabold text-black shadow-sm transition-all hover:bg-[#2ed2ff] active:scale-[0.98]"
        >
          <span className="text-lg leading-none font-black">+</span>
          <span>Create new claim</span>
        </button>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#71717a]">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
            placeholder="Search claims, equipment, or serial number"
            className="w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#71717a] transition-all focus:border-[#00c2ff]/60 focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen)
                setEquipmentDropdownOpen(false)
                setDateDropdownOpen(false)
              }}
              className="flex items-center gap-2.5 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-2.5 text-xs text-[#a1a1aa] transition-colors hover:text-white hover:border-[#333333]"
            >
              <span>{statusFilter}</span>
              <svg
                className="w-3.5 h-3.5 text-[#71717a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {statusDropdownOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] py-1 shadow-xl">
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt)
                      setStatusDropdownOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[#141414] hover:text-white ${
                      statusFilter === opt ? 'font-bold text-[#00c2ff]' : 'text-[#a1a1aa]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Equipment filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setEquipmentDropdownOpen(!equipmentDropdownOpen)
                setStatusDropdownOpen(false)
                setDateDropdownOpen(false)
              }}
              className="flex items-center gap-2.5 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-2.5 text-xs text-[#a1a1aa] transition-colors hover:text-white hover:border-[#333333]"
            >
              <span>{equipmentFilter}</span>
              <svg
                className="w-3.5 h-3.5 text-[#71717a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {equipmentDropdownOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] py-1 shadow-xl">
                {equipmentOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setEquipmentFilter(opt)
                      setEquipmentDropdownOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[#141414] hover:text-white ${
                      equipmentFilter === opt ? 'font-bold text-[#00c2ff]' : 'text-[#a1a1aa]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDateDropdownOpen(!dateDropdownOpen)
                setStatusDropdownOpen(false)
                setEquipmentDropdownOpen(false)
              }}
              className="flex items-center gap-2.5 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-2.5 text-xs text-[#a1a1aa] transition-colors hover:text-white hover:border-[#333333]"
            >
              <span>{dateFilter}</span>
              <svg
                className="w-3.5 h-3.5 text-[#71717a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {dateDropdownOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] py-1 shadow-xl">
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setDateFilter(opt)
                      setDateDropdownOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[#141414] hover:text-white ${
                      dateFilter === opt ? 'font-bold text-[#00c2ff]' : 'text-[#a1a1aa]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Claims Data Table ─────────────────────────────────────────── */}
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
                    if (onSelectClaim) onSelectClaim(claim.id)
                  }}
                  className="group hover:bg-[#111111] transition-colors cursor-pointer"
                >
                  {/* Claim ID */}
                  <td className="py-4 px-6 font-sans text-xs font-bold text-[#00c2ff]">
                    {claim.id}
                  </td>

                  {/* Equipment / Fault */}
                  <td className="py-4 px-6">
                    <p className="text-xs font-semibold text-white group-hover:text-[#00c2ff] transition-colors">
                      {claim.equipment}
                    </p>
                    <p className="mt-0.5 text-xs text-[#a1a1aa]">
                      {claim.fault}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 text-xs text-[#d1d5db]">
                    {claim.date}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    {renderStatusBadge(claim.status)}
                  </td>

                  {/* Engineer */}
                  <td className="py-4 px-6 text-xs text-[#d1d5db]">
                    {claim.engineer}
                  </td>

                  {/* Action Chevron */}
                  <td className="py-4 px-6 text-right">
                    <svg
                      className="w-4 h-4 text-[#52525b] group-hover:text-white transition-colors ml-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Floating Bottom Pill Banner ──────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-4 rounded-full bg-[#0a0a0a]/95 backdrop-blur-md border border-[#1e1e1e] px-5 py-2 text-xs font-medium text-white shadow-2xl">
          <span>
            {wokenServers
              ? 'Backend servers active. Real-time telemetry synchronized.'
              : 'Frontend Preview Only. Please wake servers to enable backend functionality.'}
          </span>
          <button
            type="button"
            onClick={() => setWokenServers(!wokenServers)}
            className={`rounded-full px-3.5 py-1 font-semibold transition-all ${
              wokenServers
                ? 'bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/40'
                : 'bg-[#141414] text-[#00c2ff] border border-[#00c2ff]/40 hover:bg-[#1a1a1a]'
            }`}
          >
            {wokenServers ? 'Servers active ✓' : 'Wake up servers'}
          </button>
        </div>
      </div>
    </div>
  )
}
