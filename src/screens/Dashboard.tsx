import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, PanelHead } from '../components/ui/Card'
import { Stat } from '../components/ui/Stat'
import { Icon } from '../components/ui/Icon'
import { StatusPill, OemChip } from '../components/ui/Badge'
import { ACCENT_META, confidenceTone } from '../lib/status'
import { formatInr, formatInrShort, relativeAge } from '../lib/format'
import { CLAIM_QUEUE, OEMS, OEM_BY_ID } from '../data/mock'
import { cx } from '../lib/cx'
import type { Claim, ClaimStatus, ViewId } from '../types'

const OPEN: ClaimStatus[] = ['draft', 'processing', 'needs_info', 'ready', 'submitted']
const AT_RISK_DAYS = 14

const FILTERS: Array<{ id: 'all' | ClaimStatus; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'ready', label: 'Ready' },
  { id: 'needs_info', label: 'Needs info' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'reimbursed', label: 'Reimbursed' },
]

const TONE_TEXT: Record<string, string> = {
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
}

export function Dashboard({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | ClaimStatus>('all')

  const stats = useMemo(() => {
    const open = CLAIM_QUEUE.filter((c) => OPEN.includes(c.status))
    const atRisk = open.filter((c) => c.ageDays > AT_RISK_DAYS)
    return {
      open,
      openValue: open.reduce((s, c) => s + c.amountInr, 0),
      atRisk,
      atRiskValue: atRisk.reduce((s, c) => s + c.amountInr, 0),
      blocked: CLAIM_QUEUE.filter((c) => c.status === 'needs_info' || c.status === 'rejected'),
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CLAIM_QUEUE.filter((c) => {
      if (status !== 'all' && c.status !== status) return false
      if (!q) return true
      return [c.id, c.assetId, c.assetName, c.depot, c.operator, c.oem, c.language]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [query, status])

  const byOem = useMemo(() => {
    const rows = OEMS.map((oem) => {
      const claims = CLAIM_QUEUE.filter((c) => c.oem === oem.id)
      return {
        oem,
        count: claims.length,
        value: claims.reduce((s, c) => s + c.amountInr, 0),
        stuck: claims.filter((c) => c.status === 'needs_info' || c.status === 'rejected').length,
      }
    }).sort((a, b) => b.value - a.value)
    return { rows, max: Math.max(...rows.map((r) => r.value)) }
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat
          label="Claims in flight"
          value={String(stats.open.length)}
          hint={`${CLAIM_QUEUE.length} tracked across ${OEMS.length} contracts`}
          spark={{ data: [4, 6, 5, 7, 6, 9, 8], color: '#6366f1' }}
        />
        <Stat
          label="Recovery in flight"
          value={formatInrShort(stats.openValue)}
          hint="Awaiting OEM reimbursement"
          delta={{ value: '12%', direction: 'up', good: true }}
          spark={{ data: [12, 14, 13, 18, 17, 22, 24], color: '#0ea5e9' }}
        />
        <Stat
          label={`At risk · over ${AT_RISK_DAYS}d`}
          value={formatInrShort(stats.atRiskValue)}
          hint={`${stats.atRisk.length} claims past the safe filing window`}
          delta={{ value: '3%', direction: 'down', good: false }}
          spark={{ data: [3, 3, 4, 4, 5, 4, 5], color: '#f59e0b' }}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_296px]">
        <Card flush className="overflow-hidden">
          <PanelHead
            title="Claims"
            action={
              <div className="relative">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="h-9 w-44 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            }
          />

          <div className="flex items-center gap-4 px-6 pb-4">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatus(f.id)}
                className={cx(
                  'text-[13px] transition-colors',
                  status === f.id
                    ? 'font-medium text-slate-900'
                    : 'text-slate-400 hover:text-slate-600',
                )}
              >
                {f.label}
              </button>
            ))}
            <span className="num ml-auto text-[11px] text-slate-400">{filtered.length}</span>
          </div>

          <div className="overflow-x-auto scroll-slim">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-y border-slate-100">
                  {['Claim', 'Depot', 'Contract', 'Age', 'Value', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-3">
                      <span className="micro">{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((claim, i) => (
                  <Row
                    key={claim.id}
                    claim={claim}
                    index={i}
                    onOpen={() => onNavigate('review')}
                  />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center body">
                      Nothing matches “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <span className="micro">Recovery by contract</span>
            <div className="mt-5 space-y-4">
              {byOem.rows.map(({ oem, count, value, stuck }) => (
                <div key={oem.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <OemChip oem={oem.id} />
                    <span className="num text-[13px] font-medium text-slate-900">
                      {formatInrShort(value)}
                    </span>
                  </div>
                  <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cx('h-full rounded-full', ACCENT_META[oem.accent].bar)}
                      style={{ width: `${(value / byOem.max) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{count} claims</span>
                    <span>·</span>
                    <span>{oem.slaDays}d SLA</span>
                    {stuck > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-amber-600">{stuck} stuck</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <span className="micro">Needs attention</span>
            <div className="mt-5 space-y-5">
              {stats.blocked.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="num text-[13px] font-medium text-slate-900">{c.id}</span>
                    <span className="text-[11px] text-slate-400">{relativeAge(c.ageDays)}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug text-slate-500">{c.blocker}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({
  claim,
  index,
  onOpen,
}: {
  claim: Claim
  index: number
  onOpen: () => void
}) {
  const meta = OEM_BY_ID[claim.oem]
  const tone = confidenceTone(claim.confidence)

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.24) }}
      onClick={onOpen}
      className="group cursor-pointer transition-colors hover:bg-slate-50"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', ACCENT_META[meta.accent].bar)} />
          <span className="num text-[13px] font-medium text-slate-900">{claim.id}</span>
          <span className={cx('num text-[11px]', TONE_TEXT[tone])}>
            {(claim.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="mt-1 truncate pl-3.5 text-[13px] text-slate-500">{claim.assetName}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-[13px] text-slate-700">{claim.depot}</div>
        <div className="num mt-1 text-[11px] text-slate-400">{claim.assetId}</div>
      </td>
      <td className="px-6 py-4 text-[13px] text-slate-600">{meta.name}</td>
      <td
        className={cx(
          'num px-6 py-4 text-[13px]',
          claim.ageDays > AT_RISK_DAYS ? 'font-medium text-amber-600' : 'text-slate-500',
        )}
      >
        {claim.ageDays}d
      </td>
      <td className="num px-6 py-4 text-[13px] font-medium text-slate-900">
        {formatInr(claim.amountInr)}
      </td>
      <td className="px-6 py-4">
        <StatusPill status={claim.status} />
      </td>
    </motion.tr>
  )
}
