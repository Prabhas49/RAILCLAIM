import { useState, useId } from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconName } from '../components/ui/Icon'
import { OEMS } from '../data/mock'
import type { ViewId } from '../types'

export default function Landing({ onEnter }: { onEnter: (v: ViewId) => void }) {
  // ROI Calculator State
  const [fleetSize, setFleetSize] = useState<number>(75)
  const [monthlyFailures, setMonthlyFailures] = useState<number>(14)
  const [avgClaimInr, setAvgClaimInr] = useState<number>(450000)
  const fleetId = useId()
  const failuresId = useId()
  const claimId = useId()

  // Calculations
  const annualTotalClaimsInr = monthlyFailures * 12 * avgClaimInr
  const manualRecoveryInr = annualTotalClaimsInr * 0.42
  const automatedRecoveryInr = annualTotalClaimsInr * 0.86
  const annualUnlockedCapitalInr = automatedRecoveryInr - manualRecoveryInr

  // Selected OEM for schema viewer
  const [selectedOem, setSelectedOem] = useState<'mitsubishi' | 'hitachi' | 'kawasaki'>('mitsubishi')

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-black selection:text-white">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              <Icon name="train" className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-black">HASHI SETHU</span>
              <span className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-neutral-600">
                橋・सेतु
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-600">
            <a href="#pipeline" className="hover:text-black transition-colors">Architecture</a>
            <a href="#oem-schemas" className="hover:text-black transition-colors">OEM Schemas</a>
            <a href="#roi-calculator" className="hover:text-black transition-colors">Recovery Model</a>
            <a href="#live-queue" className="hover:text-black transition-colors">Depot Telemetry</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEnter('dashboard')}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-neutral-800"
            >
              <span>Operations Console</span>
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Huge Spacing & Clean Typography) ──────────── */}
      <section className="px-6 pt-40 pb-28 md:pt-48 md:pb-36">
        <div className="mx-auto max-w-5xl text-center">
          {/* Minimal Status Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-mono text-neutral-600"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span>FIELD PILOT // KOCHI · CHENNAI · MUMBAI METRO LINES</span>
          </motion.div>

          {/* Huge Bold Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 font-display text-5xl font-extrabold tracking-tight text-black sm:text-7xl lg:text-8xl leading-[1.05]"
          >
            Autonomous warranty recovery for rail networks.
          </motion.h1>

          {/* Generous Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-8 max-w-3xl text-lg sm:text-xl leading-relaxed text-neutral-600"
          >
            Turn raw depot telemetry, multilingual maintenance audio, and nameplate photos into formal, schema-compliant warranty claims for Japanese rolling stock suppliers in under 15 seconds.
          </motion.p>

          {/* Clean High-Contrast Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => onEnter('capture')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-neutral-800"
            >
              <Icon name="mic" className="h-4 w-4" />
              <span>Simulate Field Capture</span>
            </button>

            <button
              onClick={() => onEnter('pipeline')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-neutral-50"
            >
              <Icon name="cpu" className="h-4 w-4" />
              <span>Inspect Neural Pipeline</span>
            </button>
          </motion.div>

          {/* ── High-Contrast Clean Voucher Preview ─────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-20 max-w-4xl text-left"
          >
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-neutral-700">
                    DISPATCH VOUCHER // CLM-2481
                  </span>
                  <span className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-[10px] font-bold text-neutral-700">
                    MITSUBISHI MELCO-WS PROTOCOL
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    VERIFIED COMPLIANT
                  </span>
                </div>
              </div>

              {/* Voucher Content Grid */}
              <div className="p-8 grid gap-8 md:grid-cols-12">
                <div className="md:col-span-8 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-500">
                      <span>EQUIPMENT REF:</span>
                      <span className="text-black">RS-10-KM-0421</span>
                    </div>
                    <h2 className="text-2xl font-bold text-black mt-1">Traction Motor Unit · MB-5085-A</h2>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                      Kochi Metro · Muttom Depot Bay #4 · 18,420 Operating Hours
                    </p>
                  </div>

                  {/* High-Contrast Telemetry Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
                      <p className="font-mono text-[10px] text-neutral-500 uppercase font-semibold">Failure Code</p>
                      <p className="font-mono text-xl font-bold text-black mt-1">F042</p>
                      <p className="text-[11px] text-neutral-600 font-mono mt-0.5">Mapped from E-042</p>
                    </div>
                    <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
                      <p className="font-mono text-[10px] text-neutral-500 uppercase font-semibold">Recoverable Sum</p>
                      <p className="font-mono text-xl font-bold text-black mt-1">₹4,82,400</p>
                      <p className="text-[11px] text-neutral-600 font-mono mt-0.5">¥872,000 equivalent</p>
                    </div>
                    <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
                      <p className="font-mono text-[10px] text-neutral-500 uppercase font-semibold">Confidence</p>
                      <p className="font-mono text-xl font-bold text-emerald-600 mt-1">94.8%</p>
                      <p className="text-[11px] text-neutral-600 font-mono mt-0.5">Dual-source validated</p>
                    </div>
                  </div>

                  {/* Multi-modal Evidence Trace */}
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                      <span>VOICE TELEMETRY PROVENANCE (TAMIL VERNACULAR)</span>
                      <span className="text-emerald-600 font-semibold">ASR CONFIDENCE: 96%</span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-700 italic">
                      "டிராக்ஷன் மோட்டார் அதிக சூடாகிறது, IGBT பால்ட் கோட் E-042 காட்டுகிறது..."
                    </p>
                    <p className="mt-1.5 font-mono text-xs text-black font-medium">
                      Standardized translation: "Traction motor thermal overload detected; IGBT fault code E-042 logged twice at 145°C."
                    </p>
                  </div>
                </div>

                {/* Right: Validation & OEM Specs */}
                <div className="md:col-span-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-200 pt-6 md:pt-0 md:pl-8 space-y-6">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-neutral-500">Target OEM Portal</span>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center font-mono font-bold text-white text-xs">
                        M
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">Mitsubishi Electric</p>
                        <p className="font-mono text-xs text-neutral-500">MELCO-WS Portal</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs border-y border-neutral-200 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Warranty Expiry</span>
                      <span className="font-bold text-black">2027-03-14</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">SLA Dispute Limit</span>
                      <span className="font-bold text-black">30 Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Serial OCR Match</span>
                      <span className="font-bold text-black">MB5085-2274-K</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onEnter('review')}
                    className="w-full rounded-full bg-black py-3 text-center font-mono text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                  >
                    Open Live Review Screen →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Key Performance Figures (Clean High Contrast) ───────────── */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="border-l-2 border-black pl-5">
              <p className="font-mono text-4xl sm:text-5xl font-extrabold text-black">₹14.2L</p>
              <p className="text-xs font-bold text-neutral-800 mt-2 uppercase tracking-wide">Recovered This Month</p>
              <p className="font-mono text-xs text-neutral-500 mt-1">Kochi Depot · 92% recovery rate</p>
            </div>
            <div className="border-l-2 border-black pl-5">
              <p className="font-mono text-4xl sm:text-5xl font-extrabold text-black">12.4s</p>
              <p className="text-xs font-bold text-neutral-800 mt-2 uppercase tracking-wide">Mean Compilation Time</p>
              <p className="font-mono text-xs text-neutral-500 mt-1">Voice + 3 photos to XML voucher</p>
            </div>
            <div className="border-l-2 border-black pl-5">
              <p className="font-mono text-4xl sm:text-5xl font-extrabold text-black">0.0%</p>
              <p className="text-xs font-bold text-neutral-800 mt-2 uppercase tracking-wide">Desk Rejection Rate</p>
              <p className="font-mono text-xs text-neutral-500 mt-1">Pre-submission rule validation</p>
            </div>
            <div className="border-l-2 border-black pl-5">
              <p className="font-mono text-4xl sm:text-5xl font-extrabold text-black">100%</p>
              <p className="text-xs font-bold text-neutral-800 mt-2 uppercase tracking-wide">Cryptographic Traceability</p>
              <p className="font-mono text-xs text-neutral-500 mt-1">SHA-256 tamper-evident chain</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OEM Compatibility & Schema Matrix ──────────────────────── */}
      <section id="oem-schemas" className="py-32 px-6 mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">
            Multi-OEM Interoperability
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-black tracking-tight">
            Native Japanese Rolling Stock Protocols
          </h2>
          <p className="mt-4 text-base text-neutral-600">
            Eliminate cross-border formatting rejections. Hashi Sethu dynamically compiles claims into the native EDI and REST schemas mandated by Japan's tier-1 rolling stock manufacturers.
          </p>
        </div>

        {/* OEM Selector Tabs */}
        <div className="mt-12 flex justify-center gap-3">
          {OEMS.map((oem) => (
            <button
              key={oem.id}
              onClick={() => setSelectedOem(oem.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all border ${
                selectedOem === oem.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
              }`}
            >
              <span>{oem.name}</span>
              <span className="font-mono text-[10px] opacity-75">({oem.portal})</span>
            </button>
          ))}
        </div>

        {/* Schema Comparison Terminal */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-black">
              <Icon name="terminal" className="h-4 w-4 text-neutral-700" />
              <span>SCHEMA COMPILATION // {selectedOem.toUpperCase()} SPECIFICATION</span>
            </div>
            <span className="font-mono text-xs text-neutral-500 font-semibold">
              CONTRACTUAL SLA: {OEMS.find((o) => o.id === selectedOem)?.slaDays} DAYS
            </span>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 p-6 gap-6">
            <div>
              <p className="font-mono text-xs font-bold uppercase text-black mb-4">
                Mandatory OEM Portal Parameters
              </p>
              <div className="space-y-2.5">
                {OEMS.find((o) => o.id === selectedOem)?.requiredFields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 text-xs border border-neutral-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon name="check" className="h-3.5 w-3.5 text-black" />
                      <span className="font-mono font-semibold text-black">{field}</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500">
                      Auto-extracted via {field.includes('photo') ? 'Vision OCR' : field.includes('failure') ? 'NLP Taxonomy' : 'Asset Telemetry'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-mono text-xs font-bold uppercase text-black mb-4">
                Live Compiled XML/JSON Payload
              </p>
              <pre className="rounded-xl bg-neutral-900 p-4 font-mono text-xs text-neutral-200 leading-relaxed overflow-x-auto">
                {selectedOem === 'mitsubishi'
                  ? `<?xml version="1.0" encoding="UTF-8"?>
<MELCO_CLAIM_V3>
  <DEPOT_CODE>MUTTOM_BAY4</DEPOT_CODE>
  <CAR_EQP_ID>RS-10-KM-0421</CAR_EQP_ID>
  <SER_NO>MB5085-2274-K</SER_NO>
  <FAIL_CD>F042</FAIL_CD>
  <FAIL_DESC>thermal_overload_145C</FAIL_DESC>
  <LBR_OP>REPLACE_STATOR_CORE</LBR_OP>
  <CLAIM_VAL_INR>482400</CLAIM_VAL_INR>
  <DIGITAL_SIGNATURE>sha256:7f4c9a...</DIGITAL_SIGNATURE>
</MELCO_CLAIM_V3>`
                  : selectedOem === 'hitachi'
                  ? `{
  "HiWarrantyPayload": {
    "DepotCode": "MUTTOM_BAY4",
    "AssetRef": "RS-10-KM-0421",
    "SerialNumber": "MB5085-2274-K",
    "FaultCode": "F042",
    "LabourOperation": "REPLACE_STATOR_CORE",
    "OperatingHours": 18420,
    "SymptomCategory": "thermal_overload",
    "JIS_StandardRef": "JIS-E-4001"
  }
}`
                  : `{
  "khi_after_sales": {
    "equipment_id": "RS-10-KM-0421",
    "part_serial": "MB5085-2274-K",
    "fault_code": "F042",
    "labor_code": "REPLACE_STATOR_CORE",
    "warranty_proof": "VALIDATED_ONLINE",
    "dispute_window_days": 45
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sub-15s Neural Architecture ─────────────────────────────── */}
      <section id="pipeline" className="border-t border-neutral-200 bg-neutral-50 py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">
              Autonomous Verification Engine
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-black tracking-tight">
              The 6-Stage Sub-15 Second Pipeline
            </h2>
            <p className="mt-4 text-base text-neutral-600">
              Transforming raw depot reports into audit-grade vouchers before maintenance crews return to the control room.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Rail-Jargon Acoustic ASR',
                desc: 'Fine-tuned speech recognition for Tamil, Hindi, Marathi, Bengali, and English railway terminology with 94%+ term retention.',
                tag: 'Bilingual Telemetry',
                icon: 'mic',
              },
              {
                step: '02',
                title: 'JIS Terminology Standardizer',
                desc: 'Maps regional depot slang and vernacular descriptions directly onto formal Japanese Industrial Standards (JIS E 4001 / 4041).',
                tag: 'JIS-Standard Mapping',
                icon: 'translate',
              },
              {
                step: '03',
                title: 'Multi-Spectral OCR Inspection',
                desc: 'Extracts alphanumeric serial plates and HMI diagnostic codes under poor depot lighting with geometric confidence bounding boxes.',
                tag: 'Computer Vision OCR',
                icon: 'scan',
              },
              {
                step: '04',
                title: 'Fault Taxonomy Normalizer',
                desc: 'Resolves component fault symptoms directly into supplier catalog failure classifications (e.g., E-042 → Mitsubishi F042).',
                tag: 'Taxonomy Resolution',
                icon: 'database',
              },
              {
                step: '05',
                title: 'Portal Schema Transpiler',
                desc: 'Transpiles claim parameters into precise EDIFACT, XML, and JSON payloads conforming to MELCO-WS, HiWarranty, and KHI portals.',
                tag: 'Zero-Rejection Formatting',
                icon: 'code',
              },
              {
                step: '06',
                title: 'Cryptographic Proof Hash',
                desc: 'Generates immutable SHA-256 hash chains linking raw audio recordings, photos, and inspector approvals to resolve future disputes.',
                tag: 'ISO/IEC 27001 Ready',
                icon: 'shieldCheck',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card hover:border-black transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
                    <Icon name={s.icon as IconName} className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-400">{s.step}</span>
                </div>
                <h3 className="mt-5 text-base font-bold text-black">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">{s.desc}</p>
                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-500 font-semibold uppercase">{s.tag}</span>
                  <Icon name="check" className="h-3.5 w-3.5 text-black" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive ROI Recovery Calculator ─────────────────────── */}
      <section id="roi-calculator" className="py-32 px-6 mx-auto max-w-6xl">
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-card p-8 sm:p-14">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Controls */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">
                  Financial Impact Model
                </p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-black tracking-tight">
                  Estimate Unlocked Capital Recovery
                </h2>
                <p className="mt-3 text-sm text-neutral-600">
                  Calculate annual warranty revenue returned to your transit authority by eliminating expired SLA windows and untracked paperwork.
                </p>
              </div>

              {/* Slider 1 */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <label htmlFor={fleetId} className="font-bold text-black">Fleet Size (Carriages)</label>
                  <span className="font-bold text-black">{fleetSize} Cars</span>
                </div>
                <input
                  id={fleetId}
                  type="range"
                  min="20"
                  max="300"
                  step="5"
                  value={fleetSize}
                  onChange={(e) => setFleetSize(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg"
                />
              </div>

              {/* Slider 2 */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <label htmlFor={failuresId} className="font-bold text-black">Monthly Warranty Incidents</label>
                  <span className="font-bold text-black">{monthlyFailures} Failures/mo</span>
                </div>
                <input
                  id={failuresId}
                  type="range"
                  min="2"
                  max="40"
                  step="1"
                  value={monthlyFailures}
                  onChange={(e) => setMonthlyFailures(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg"
                />
              </div>

              {/* Slider 3 */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <label htmlFor={claimId} className="font-bold text-black">Average Claim Value (INR)</label>
                  <span className="font-bold text-black">₹{(avgClaimInr / 100000).toFixed(1)} Lakhs</span>
                </div>
                <input
                  id={claimId}
                  type="range"
                  min="100000"
                  max="1500000"
                  step="50000"
                  value={avgClaimInr}
                  onChange={(e) => setAvgClaimInr(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg"
                />
              </div>
            </div>

            {/* ROI Results Card */}
            <div className="lg:col-span-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 sm:p-10 text-center sm:text-left">
              <span className="inline-block rounded-full bg-black px-3 py-1 font-mono text-xs font-semibold text-white">
                ANNUAL RECOVERY DELTA
              </span>

              <div className="mt-6">
                <p className="font-mono text-5xl sm:text-6xl font-extrabold text-black">
                  ₹{(annualUnlockedCapitalInr / 100000).toFixed(2)} Lakhs
                </p>
                <p className="mt-2 text-sm text-neutral-600 font-mono">
                  Additional revenue recovered from Japanese OEMs per year
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-neutral-200 pt-8 text-left">
                <div>
                  <p className="font-mono text-xs uppercase text-neutral-500 font-bold">Manual Email Disputes</p>
                  <p className="font-mono text-2xl font-bold text-neutral-700 mt-1">₹{(manualRecoveryInr / 100000).toFixed(1)}L</p>
                  <p className="text-xs text-neutral-500 font-mono mt-1">42% historical capture</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase text-neutral-500 font-bold">Hashi Sethu Automated</p>
                  <p className="font-mono text-2xl font-bold text-black mt-1">₹{(automatedRecoveryInr / 100000).toFixed(1)}L</p>
                  <p className="text-xs text-emerald-600 font-mono font-bold mt-1">86% verified capture</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-neutral-600 font-mono font-bold">Payback Period: &lt; 2 Weeks</span>
                <button
                  onClick={() => onEnter('dashboard')}
                  className="w-full sm:w-auto rounded-full bg-black px-6 py-3 font-mono text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                >
                  Deploy Pilot Depot →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Authority Verification Quote ────────────────────────────── */}
      <section className="py-28 px-6 mx-auto max-w-4xl text-center">
        <div className="border border-neutral-200 rounded-3xl bg-white p-10 sm:p-14 shadow-card">
          <p className="font-display text-2xl sm:text-3xl text-black leading-relaxed font-bold">
            "Previously, filing rolling stock warranty claims required bilateral translations, manual part catalogs, and weeks of email threads between Kochi depot engineers and Kobe suppliers. Hashi Sethu generates verified, compliant vouchers before the train even returns to passenger service."
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-full bg-black font-mono font-bold text-white flex items-center justify-center text-sm">
              SI
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-black">S. Iyer</p>
              <p className="font-mono text-xs text-neutral-500">Chief Rolling Stock Division · Kochi Metro Rail Ltd</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-200 py-12 px-6 bg-white">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-black text-white">
              <Icon name="train" className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-black">HASHI SETHU ENTERPRISE</span>
            <span className="font-mono text-[10px] text-neutral-500">· 橋・सेतु JIS-D-4201 ACCORD</span>
          </div>

          <div className="flex items-center gap-8 font-mono text-xs text-neutral-600">
            <button onClick={() => onEnter('dashboard')} className="hover:text-black transition-colors">
              Console
            </button>
            <button onClick={() => onEnter('capture')} className="hover:text-black transition-colors">
              Field Capture
            </button>
            <button onClick={() => onEnter('audit')} className="hover:text-black transition-colors">
              Cryptographic Ledger
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
