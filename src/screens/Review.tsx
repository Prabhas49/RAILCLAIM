import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { CLAIM_FIELDS, TRANSCRIPT, getScenario } from '../data/mock'
import { openPrintableVoucher } from '../components/OemPdfVoucher'
import type { ClaimField } from '../types'

export default function Review({ onContinue }: { onContinue: () => void }) {
  const [fields, setFields] = useState<ClaimField[]>(CLAIM_FIELDS)
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set(['asset_id', 'depot_code', 'running_hours']))
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'nameplate' | 'hmi' | 'transcript'>('nameplate')
  const [focusedFieldId, setFocusedFieldId] = useState<string>('serial_no')

  const toggleConfirm = (id: string) => {
    setConfirmedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const confirmAll = () => {
    setConfirmedIds(new Set(fields.map((f) => f.id)))
  }

  const updateFieldValue = (id: string, val: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value: val } : f)))
  }

  const confirmedCount = confirmedIds.size
  const totalCount = fields.length

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 text-white">
      {/* ── Workbench Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00c2ff] shadow-[0_0_8px_#00c2ff]" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">
              Human-in-the-Loop Triage // Claim CLM-2481 · Mitsubishi MELCO-WS
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white tracking-tight">
            Claim Parameter Verification
          </h1>
          <p className="font-mono text-xs text-[#a1a1aa] mt-1">
            Validate computer vision OCR extractions against raw depot evidence before bilateral OEM transmission
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openPrintableVoucher(getScenario('1'))}
            className="rounded-full bg-[#00c2ff] px-4 py-2 font-mono text-xs font-bold text-black hover:bg-[#3cd3ff] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>⎙ Download OEM Warranty PDF</span>
          </button>

          <div className="font-mono text-xs text-right">
            <span className="text-[#a1a1aa]">Sign-Off:</span>
            <span className="ml-2 font-bold text-white">
              {confirmedCount}/{totalCount}
            </span>
          </div>
          <button
            onClick={confirmAll}
            className="rounded-full border border-[#262626] bg-[#141414] px-4 py-2 font-mono text-xs font-bold text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            Sign Off All
          </button>
        </div>
      </div>

      {/* ── Dual-Pane Verification Workspace ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Pane: Raw Multi-Modal Evidence ───────────────────── */}
        <div className="lg:col-span-5 rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
            <span className="font-mono text-xs font-bold uppercase text-white">
              Raw Depot Evidence Bay
            </span>
            <span className="font-mono text-[10px] text-[#71717a] font-semibold">MULTI-SPECTRAL PROVENANCE</span>
          </div>

          {/* Evidence Selector Tabs */}
          <div className="flex rounded-full bg-black border border-[#1e1e1e] p-1 font-mono text-xs">
            <button
              onClick={() => setActiveEvidenceTab('nameplate')}
              className={`flex-1 rounded-full py-2 font-bold transition-colors ${
                activeEvidenceTab === 'nameplate' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Nameplate OCR
            </button>
            <button
              onClick={() => setActiveEvidenceTab('hmi')}
              className={`flex-1 rounded-full py-2 font-bold transition-colors ${
                activeEvidenceTab === 'hmi' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              HMI Fault Code
            </button>
            <button
              onClick={() => setActiveEvidenceTab('transcript')}
              className={`flex-1 rounded-full py-2 font-bold transition-colors ${
                activeEvidenceTab === 'transcript' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Voice Transcript
            </button>
          </div>

          {/* Evidence Viewer Display */}
          <div className="rounded-xl bg-black border border-[#1e1e1e] p-5 min-h-[360px] flex flex-col justify-between">
            {activeEvidenceTab === 'nameplate' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white font-bold uppercase">Nameplate Bounding Box Loupe</span>
                  <span className="text-[#00c2ff] font-bold">91.4% Confidence</span>
                </div>

                {/* Nameplate Canvas */}
                <div className="relative aspect-video w-full rounded-xl bg-[#0a0a0a] border border-[#1e1e1e] flex flex-col items-center justify-center p-4">
                  <div className="w-full border-2 border-dashed border-[#00c2ff]/60 bg-black p-4 rounded-lg text-center">
                    <p className="font-mono text-[10px] text-[#71717a] uppercase tracking-widest font-bold">
                      BOUNDING BOX: [X:12 Y:34 W:54 H:13]
                    </p>
                    <p className="font-mono text-xl font-extrabold text-[#00c2ff] tracking-wider mt-1">
                      MB5085-2274-K
                    </p>
                    <p className="font-mono text-xs text-[#a1a1aa] mt-1">
                      MITSUBISHI ELECTRIC CORP · KOBE WORKS
                    </p>
                  </div>
                  <p className="font-mono text-[10px] text-[#71717a] mt-3 font-semibold">
                    Stator Core Mfg: 2023-03 · JIS E 4041 Approved
                  </p>
                </div>

                <div className="rounded-xl bg-[#0a0a0a] p-4 border border-[#1e1e1e] text-xs font-mono space-y-1">
                  <p className="text-[#71717a] font-bold">Inspector Verification Note:</p>
                  <p className="text-neutral-200">
                    Serial matches Traction Motor Bogie #2 on Kochi Metro 3-car rake CS-10.
                  </p>
                </div>
              </div>
            )}

            {activeEvidenceTab === 'hmi' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white font-bold uppercase">Cab HMI Diagnostic Screen</span>
                  <span className="text-emerald-400 font-bold">94.1% Confidence</span>
                </div>

                <div className="relative aspect-video w-full rounded-xl bg-[#0a0a0a] border border-[#1e1e1e] flex flex-col items-center justify-center p-4">
                  <div className="w-full border-2 border-dashed border-rose-500/60 bg-black p-4 rounded-lg text-center">
                    <p className="font-mono text-[10px] text-[#71717a] uppercase tracking-widest font-bold">
                      HMI FAULT TELEMETRY
                    </p>
                    <p className="font-mono text-3xl font-extrabold text-amber-400 mt-1">
                      E-042
                    </p>
                    <p className="font-mono text-xs text-neutral-300 mt-1 font-semibold">
                      STATOR TEMP: 145°C · PEAK CURRENT EXCEEDED
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#0a0a0a] p-4 border border-[#1e1e1e] text-xs font-mono space-y-1">
                  <p className="text-[#71717a] font-bold">Schema Resolution Rule:</p>
                  <p className="text-neutral-200">
                    Diagnostic code E-042 mapped to Mitsubishi Master Taxonomy code <span className="font-bold text-white">F042</span>.
                  </p>
                </div>
              </div>
            )}

            {activeEvidenceTab === 'transcript' && (
              <div className="space-y-3 font-mono text-xs">
                <span className="text-white font-bold uppercase">Crew Voice Note Transcript</span>
                <div className="space-y-3">
                  {TRANSCRIPT.map((line) => (
                    <div key={line.id} className="rounded-xl bg-[#0a0a0a] p-3.5 border border-[#1e1e1e]">
                      <p className="text-xs text-[#71717a] italic font-sans">{line.source}</p>
                      <p className="text-xs text-white font-bold mt-1.5">{line.translation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#1e1e1e] text-[10px] font-mono text-[#71717a] flex justify-between">
              <span>Depot Bay 4 · Optical Camera Sensor #2</span>
              <span className="font-bold text-emerald-400">SHA-256 Hash Verified ✓</span>
            </div>
          </div>
        </div>

        {/* ── Right Pane: Normalized Schema Editor ───────────────────── */}
        <div className="lg:col-span-7 rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
            <div>
              <span className="font-mono text-xs font-bold uppercase text-white">
                Normalized MELCO-WS Schema Fields
              </span>
              <p className="font-mono text-[10px] text-[#71717a] font-semibold">
                Fields strictly required by Mitsubishi Electric supplier portal
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">JIS-D-4201 COMPLIANT</span>
          </div>

          <div className="space-y-4">
            {fields.map((field) => {
              const isConfirmed = confirmedIds.has(field.id)
              const isFocused = focusedFieldId === field.id

              return (
                <div
                  key={field.id}
                  onClick={() => setFocusedFieldId(field.id)}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    isFocused
                      ? 'border-[#00c2ff] bg-black shadow-sm'
                      : 'border-[#1e1e1e] bg-black/60 hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                          {field.label}
                        </span>
                        {field.oemRequired && (
                          <span className="rounded bg-[#292010] text-[#FFB703] border border-[#FFB703]/30 px-2 py-0.5 font-mono text-[9px] font-bold">
                            MANDATORY
                          </span>
                        )}
                        <span className="rounded bg-[#141414] border border-[#262626] px-2 py-0.5 font-mono text-[9px] text-[#a1a1aa] font-semibold">
                          SOURCE: {field.source.toUpperCase()}
                        </span>
                      </div>

                      {/* Input field */}
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className="mt-2 w-full rounded-lg bg-[#0a0a0a] border border-[#262626] px-3.5 py-2 font-mono text-sm font-bold text-white outline-none focus:border-[#00c2ff] transition-colors"
                      />

                      {field.note && (
                        <p className="mt-1.5 text-xs font-mono text-[#a1a1aa]">
                          {field.note}
                        </p>
                      )}
                    </div>

                    {/* Right side: Confidence & Confirmation Toggle */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-3">
                      <div className="text-right font-mono">
                        <span className="text-xs font-extrabold text-white">
                          {Math.round(field.confidence * 100)}%
                        </span>
                        <p className="text-[9px] text-[#71717a] font-bold">CONFIDENCE</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleConfirm(field.id)
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all ${
                          isConfirmed
                            ? 'bg-[#00c2ff] text-black'
                            : 'bg-[#141414] text-neutral-500 border border-[#262626] hover:border-[#00c2ff] hover:text-white'
                        }`}
                        title="Sign off parameter"
                      >
                        {isConfirmed ? '✓' : ''}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Action */}
          <div className="pt-6 border-t border-[#1e1e1e] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs text-[#a1a1aa]">
              Inspector: Pragna Rao (Chief Rolling Stock Division)
            </span>

            <button
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#00c2ff] px-8 py-3.5 font-mono text-xs font-bold text-black hover:bg-[#2ed2ff] transition-all shadow-sm active:scale-[0.98]"
            >
              <span>CONTINUE TO TRANSMISSION</span>
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
