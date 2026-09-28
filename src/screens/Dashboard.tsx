import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { getDraft, getSubmittedClaims } from '../lib/claimStore'
import { canApprove, getSession } from '../lib/auth'
import { getPendingInbox, markClaimSeen } from '../lib/inbox'
import { getRecoveredTotalInr, getOemResponses, disputeClaim, markOemSeen } from '../lib/oemResponses'
import { startAutoPilot, AUTOPILOT_SCRIPT } from '../lib/autoPilot'
import { runDemo } from '../lib/demoMode'
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

  // Glowing "new claim" banner for engineers: re-check on focus so a claim
  // filed by the depot account lights up when the engineer logs in.
  const [inboxTick, setInboxTick] = useState(0)
  useEffect(() => {
    const refresh = () => setInboxTick((t) => t + 1)
    window.addEventListener('focus', refresh)
    window.addEventListener('hs-inbox-sync', refresh)
    window.addEventListener('hs-claim-sync', refresh)
    window.addEventListener('hs-oem-sync', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('hs-inbox-sync', refresh)
      window.removeEventListener('hs-claim-sync', refresh)
      window.removeEventListener('hs-oem-sync', refresh)
    }
  }, [])
  const pendingInbox = useMemo(
    () => (canApprove(getSession()) ? getPendingInbox() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inboxTick, draft],
  )
  const showNewClaimBanner = Boolean(pendingInbox?.unseen)
  const recovered = useMemo(() => 3820000 + getRecoveredTotalInr(), [inboxTick])
  const oemDecided = useMemo(() => getOemResponses().filter((r) => r.state === 'decided').length, [inboxTick])

  const [autopilot, setAutopilot] = useState<{ step: number; label: string } | null>(null)

  const handleDemo = () => {
    const id = runDemo()
    setInboxTick((t) => t + 1)
    setTimeout(() => onNavigate('claims'), 400)
  }

  /** Hands-free presentation mode: full arc incl. dispute → reconsideration. */
  const handleAutoPilot = () => {
    startAutoPilot()
    setInboxTick((t) => t + 1)
    AUTOPILOT_SCRIPT.forEach((step, i) => {
      window.setTimeout(() => setAutopilot({ step: i, label: step.label }), step.at)
    })
    window.setTimeout(() => setAutopilot(null), 36000)
    setTimeout(() => onNavigate('claims'), 1200)
  }

  // Auto-pilot: when the (forced) rejection lands, show the dispute banner.
  useEffect(() => {
    const onRejected = () => {
      const rejected = getOemResponses().find((r) => r.state === 'decided' && r.decision === 'rejected' && !r.reconsidered)
      if (!rejected) return
      const rebuttal = disputeClaim(rejected.claimId)
      setDispute({ claim: rejected, rebuttal })
      setInboxTick((t) => t + 1)
    }
    window.addEventListener('hs-autopilot-rejected', onRejected)
    return () => window.removeEventListener('hs-autopilot-rejected', onRejected)
  }, [])

  const [dispute, setDispute] = useState<null | { claim: { claimId: string; oem: string; equipment: string; amountInr: number }; rebuttal: string }>(null)

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
            {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' })()}, {getSession()?.name?.split(' ')[0] ?? 'Engineer'}
          </h1>
          <p className="mt-1 text-sm text-[#a1a1aa]">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · Your claim pipeline at a glance — draft, review, dispatch.
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

      {/* ── Cost-saved counter + demo launcher ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-2xl border border-[#06D6A0]/30 bg-gradient-to-r from-[#0C271E] via-[#0a0a0a] to-[#0a0a0a] p-5"
      >
        <div className="flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#06D6A0]">
            Warranty money recovered
          </p>
          <p className="mt-1 font-mono text-3xl font-black text-white">
            ₹{recovered.toLocaleString('en-IN')}
          </p>
          <p className="mt-0.5 text-xs text-[#a1a1aa]">
            {oemDecided > 0
              ? `${oemDecided} OEM decision${oemDecided === 1 ? '' : 's'} received — approvals credited live`
              : 'This quarter across all depots · OEM decisions credit here automatically'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            onClick={handleDemo}
            className="rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            ▶ Run 60-second demo
          </button>
          <button
            onClick={handleAutoPilot}
            className="rounded-xl border-2 border-[#06D6A0] bg-transparent px-5 py-3 text-xs font-black uppercase tracking-wider text-[#06D6A0] hover:bg-[#06D6A0]/10 transition-colors cursor-pointer"
          >
            🎬 Auto-pilot story mode
          </button>
        </div>
      </motion.div>

      {/* ── Auto-pilot step ticker ─────────────────────────────────── */}
      {autopilot && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-[#06D6A0]/40 bg-black px-6 py-3 font-mono text-xs font-bold text-[#06D6A0] shadow-2xl"
          data-no-invert
        >
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[#06D6A0]" />
          {autopilot.label}
        </motion.div>
      )}

      {/* ── Dispute mode banner ───────────────────────────────────── */}
      {dispute && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-[#FF4D6D]/40 bg-[#2B1218]/60 p-5"
        >
          <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#FF4D6D]">
            ⚔ OEM rejected {dispute.claim.claimId} — dispute mode engaged
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            {dispute.claim.oem} said the damage was "outside permitted operating conditions". We disagree.
          </p>
          <p className="mt-2 rounded-lg border border-[#262626] bg-black p-3 font-mono text-[11px] leading-relaxed text-[#a1a1aa]">
            {dispute.rebuttal}
          </p>
          <p className="mt-2 font-mono text-[10px] text-[#f59e0b]">
            Rebuttal transmitted · OEM reassessing under JIS review protocol… watch the bell 🔔
          </p>
          <button
            onClick={() => {
              markOemSeen(dispute.claim.claimId)
              setDispute(null)
              onNavigate('claims')
            }}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black"
          >
            Track the dispute →
          </button>
        </motion.div>
      )}

      {/* ── New-claim alert (engineers only) ─────────────────────────── */}
      {showNewClaimBanner && pendingInbox && (
        <button
          type="button"
          onClick={() => {
            markClaimSeen(pendingInbox.draft.id)
            onNavigate('approval')
          }}
          className="relative mt-6 flex w-full items-center gap-4 overflow-hidden rounded-xl border border-white/60 bg-white/[0.06] p-5 text-left shadow-[0_0_32px_rgba(255,255,255,0.18)] transition-transform hover:scale-[1.005] cursor-pointer"
        >
          <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa]">
              New claim just came in · {pendingInbox.draft.id}
            </span>
            <span className="mt-0.5 block truncate text-sm font-bold text-white">
              {pendingInbox.draft.equipmentType} — {pendingInbox.draft.faultSummary}
            </span>
            <span className="mt-0.5 block text-xs text-[#a1a1aa]">
              {pendingInbox.draft.photos.length} photo(s)
              {pendingInbox.draft.hasVoiceNote ? ' · voice note with Japanese translation' : ''} · check it out
            </span>
          </span>
          <span className="relative shrink-0 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black">
            Review now →
          </span>
        </button>
      )}

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
              onClick={() => onNavigate(canApprove(getSession()) && (draft.status === 'review' || draft.status === 'pending_approval') ? 'approval' : 'create')}
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
