import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface TransmissionPayload {
  claimId: string
  oem: string
  equipment: string
  amountInr: number
  onFinish: () => void
  onClose?: () => void
}

const LOG_LINES = [
  '› Establishing secure channel to supplier portal…',
  '› TLS 1.3 handshake OK · endpoint .rail.jp:443',
  '› Packaging claim dossier (PDF + evidence hashes)…',
  '› SHA-256 chain of custody verified ✓',
  '› Digitally signing as Chief Rolling Stock Engineer…',
  '› Claim encrypted · AES-256-GCM ✓',
  '› Uplink: KOCHI DEPOT (IN) → INTELSAT-39…',
  '› Downlink: TOKYO OEM HQ (JP) …',
  '› Transmission complete · latency 128ms',
  '✓ AWAITING OEM ACKNOWLEDGEMENT…',
]

/**
 * Cinematic dispatch overlay: the claim visibly travels Kochi → Tokyo on an
 * animated great-circle arc while a transmission log streams beneath it.
 * Pure theater — no backend.
 */
export default function OemTransmissionOverlay({
  payload,
}: {
  payload: TransmissionPayload | null
}) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!payload) return
    setVisibleLines(0)
    setDone(false)
    const timers: number[] = []
    LOG_LINES.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setVisibleLines(i + 1), 350 + i * 420),
      )
    })
    timers.push(
      window.setTimeout(() => setDone(true), 350 + LOG_LINES.length * 420 + 600),
    )
    return () => timers.forEach(clearTimeout)
  }, [payload])

  return (
    <AnimatePresence>
      {payload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          data-no-invert
        >
          <motion.div
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="w-full max-w-3xl rounded-2xl border border-[#FFFFFF]/20 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#06D6A0]">
                  Secure OEM transmission channel
                </p>
                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-white">
                  {payload.claimId} → {payload.oem}
                </h2>
              </div>
              <span className="rounded-full bg-[#0C271E] border border-[#06D6A0]/30 px-3 py-1 font-mono text-[10px] font-bold text-[#06D6A0]">
                ₹{payload.amountInr.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Map arc: Kochi → Tokyo */}
            <div className="relative mt-5 h-56 sm:h-64 overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#050a14]">
              {/* Grid */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                {[...Array(12)].map((_, i) => (
                  <line key={'v' + i} x1={i * 50} y1="0" x2={i * 50} y2="240" stroke="#0f1a2a" strokeWidth="1" />
                ))}
                {[...Array(6)].map((_, i) => (
                  <line key={'h' + i} x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="#0f1a2a" strokeWidth="1" />
                ))}
                {/* Arc path */}
                <motion.path
                  d="M 80 190 Q 300 20 520 60"
                  fill="none"
                  stroke="#06D6A0"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0, opacity: 0.4 }}
                  animate={{ pathLength: done ? 1 : 0.15 + visibleLines * 0.09, opacity: 0.7 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Travelling packet */}
                {!done && (
                  <motion.circle
                    r="5"
                    fill="#06D6A0"
                    animate={{
                      offsetDistance: ['0%', '100%'],
                    }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }}
                    style={{
                      offsetPath: 'path("M 80 190 Q 300 20 520 60")',
                    }}
                  />
                )}
              </svg>

              {/* Kochi node */}
              <div className="absolute bottom-8 left-[10%] flex flex-col items-center">
                <span className="h-3 w-3 animate-pulse rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                <span className="mt-1 font-mono text-[9px] font-bold text-white">KOCHI · IN</span>
              </div>
              {/* Tokyo node */}
              <div className="absolute right-[9%] top-[16%] flex flex-col items-center">
                <motion.span
                  animate={done ? { scale: [1, 1.5, 1] } : {}}
                  className={`h-3 w-3 rounded-full ${done ? 'bg-[#06D6A0]' : 'bg-[#f59e0b] animate-pulse'} shadow-[0_0_12px_rgba(6,214,160,0.8)]`}
                />
                <span className="mt-1 font-mono text-[9px] font-bold text-white">TOKYO · JP</span>
              </div>

              {/* Status stamp */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ scale: 2.2, opacity: 0, rotate: -14 }}
                    animate={{ scale: 1, opacity: 1, rotate: -8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="rounded-lg border-4 border-[#06D6A0] px-6 py-2 font-mono text-xl font-black uppercase tracking-widest text-[#06D6A0]">
                      Transmitted ✓
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Streaming log */}
            <div className="mt-4 h-40 overflow-hidden rounded-xl border border-[#1e1e1e] bg-black p-4 font-mono text-[11px] leading-relaxed">
              {LOG_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={line.startsWith('✓') ? 'font-bold text-[#06D6A0]' : 'text-[#a1a1aa]'}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-3">
              {!done ? (
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#71717a]">
                  Transmitting… please hold
                </span>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={payload.onFinish}
                  className="rounded-xl bg-white px-6 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-200"
                >
                  Claim filed — continue →
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
