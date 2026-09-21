import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { AUDIT_EVENTS } from '../data/mock'

const KIND_CONFIG: Record<string, { label: string; badge: string }> = {
  capture: { label: 'FIELD CAPTURE', badge: 'bg-[#141414] text-white border border-[#262626]' },
  ai: { label: 'NEURAL INFERENCE', badge: 'bg-[#0A263B] text-[#00c2ff] border border-[#00c2ff]/30' },
  human: { label: 'INSPECTOR SIGN-OFF', badge: 'bg-[#292010] text-[#FFB703] border border-[#FFB703]/30 font-bold' },
  system: { label: 'GATEWAY DISPATCH', badge: 'bg-[#0C271E] text-[#06D6A0] border border-[#06D6A0]/30' },
}

export default function AuditTrail({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<string>('all')
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null)

  const list = filter === 'all' ? AUDIT_EVENTS : AUDIT_EVENTS.filter((e) => e.kind === filter)

  const handleVerify = (hash: string) => {
    setVerifiedHash(hash)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16 text-white">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <button
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#71717a] hover:text-white transition-colors"
          >
            <span>← Back to Command Center</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00c2ff] shadow-[0_0_8px_#00c2ff]" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">
              Cryptographic Audit Chain // ISO/IEC 27001 & JIS Audit Standard
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white tracking-tight">
            Tamper-Evident Warranty Provenance Ledger
          </h1>
          <p className="font-mono text-xs text-[#a1a1aa] mt-1">
            Every acoustic note, OCR bounding box, human sign-off, and OEM transmission is cryptographically hashed.
          </p>
        </div>

        {/* Global Integrity Badge */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-[#1e1e1e] p-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Icon name="shieldCheck" className="h-4 w-4" />
            <span>MERKLE ROOT INTEGRITY: 100%</span>
          </div>
          <p className="text-[10px] text-[#71717a] mt-1 font-medium">
            Chain Height: 8 Blocks · Zero Tampering Detected
          </p>
        </div>
      </div>

      {/* ── Filter Strip ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-[#71717a] mr-2 font-bold">Filter Provenance:</span>
        {['all', 'capture', 'ai', 'human', 'system'].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-4 py-1.5 font-mono text-xs font-semibold uppercase transition-colors border ${
              filter === k
                ? 'bg-[#00c2ff] text-black border-[#00c2ff]'
                : 'bg-[#141414] text-[#a1a1aa] border-[#262626] hover:border-white hover:text-white'
            }`}
          >
            {k === 'all' ? 'All Events (8)' : k}
          </button>
        ))}
      </div>

      {/* ── Block-by-Block Audit Chain ──────────────────────────────── */}
      <div className="relative border-l-2 border-[#1e1e1e] ml-4 space-y-6 pl-6 py-2">
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
              transition={{ delay: idx * 0.04 }}
              className="relative rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-6"
            >
              {/* Chain Node Marker */}
              <div className="absolute -left-[31px] top-7 flex h-4 w-4 items-center justify-center rounded-full bg-black border-2 border-[#00c2ff]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00c2ff]" />
              </div>

              {/* Event Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e1e1e] pb-4">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <h3 className="font-mono text-sm font-bold text-white">{event.action}</h3>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-[#71717a] font-medium">{event.at}</span>
                </div>
              </div>

              {/* Event Details */}
              <div className="mt-4 space-y-3 font-mono text-xs">
                <p className="text-neutral-300 leading-relaxed font-sans text-sm">{event.detail}</p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1e1e1e] text-xs text-[#71717a]">
                  <div className="flex items-center gap-2">
                    <span>Authorized Actor:</span>
                    <span className="text-white font-bold">{event.actor}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#71717a]">Hash:</span>
                    <span className="rounded bg-black px-2 py-0.5 font-mono text-[11px] text-[#00c2ff] font-bold border border-[#1e1e1e]">
                      {event.hash}
                    </span>
                    <button
                      onClick={() => handleVerify(event.hash)}
                      className="text-xs font-bold text-[#00c2ff] hover:underline"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] p-6 shadow-2xl text-white"
          >
            <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
              <Icon name="shieldCheck" className="h-5 w-5 text-emerald-400" />
              <span>CRYPTOGRAPHIC INTEGRITY CONFIRMED</span>
            </div>

            <div className="mt-4 rounded-xl bg-black p-4 border border-[#1e1e1e] font-mono text-xs space-y-2">
              <p className="text-[#71717a] font-bold">Block Hash:</p>
              <p className="text-[#00c2ff] break-all font-bold">{verifiedHash}</p>
              <div className="pt-3 border-t border-[#1e1e1e] text-[11px] text-neutral-300 space-y-1">
                <p>✓ Signature algorithm: RSA-4096 / SHA-256</p>
                <p>✓ Timestamp Authority: KMRL Transit CA #1</p>
                <p>✓ Immutable Status: VALID</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setVerifiedHash(null)}
                className="rounded-full bg-[#00c2ff] px-5 py-2 font-mono text-xs font-bold text-black hover:bg-[#2ed2ff]"
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
