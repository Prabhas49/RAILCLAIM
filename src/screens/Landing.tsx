import { motion } from "framer-motion"
import { CLAIM_QUEUE } from "../data/mock"
import type { ViewId } from "../types"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
})

const FEATURES = [
  { emoji: "🎙️", title: "Rail-jargon voice capture", desc: "Crew records in Tamil, Hindi, Kannada & more. ASR tuned on depot vocabulary, not generic speech.", grad: "from-[#FF8A65] to-[#FFB74D]", tag: "Tamil → English + 日本語" },
  { emoji: "📸", title: "Vision + OCR evidence", desc: "Nameplates, HMI fault codes, install context — serials and readings extracted with confidence scores.", grad: "from-[#7EC8E3] to-[#A78BFA]", tag: "91% OCR confidence" },
  { emoji: "🔀", title: "OEM schema mapper", desc: "One claim, three portals. Fields re-keyed automatically for MELCO-WS, HiWarranty and KHI desks.", grad: "from-[#81C784] to-[#4DB6AC]", tag: "Mitsubishi · Hitachi · Kawasaki" },
  { emoji: "🛡️", title: "Pre-submission compliance", desc: "Warranty windows, labour codes, mandatory attachments — validated before the OEM ever sees it.", grad: "from-[#F48FB1] to-[#CE93D8]", tag: "Zero desk rejections" },
  { emoji: "🔗", title: "Tamper-evident audit trail", desc: "Every capture, AI step and human approval hash-chained. Disputes settled with proof, not email threads.", grad: "from-[#FFD54F] to-[#FF8A65]", tag: "Hash-chained log" },
  { emoji: "⚡", title: "Draft in ~12 seconds", desc: "Six pipeline stages — ASR, translation, OCR, extraction, mapping, compliance — run while the crew walks back.", grad: "from-[#A78BFA] to-[#7EC8E3]", tag: "6 stages · hands-free" },
]

const STEPS = [
  { n: "01", emoji: "🎙️", title: "Capture at the depot", desc: "Voice note + 3 photos. GPS, asset ID, running hours attach automatically." },
  { n: "02", emoji: "✨", title: "AI drafts the claim", desc: "Translation, OCR, entity extraction and OEM re-keying run in seconds." },
  { n: "03", emoji: "🚀", title: "Review & send", desc: "Confirm low-confidence fields, export PDF/JSON, fire it to the OEM portal." },
]

const METRICS = [
  { value: "₹14.2L", label: "recovered this month", sub: "of ₹19.8L claimed" },
  { value: "72%", label: "recovery rate", sub: "up from 41% on email" },
  { value: "~12s", label: "draft turnaround", sub: "vs 3–5 days manually" },
  { value: "0", label: "desk rejections", sub: "compliance pre-checked" },
]

export default function Landing({ onEnter }: { onEnter: (v: ViewId) => void }) {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#2D2A26] overflow-x-clip">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-4 sm:px-6">
          <div className="flex w-full items-center gap-3 rounded-full border border-white/60 bg-white/80 py-2 pl-3 pr-2 shadow-soft backdrop-blur-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-lg">🚇</span>
            <span className="text-[16px] font-bold tracking-tight">RailClaim</span>
            <span className="hidden rounded-full bg-[#FFF3E0] px-2.5 py-1 text-[10px] font-semibold text-[#9A3412] sm:inline">OEM Warranty Automation</span>
            <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-[#8A8580] md:flex">
              <a href="#features" className="transition-colors hover:text-ink">Features</a>
              <a href="#flow" className="transition-colors hover:text-ink">How it works</a>
              <a href="#proof" className="transition-colors hover:text-ink">Results</a>
            </nav>
            <button onClick={() => onEnter("dashboard")} className="ml-auto rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.03] active:scale-[0.98] md:ml-4">
              Open app →
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative px-4 pt-32 sm:px-6 md:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_800px_500px_at_50%_-10%,rgba(249,115,22,0.12),transparent),radial-gradient(ellipse_500px_350px_at_85%_10%,rgba(167,139,250,0.12),transparent),radial-gradient(ellipse_500px_350px_at_10%_20%,rgba(129,199,132,0.1),transparent)]" />
        <div className="mx-auto max-w-6xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F0EBE3] bg-white px-4 py-1.5 text-xs font-semibold text-[#8A8580] shadow-sm">
              <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-[#81C784] opacity-60" /><span className="h-2 w-2 rounded-full bg-[#2E7D32]" /></span>
              Live pilot · Kochi · Chennai · Mumbai metros
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-4xl font-display text-[42px] leading-[1.05] tracking-tight sm:text-6xl md:text-[76px]"
          >
            Warranty claims that <em className="bg-gradient-to-r from-[#FF7043] via-[#EC407A] to-[#7C4DFF] bg-clip-text text-transparent">file themselves.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-5 max-w-2xl text-base text-[#8A8580] sm:text-lg"
          >
            Depot crews speak, snap, and walk away. RailClaim turns voice + photos into OEM-ready warranty claims for Mitsubishi, Hitachi and Kawasaki — in about 12 seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <button onClick={() => onEnter("capture")} className="w-full rounded-full bg-gradient-to-br from-[#FF8A65] to-[#FF7043] px-8 py-4 text-base font-bold text-white shadow-[0_12px_32px_rgba(255,112,67,0.4)] transition-transform hover:scale-[1.03] active:scale-[0.98] sm:w-auto">
              ✨ Capture a claim
            </button>
            <button onClick={() => onEnter("pipeline")} className="w-full rounded-full border border-[#F0EBE3] bg-white px-8 py-4 text-base font-semibold shadow-sm transition-transform hover:scale-[1.03] active:scale-[0.98] sm:w-auto">
              See the magic →
            </button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 text-xs text-[#B0A9A0]">
            No hardware to install · Works on the crew's own phones · Tamil, Hindi, Kannada & more
          </motion.p>

          {/* floating claim card */}
          <div className="relative mx-auto mt-14 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[28px] border border-[#FFF3E0] bg-white p-6 text-left shadow-[0_24px_80px_-16px_rgba(45,42,38,0.25)] sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#FFF3E0] px-3 py-1 text-xs font-bold">CLM-2481</span>
                <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-semibold text-[#2E7D32]">● ready to send</span>
                <span className="ml-auto font-mono text-xs text-[#B0A9A0]">MELCO-WS format ✓</span>
              </div>
              <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="text-xl font-bold sm:text-2xl">Traction Motor · MB-5085-A</p>
                  <p className="mt-1 text-sm text-[#8A8580]">Kochi Metro · Muttom Depot · Mitsubishi Electric</p>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    {[["F042", "Failure"], ["₹4.8L", "Claim"], ["89%", "Confident"]].map(([v, l]) => (
                      <div key={l} className="rounded-2xl bg-[#FFFBF0] p-3"><p className="text-lg font-bold">{v}</p><p className="text-[11px] text-[#B0A9A0]">{l}</p></div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 rounded-3xl bg-gradient-to-br from-[#2D2A26] to-[#4a4440] p-6 text-white sm:w-56">
                  <p className="text-xs uppercase tracking-widest text-white/60">Voice → claim</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/90">"Traction motor overheating… fault code E-042, came up twice."</p>
                  <div className="mt-3 flex items-end gap-1" aria-hidden>{[10, 18, 8, 22, 14, 26, 12, 20, 9, 16, 24, 11].map((h, i) => <span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-[#FF8A65] to-[#A78BFA]" style={{ height: h }} />)}</div>
                  <p className="mt-3 text-[11px] text-white/60">Tamil · transcribed + translated ✓</p>
                </div>
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -right-3 -top-5 rotate-6 rounded-2xl bg-gradient-to-br from-[#81C784] to-[#4DB6AC] px-4 py-2 text-sm font-bold text-white shadow-lg sm:-right-6">₹4.8L recoverable 🎉</motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 0.5 }} className="absolute -left-3 top-1/2 hidden -rotate-6 rounded-2xl bg-white px-4 py-2 text-sm font-semibold shadow-float sm:block">6 stages · 12s ⚡</motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── OEM strip ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#B0A9A0]">Speaks every OEM portal fluently</p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ["Mitsubishi", "MELCO-WS / Supplier Web", "Kobe, Japan 🇯🇵", "from-[#FF8A65] to-[#EC407A]"],
            ["Hitachi", "HiWarranty Portal", "Tokyo, Japan 🇯🇵", "from-[#7EC8E3] to-[#7C4DFF]"],
            ["Kawasaki", "KHI After-Sales Desk", "Kobe, Japan 🇯🇵", "from-[#81C784] to-[#26A69A]"],
          ].map(([name, portal, hq, grad], i) => (
            <motion.div key={name} {...fadeUp(i * 0.08)} className="flex items-center gap-4 rounded-[20px] border border-[#FFF3E0] bg-white p-5 shadow-sm">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-xl font-bold text-white`}>{name[0]}</span>
              <div><p className="font-bold">{name}</p><p className="text-xs text-[#8A8580]">{portal}</p><p className="text-[11px] text-[#B0A9A0]">{hq}</p></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Metrics ─────────────────────────────────────── */}
      <section id="proof" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <motion.div key={m.label} {...fadeUp(i * 0.07)} className="rounded-[24px] bg-[#2D2A26] p-6 text-white shadow-[0_16px_40px_-12px_rgba(45,42,38,0.5)]">
              <p className="bg-gradient-to-r from-[#FFB74D] to-[#F48FB1] bg-clip-text text-4xl font-bold text-transparent">{m.value}</p>
              <p className="mt-2 text-sm font-semibold">{m.label}</p>
              <p className="text-xs text-white/50">{m.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <motion.div {...fadeUp()} className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF7043]">✨ Why depots love it</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">Everything between <em>breakdown</em> and <em>reimbursed</em>, handled.</h2>
          <p className="mx-auto mt-3 max-w-xl text-[#8A8580]">The cross-border paperwork tax — translation, re-keying, compliance — disappears into one friendly flow.</p>
        </motion.div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp((i % 3) * 0.08)} whileHover={{ y: -6 }} className="group rounded-[24px] border border-[#FFF3E0] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
              <div className={`inline-flex rounded-2xl bg-gradient-to-br ${f.grad} px-4 py-3 text-2xl shadow-md transition-transform group-hover:scale-110 group-hover:-rotate-6`}>{f.emoji}</div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-[#B0A9A0]">{f.tag}</p>
              <h3 className="mt-1 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8580]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section id="flow" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <motion.div {...fadeUp()} className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2D2A26] via-[#3d3430] to-[#4a2c3a] p-8 text-white sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB74D]">🚂 How it works</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl tracking-tight sm:text-5xl">Three steps. One minute. Zero paperwork.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} {...fadeUp(i * 0.1)} className="rounded-[24px] bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/15">
                <div className="flex items-center justify-between"><span className="text-3xl">{s.emoji}</span><span className="font-mono text-sm text-white/40">{s.n}</span></div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => onEnter("capture")} className="rounded-full bg-white px-8 py-3.5 font-bold text-[#2D2A26] transition-transform hover:scale-[1.03] active:scale-[0.98]">Try the capture flow ✨</button>
            <button onClick={() => onEnter("audit")} className="rounded-full border border-white/25 px-8 py-3.5 font-semibold text-white/90 transition-colors hover:bg-white/10">See the audit trail</button>
          </div>
        </motion.div>
      </section>

      {/* ── Live queue teaser ───────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <motion.div {...fadeUp()} className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7C4DFF]">📋 Live from the pilot</p>
            <h2 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">Claims moving right now</h2>
          </div>
          <button onClick={() => onEnter("dashboard")} className="rounded-full border border-[#F0EBE3] bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-transform hover:scale-[1.03]">Open dashboard →</button>
        </motion.div>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {CLAIM_QUEUE.slice(0, 5).map((c, i) => (
            <motion.div key={c.id} {...fadeUp(i * 0.06)} className="min-w-[260px] flex-1 rounded-[20px] border border-[#FFF3E0] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between"><span className="rounded-full bg-[#FFF3E0] px-3 py-1 text-xs font-bold">{c.id}</span><span className="text-xs font-medium capitalize text-[#8A8580]">{c.status.replace("_", " ")}</span></div>
              <p className="mt-3 text-sm font-semibold">{c.assetName}</p>
              <p className="text-xs text-[#8A8580]">{c.depot}</p>
              <p className="mt-2 text-lg font-bold">₹{(c.amountInr / 100000).toFixed(1)}L</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Quote ───────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 pt-20 text-center sm:px-6">
        <motion.div {...fadeUp()}>
          <p className="font-display text-3xl italic leading-snug tracking-tight sm:text-4xl">"Earlier a claim meant a week of emails between Kochi and Kobe. Now the crew finishes it before their tea break."</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-400 font-bold text-white">SI</span>
            <div className="text-left"><p className="text-sm font-bold">S. Iyer</p><p className="text-xs text-[#8A8580]">Warranty Admin · Kochi Metro Rail Ltd</p></div>
          </div>
        </motion.div>
      </section>

      {/* ── Final CTA + footer ──────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp()} className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#FF8A65] via-[#FF7043] to-[#EC407A] p-10 text-center text-white shadow-[0_24px_60px_-16px_rgba(255,112,67,0.5)] sm:p-16">
          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: "linear" }} className="pointer-events-none absolute -right-10 -top-10 text-[120px] opacity-20">⚙️</motion.span>
          <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="pointer-events-none absolute -left-4 bottom-6 text-[80px] opacity-20">🚇</motion.span>
          <h2 className="relative font-display text-4xl tracking-tight sm:text-6xl">Stop losing lakhs<br />to paperwork.</h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/85">Join the pilot. First depot onboarded in a day — crews need zero training.</p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => onEnter("capture")} className="w-full rounded-full bg-white px-8 py-4 font-bold text-[#E64A19] shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98] sm:w-auto">Start a claim ✨</button>
            <button onClick={() => onEnter("dashboard")} className="w-full rounded-full border-2 border-white/50 px-8 py-[14px] font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto">Explore the demo</button>
          </div>
        </motion.div>
        <footer className="mt-10 flex flex-col items-center justify-between gap-4 text-xs text-[#B0A9A0] sm:flex-row">
          <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-sm">🚇</span><span className="font-bold text-[#2D2A26]">RailClaim</span><span>· Simulated pipeline. No live OEM connection.</span></div>
          <div className="flex gap-5 font-medium">
            <button onClick={() => onEnter("dashboard")} className="transition-colors hover:text-ink">App</button>
            <button onClick={() => onEnter("audit")} className="transition-colors hover:text-ink">Activity</button>
            <button onClick={() => onEnter("capture")} className="transition-colors hover:text-ink">New claim</button>
          </div>
        </footer>
      </section>
    </div>
  )
}
