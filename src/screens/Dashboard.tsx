import { useMemo } from 'react'
import { Icon } from '../components/ui/Icon'
import { getDraft, getSubmittedClaims } from '../lib/claimStore'
import type { ViewId } from '../types'

const DEMO_COUNTS = {
  review: 2,
  missing: 2,
  submitted: 2,
}

export default function Dashboard({ onNavigate }: { onNavigate: (v: ViewId) => void }) {
  const draft = useMemo(() => getDraft(), [])
  const submitted = useMemo(() => getSubmittedClaims(), [])

  const hasActiveDraft = Boolean(draft && draft.status !== 'submitted')
  const totalSubmitted = submitted.length + DEMO_COUNTS.submitted

  const stats = [
    {
      label: 'Total claims',
      value: hasActiveDraft ? 7 + submitted.length : 6 + submitted.length,
      note: 'This quarter',
      icon: 'file' as const,
      tone: 'text-white',
    },
    {
      label: 'Awaiting your review',
      value: DEMO_COUNTS.review + (hasActiveDraft ? 1 : 0),
      note: hasActiveDraft ? 'Includes your open draft' : 'Nothing pending from you',
      icon: 'clock' as const,
      tone: 'text-white',
    },
    {
      label: 'Missing evidence',
      value: DEMO_COUNTS.missing,
      note: 'Demo rows',
      icon: 'alert' as const,
      tone: 'text-[#FF4D6D]',
    },
    {
      label: 'Submitted to OEM',
      value: totalSubmitted,
      note: submitted.length > 0 ? `${submitted.length} dispatched by you` : 'Demo rows only',
      icon: 'send' as const,
      tone: 'text-[#06D6A0]',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] pb-16 text-white">
      {/* ── Title ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#71717a]">
            MAINTENANCE OPERATIONS
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#a1a1aa]">
            Your claim pipeline at a glance — draft, review, dispatch.
          </p>
        </div>
        <button
          onClick={() => onNavigate('create')}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-neutral-200 cursor-pointer self-start"
        >
          <span className="text-lg leading-none font-black">+</span>
          <span>Create new claim</span>
        </button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#262626] bg-[#141414] text-white">
                <Icon name={s.icon} className="h-5 w-5" />
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-[#a1a1aa]">{s.label}</span>
                <p className={`mt-1 text-3xl font-extrabold ${s.tone}`}>{String(s.value).padStart(2, '0')}</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-[#71717a]">{s.note}</p>
          </div>
        ))}
      </div>

      {/* ── Live Work Queue ─────────────────────────────────────────────── */}
      <div className="mt-6 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-[#71717a]">
            Your Work Queue
          </h2>
          <button
            onClick={() => onNavigate('claims')}
            className="text-xs font-semibold text-white hover:underline"
          >
            View all claims →
          </button>
        </div>

        <div className="divide-y divide-[#1e1e1e]">
          {hasActiveDraft && draft && (
            <button
              onClick={() => onNavigate(draft.status === 'review' || draft.status === 'pending_approval' ? 'approval' : 'create')}
              className="w-full flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-2 hover:bg-[#111111] rounded-lg transition-colors cursor-pointer gap-2 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-white bg-[#141414] px-2 py-0.5 rounded border border-[#262626]">
                  {draft.id}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{draft.equipmentType}</p>
                  <p className="text-xs text-[#71717a]">
                    {draft.depot} · {draft.manufacturer}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-mono text-xs font-bold text-white">
                  ₹{draft.amountInr.toLocaleString('en-IN')}
                </p>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase bg-white text-black">
                  {draft.status === 'review' || draft.status === 'pending_approval' ? 'Under review' : 'Draft'}
                </span>
              </div>
            </button>
          )}

          {submitted.map((s) => (
            <button
              key={s.id}
              onClick={() => onNavigate('claims')}
              className="w-full flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-2 hover:bg-[#111111] rounded-lg transition-colors cursor-pointer gap-2 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-white bg-[#0C271E] px-2 py-0.5 rounded border border-[#06D6A0]/30">
                  {s.id}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{s.equipment}</p>
                  <p className="text-xs text-[#71717a]">{s.oem}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-mono text-xs font-bold text-white">
                  ₹{s.amountInr.toLocaleString('en-IN')}
                </p>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase bg-[#0C271E] text-[#06D6A0] border border-[#06D6A0]/30">
                  Submitted
                </span>
              </div>
            </button>
          ))}

          {!hasActiveDraft && submitted.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-[#a1a1aa]">No active claims from you yet.</p>
              <button
                onClick={() => onNavigate('create')}
                className="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Create your first claim
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('evidence')}
          className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5 text-left hover:border-[#333] transition-colors cursor-pointer"
        >
          <Icon name="cloud" className="h-5 w-5 text-white" />
          <p className="mt-3 text-sm font-bold text-white">Evidence vault</p>
          <p className="mt-1 text-xs text-[#71717a]">All photos and files stored against your claims.</p>
        </button>
        <button
          onClick={() => onNavigate('analytics')}
          className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5 text-left hover:border-[#333] transition-colors cursor-pointer"
        >
          <Icon name="analytics" className="h-5 w-5 text-white" />
          <p className="mt-3 text-sm font-bold text-white">Analytics</p>
          <p className="mt-1 text-xs text-[#71717a]">Claim throughput and evidence readiness.</p>
        </button>
        <button
          onClick={() => onNavigate('audit')}
          className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5 text-left hover:border-[#333] transition-colors cursor-pointer"
        >
          <Icon name="shield" className="h-5 w-5 text-white" />
          <p className="mt-3 text-sm font-bold text-white">Audit trail</p>
          <p className="mt-1 text-xs text-[#71717a]">Every capture, sign-off and dispatch event.</p>
        </button>
      </div>
    </div>
  )
}
