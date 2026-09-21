import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { CLAIM_FIELDS, TRANSCRIPT } from '../data/mock'
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
    <div className="mx-auto max-w-6xl space-y-8 pb-16 text-black">
      {/* ── Workbench Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-black" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">
              Human-in-the-Loop Triage // Claim CLM-2481 · Mitsubishi MELCO-WS
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-black tracking-tight">
            Claim Parameter Verification
          </h1>
          <p className="font-mono text-xs text-neutral-500 mt-1">
            Validate computer vision OCR extractions against raw depot evidence before bilateral OEM transmission
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-mono text-xs text-right">
            <span className="text-neutral-500">Sign-Off Progress:</span>
            <span className="ml-2 font-bold text-black">
              {confirmedCount}/{totalCount} Confirmed
            </span>
          </div>
          <button
            onClick={confirmAll}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 font-mono text-xs font-bold text-black hover:bg-neutral-50"
          >
            Sign Off All
          </button>
        </div>
      </div>

      {/* ── Dual-Pane Verification Workspace ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Pane: Raw Multi-Modal Evidence ───────────────────── */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-200 bg-white shadow-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <span className="font-mono text-xs font-bold uppercase text-black">
              Raw Depot Evidence Bay
            </span>
            <span className="font-mono text-[10px] text-neutral-500 font-semibold">MULTI-SPECTRAL PROVENANCE</span>
          </div>

          {/* Evidence Selector Tabs */}
          <div className="flex rounded-full bg-neutral-100 p-1 font-mono text-xs">
            <button
              onClick={() => setActiveEvidenceTab('nameplate')}
              className={`flex-1 rounded-full py-2 font-bold transition-colors ${
                activeEvidenceTab === 'nameplate' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Nameplate OCR
            </button>
            <button
              onClick={() => setActiveEvidenceTab('hmi')}
              className={`flex-1 rounded-full py-2 font-bold transition-colors ${
                activeEvidenceTab === 'hmi' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              HMI Fault Code
            </button>
            <button
              onClick={() => setActiveEvidenceTab('transcript')}
              className={`flex-1 rounded-full py-2 font-bold transition-colors ${
                activeEvidenceTab === 'transcript' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Voice Transcript
            </button>
          </div>

          {/* Evidence Viewer Display */}
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-5 min-h-[360px] flex flex-col justify-between">
            {activeEvidenceTab === 'nameplate' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-black font-bold uppercase">Nameplate Bounding Box Loupe</span>
                  <span className="text-black font-bold">91.4% Confidence</span>
                </div>

                {/* Nameplate Canvas */}
                <div className="relative aspect-video w-full rounded-xl bg-white border border-neutral-200 flex flex-col items-center justify-center p-4">
                  <div className="w-full border-2 border-dashed border-black bg-neutral-50 p-4 rounded-lg text-center">
                    <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                      BOUNDING BOX: [X:12 Y:34 W:54 H:13]
                    </p>
                    <p className="font-mono text-xl font-extrabold text-black tracking-wider mt-1">
                      MB5085-2274-K
                    </p>
                    <p className="font-mono text-xs text-neutral-600 mt-1">
                      MITSUBISHI ELECTRIC CORP · KOBE WORKS
                    </p>
                  </div>
                  <p className="font-mono text-[10px] text-neutral-500 mt-3 font-semibold">
                    Stator Core Mfg: 2023-03 · JIS E 4041 Approved
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4 border border-neutral-200 text-xs font-mono space-y-1">
                  <p className="text-neutral-500 font-bold">Inspector Verification Note:</p>
                  <p className="text-neutral-800">
                    Serial matches Traction Motor Bogie #2 on Kochi Metro 3-car rake CS-10.
                  </p>
                </div>
              </div>
            )}

            {activeEvidenceTab === 'hmi' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-black font-bold uppercase">Cab HMI Diagnostic Screen</span>
                  <span className="text-black font-bold">94.1% Confidence</span>
                </div>

                <div className="relative aspect-video w-full rounded-xl bg-white border border-neutral-200 flex flex-col items-center justify-center p-4">
                  <div className="w-full border-2 border-dashed border-black bg-neutral-50 p-4 rounded-lg text-center">
                    <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                      HMI FAULT TELEMETRY
                    </p>
                    <p className="font-mono text-3xl font-extrabold text-black mt-1">
                      E-042
                    </p>
                    <p className="font-mono text-xs text-neutral-600 mt-1 font-semibold">
                      STATOR TEMP: 145°C · PEAK CURRENT EXCEEDED
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 border border-neutral-200 text-xs font-mono space-y-1">
                  <p className="text-neutral-500 font-bold">Schema Resolution Rule:</p>
                  <p className="text-neutral-800">
                    Diagnostic code E-042 mapped to Mitsubishi Master Taxonomy code <span className="font-bold text-black">F042</span>.
                  </p>
                </div>
              </div>
            )}

            {activeEvidenceTab === 'transcript' && (
              <div className="space-y-3 font-mono text-xs">
                <span className="text-black font-bold uppercase">Crew Voice Note Transcript</span>
                <div className="space-y-3">
                  {TRANSCRIPT.map((line) => (
                    <div key={line.id} className="rounded-xl bg-white p-3.5 border border-neutral-200">
                      <p className="text-xs text-neutral-500 italic font-sans">{line.source}</p>
                      <p className="text-xs text-black font-bold mt-1.5">{line.translation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-200 text-[10px] font-mono text-neutral-500 flex justify-between">
              <span>Depot Bay 4 · Optical Camera Sensor #2</span>
              <span className="font-bold text-black">SHA-256 Hash Verified</span>
            </div>
          </div>
        </div>

        {/* ── Right Pane: Normalized Schema Editor ───────────────────── */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-white shadow-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div>
              <span className="font-mono text-xs font-bold uppercase text-black">
                Normalized MELCO-WS Schema Fields
              </span>
              <p className="font-mono text-[10px] text-neutral-500 font-semibold">
                Fields strictly required by Mitsubishi Electric supplier portal
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-black">JIS-D-4201 COMPLIANT</span>
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
                      ? 'border-black bg-white shadow-card'
                      : 'border-neutral-200 bg-neutral-50 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-black">
                          {field.label}
                        </span>
                        {field.oemRequired && (
                          <span className="rounded bg-neutral-200 text-black px-2 py-0.5 font-mono text-[9px] font-bold">
                            MANDATORY
                          </span>
                        )}
                        <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[9px] text-neutral-600 font-semibold">
                          SOURCE: {field.source.toUpperCase()}
                        </span>
                      </div>

                      {/* Input field */}
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className="mt-2 w-full rounded-lg bg-white border border-neutral-300 px-3.5 py-2 font-mono text-sm font-bold text-black outline-none focus:border-black transition-colors"
                      />

                      {field.note && (
                        <p className="mt-1.5 text-xs font-mono text-neutral-600">
                          {field.note}
                        </p>
                      )}
                    </div>

                    {/* Right side: Confidence & Confirmation Toggle */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-3">
                      <div className="text-right font-mono">
                        <span className="text-xs font-extrabold text-black">
                          {Math.round(field.confidence * 100)}%
                        </span>
                        <p className="text-[9px] text-neutral-500 font-bold">CONFIDENCE</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleConfirm(field.id)
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all ${
                          isConfirmed
                            ? 'bg-black text-white'
                            : 'bg-white text-neutral-400 border border-neutral-300 hover:border-black'
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
          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs text-neutral-500">
              Inspector: S. Iyer (Chief Rolling Stock Division)
            </span>

            <button
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 font-mono text-xs font-bold text-white hover:bg-neutral-800 transition-all"
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
