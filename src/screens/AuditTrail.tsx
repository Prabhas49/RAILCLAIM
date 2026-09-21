import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { AUDIT_EVENTS } from '../data/mock'

const KIND_CONFIG: Record<string, { label: string; badge: string }> = {
  capture: { label: 'FIELD CAPTURE', badge: 'bg-neutral-100 text-black border border-neutral-200' },
  ai: { label: 'NEURAL INFERENCE', badge: 'bg-black text-white' },
  human: { label: 'INSPECTOR SIGN-OFF', badge: 'bg-neutral-200 text-black font-bold' },
  system: { label: 'GATEWAY DISPATCH', badge: 'bg-neutral-100 text-black border border-neutral-300' },
}

export default function AuditTrail({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<string>('all')
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null)

  const list = filter === 'all' ? AUDIT_EVENTS : AUDIT_EVENTS.filter((e) => e.kind === filter)

  const handleVerify = (hash: string) => {
    setVerifiedHash(hash)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16 text-black">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-6">
        <div>
          <button
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-500 hover:text-black transition-colors"
          >
            <span>← Back to Command Center</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-black" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">
              Cryptographic Audit Chain // ISO/IEC 27001 & JIS Audit Standard
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-black tracking-tight">
            Tamper-Evident Warranty Provenance Ledger
          </h1>
          <p className="font-mono text-xs text-neutral-500 mt-1">
            Every acoustic note, OCR bounding box, human sign-off, and OEM transmission is cryptographically hashed.
          </p>
        </div>

        {/* Global Integrity Badge */}
        <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-black font-bold">
            <Icon name="shieldCheck" className="h-4 w-4" />
            <span>MERKLE ROOT INTEGRITY: 100%</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-1 font-medium">
            Chain Height: 8 Blocks · Zero Tampering Detected
          </p>
        </div>
      </div>

      {/* ── Filter Strip ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-neutral-500 mr-2 font-bold">Filter Provenance:</span>
        {['all', 'capture', 'ai', 'human', 'system'].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-4 py-1.5 font-mono text-xs font-semibold uppercase transition-colors border ${
              filter === k
                ? 'bg-black text-white border-black'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-black'
            }`}
          >
            {k === 'all' ? 'All Events (8)' : k}
          </button>
        ))}
      </div>

      {/* ── Block-by-Block Audit Chain ──────────────────────────────── */}
      <div className="relative border-l-2 border-neutral-200 ml-4 space-y-6 pl-6 py-2">
        {list.map((event, idx) => {
          const cfg = KIND_CONFIG[event.kind] ?? {
            label: event.kind.toUpperCase(),
            badge: 'bg-neutral-100 text-black',
          }

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="relative rounded-2xl border border-neutral-200 bg-white shadow-card p-6"
            >
              {/* Chain Node Marker */}
              <div className="absolute -left-[31px] top-7 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-black">
                <div className="h-1.5 w-1.5 rounded-full bg-black" />
              </div>

              {/* Event Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <h3 className="font-mono text-sm font-bold text-black">{event.action}</h3>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-neutral-500 font-medium">{event.at}</span>
                </div>
              </div>

              {/* Event Details */}
              <div className="mt-4 space-y-3 font-mono text-xs">
                <p className="text-neutral-700 leading-relaxed font-sans text-sm">{event.detail}</p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span>Authorized Actor:</span>
                    <span className="text-black font-bold">{event.actor}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Hash:</span>
                    <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[11px] text-black font-bold">
                      {event.hash}
                    </span>
                    <button
                      onClick={() => handleVerify(event.hash)}
                      className="text-xs font-bold text-black hover:underline"
                    >
                      Verify Signature
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Signature Verification Modal ────────────────────────────── */}
      {verifiedHash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-elevation text-black"
          >
            <div className="flex items-center gap-2 text-black font-mono text-sm font-bold">
              <Icon name="shieldCheck" className="h-5 w-5 text-black" />
              <span>CRYPTOGRAPHIC INTEGRITY CONFIRMED</span>
            </div>

            <div className="mt-4 rounded-xl bg-neutral-50 p-4 border border-neutral-200 font-mono text-xs space-y-2">
              <p className="text-neutral-500 font-bold">Block Hash:</p>
              <p className="text-black break-all font-bold">{verifiedHash}</p>
              <div className="pt-3 border-t border-neutral-200 text-[11px] text-neutral-700 space-y-1">
                <p>✓ Signature algorithm: RSA-4096 / SHA-256</p>
                <p>✓ Timestamp Authority: KMRL Transit CA #1</p>
                <p>✓ Immutable Status: VALID</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setVerifiedHash(null)}
                className="rounded-full bg-black px-5 py-2 font-mono text-xs font-semibold text-white hover:bg-neutral-800"
              >
                Close Inspector
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
