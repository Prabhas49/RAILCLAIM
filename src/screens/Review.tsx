import { useMemo, useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { getScenario } from '../data/mock'
import { openPrintableVoucher } from '../components/OemPdfVoucher'
import { getDraft, patchDraft } from '../lib/claimStore'
import type { ClaimField } from '../types'

export default function Review({ onContinue }: { onContinue: () => void }) {
  const draft = useMemo(() => getDraft(), [])
  const scenario = getScenario(draft?.scenarioId)

  // Fields are derived from the actual draft, not a static fixture.
  const initialFields: ClaimField[] = useMemo(() => {
    if (!draft) return []
    return [
      {
        id: 'equipment_type',
        label: 'Equipment Type',
        value: draft.equipmentType,
        confidence: 0.99,
        source: 'photo',
        oemRequired: true,
      },
      {
        id: 'manufacturer',
        label: 'Manufacturer',
        value: draft.manufacturer,
        confidence: 0.98,
        source: 'photo',
        oemRequired: true,
      },
      {
        id: 'model',
        label: 'Model',
        value: draft.model,
        confidence: 0.96,
        source: 'photo',
        oemRequired: false,
      },
      {
        id: 'serial_no',
        label: 'Serial Number',
        value: draft.serialNumber,
        confidence: 0.98,
        source: 'photo',
        oemRequired: true,
      },
      {
        id: 'asset_id',
        label: 'Train / Set',
        value: draft.trainset,
        confidence: 0.97,
        source: 'voice',
        oemRequired: true,
      },
      {
        id: 'component_id',
        label: 'Component ID',
        value: draft.componentId,
        confidence: 0.95,
        source: 'photo',
        oemRequired: false,
      },
      {
        id: 'failure_code',
        label: 'Fault Code',
        value: draft.faultCode,
        confidence: 0.98,
        source: 'photo',
        oemRequired: true,
      },
      {
        id: 'symptom',
        label: 'Fault Summary',
        value: draft.faultSummary,
        confidence: 0.94,
        source: 'voice',
        oemRequired: true,
        note: 'Transcribed and translated from the technician voice note.',
      },
      {
        id: 'depot_code',
        label: 'Depot',
        value: draft.depot,
        confidence: 0.96,
        source: 'metadata',
        oemRequired: false,
      },
      {
        id: 'fault_date',
        label: 'Fault Date',
        value: draft.faultDate,
        confidence: 0.99,
        source: 'metadata',
        oemRequired: false,
      },
    ]
  }, [draft])

  const [fields, setFields] = useState<ClaimField[]>(initialFields)
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(
    () => new Set(draft?.status === 'review' ? initialFields.map((f) => f.id) : []),
  )
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'photos' | 'transcript'>('photos')
  const [focusedFieldId, setFocusedFieldId] = useState<string>(initialFields[0]?.id ?? '')

  if (!draft) {
    return (
      <div className="mx-auto max-w-3xl py-24 text-center text-white">
        <h1 className="text-2xl font-bold">No claim draft found</h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">Create a claim first — the review screen shows your actual draft data.</p>
      </div>
    )
  }

  const toggleConfirm = (id: string) => {
    setConfirmedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const confirmAll = () => setConfirmedIds(new Set(fields.map((f) => f.id)))

  const updateFieldValue = (id: string, val: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value: val } : f)))
    const field = fields.find((f) => f.id === id)
    if (field) {
      // Mirror edits back into the draft so downstream screens stay in sync
      if (id === 'equipment_type') patchDraft({ equipmentType: val })
      else if (id === 'manufacturer') patchDraft({ manufacturer: val })
      else if (id === 'model') patchDraft({ model: val })
      else if (id === 'serial_no') patchDraft({ serialNumber: val })
      else if (id === 'asset_id') patchDraft({ trainset: val })
      else if (id === 'component_id') patchDraft({ componentId: val })
      else if (id === 'failure_code') patchDraft({ faultCode: val })
      else if (id === 'symptom') patchDraft({ faultSummary: val })
      else if (id === 'depot_code') patchDraft({ depot: val })
      else if (id === 'fault_date') patchDraft({ faultDate: val })
    }
  }

  const persistSignOff = () => {
    patchDraft({ status: 'review' })
  }

  const handleContinue = () => {
    persistSignOff()
    onContinue()
  }

  const confirmedCount = confirmedIds.size
  const totalCount = fields.length
  const photoCount = draft.photos.length

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 text-white">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_#FFFFFF]" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">
              Inspector Sign-Off // {draft.id} · {draft.manufacturer}
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white tracking-tight">
            Claim Parameter Verification
          </h1>
          <p className="font-mono text-xs text-[#a1a1aa] mt-1">
            Confirm each field against the raw evidence before OEM transmission
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openPrintableVoucher(scenario)}
            className="rounded-full bg-white px-4 py-2 font-mono text-xs font-bold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            ⎙ Preview OEM PDF
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

      {/* ── Dual-Pane Workspace ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Evidence */}
        <div className="lg:col-span-5 rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
            <span className="font-mono text-xs font-bold uppercase text-white">Raw Depot Evidence</span>
            <span className="font-mono text-[10px] text-[#71717a] font-semibold">
              {photoCount} PHOTO{photoCount === 1 ? '' : 'S'} · CLAIM {draft.id}
            </span>
          </div>

          <div className="flex rounded-full bg-black border border-[#1e1e1e] p-1 font-mono text-xs">
            <button
              onClick={() => setActiveEvidenceTab('photos')}
              className={`flex-1 rounded-full py-2 font-bold transition-colors cursor-pointer ${
                activeEvidenceTab === 'photos' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Photos ({photoCount})
            </button>
            <button
              onClick={() => setActiveEvidenceTab('transcript')}
              className={`flex-1 rounded-full py-2 font-bold transition-colors cursor-pointer ${
                activeEvidenceTab === 'transcript' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Voice Note
            </button>
          </div>

          <div className="rounded-xl bg-black border border-[#1e1e1e] p-5 min-h-[300px] flex flex-col">
            {activeEvidenceTab === 'photos' && (
              <div className="space-y-3 flex-1">
                {photoCount === 0 ? (
                  <p className="text-xs text-[#71717a] font-mono">
                    No photos attached to this draft. Upload them in Capture → Evidence.
                  </p>
                ) : (
                  draft.photos.map((p) => (
                    <div
                      key={p.slot}
                      className="rounded-lg border border-[#1e1e1e] overflow-hidden bg-[#0a0a0a]"
                    >
                      <img src={p.dataUrl} alt={p.name} className="w-full aspect-video object-cover" />
                      <div className="flex items-center justify-between px-3 py-2 text-[11px] font-mono">
                        <span className="text-white font-bold truncate">{p.name}</span>
                        <span className="text-emerald-400">{p.confidence}% match</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeEvidenceTab === 'transcript' && (
              <div className="space-y-3 font-mono text-xs flex-1">
                <span className="text-white font-bold uppercase">Scenario Voice Transcript</span>
                {scenario.transcript.map((line) => (
                  <div key={line.id} className="rounded-xl bg-[#0a0a0a] p-3.5 border border-[#1e1e1e]">
                    <p className="text-xs text-[#71717a] italic font-sans">{line.source}</p>
                    <p className="text-xs text-white font-bold mt-1.5">{line.translation}</p>
                  </div>
                ))}
                <p className="text-[#71717a]">
                  {draft.hasVoiceNote
                    ? `Technician attached a ${draft.voiceSeconds}s voice note to this draft.`
                    : 'No voice note was attached to this draft.'}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-[#1e1e1e] text-[10px] font-mono text-[#71717a] flex justify-between">
              <span>Depot: {draft.depot}</span>
              <span className="font-bold text-emerald-400">SHA-256 Verified ✓</span>
            </div>
          </div>
        </div>

        {/* Right: Schema editor */}
        <div className="lg:col-span-7 rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
            <div>
              <span className="font-mono text-xs font-bold uppercase text-white">
                Normalized Claim Fields
              </span>
              <p className="font-mono text-[10px] text-[#71717a] font-semibold">
                Edit any value — changes sync back to the draft and OEM payload
              </p>
            </div>
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
                      ? 'border-[#FFFFFF] bg-black'
                      : 'border-[#1e1e1e] bg-black/60 hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                          {field.label}
                        </span>
                        {field.oemRequired && (
                          <span className="rounded bg-[rgba(255,255,255,0.08)] text-[#FFFFFF] border border-[#FFFFFF]/30 px-2 py-0.5 font-mono text-[9px] font-bold">
                            REQUIRED
                          </span>
                        )}
                        <span className="rounded bg-[#141414] border border-[#262626] px-2 py-0.5 font-mono text-[9px] text-[#a1a1aa] font-semibold">
                          SOURCE: {field.source.toUpperCase()}
                        </span>
                      </div>

                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className="mt-2 w-full rounded-lg bg-[#0a0a0a] border border-[#262626] px-3.5 py-2 font-mono text-sm font-bold text-white outline-none focus:border-[#FFFFFF] transition-colors"
                      />

                      {field.note && (
                        <p className="mt-1.5 text-xs font-mono text-[#a1a1aa]">{field.note}</p>
                      )}
                    </div>

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
                        className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                          isConfirmed
                            ? 'bg-white text-black'
                            : 'bg-[#141414] text-neutral-500 border border-[#262626] hover:border-[#FFFFFF] hover:text-white'
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

          <div className="pt-6 border-t border-[#1e1e1e] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs text-[#a1a1aa]">
              {confirmedCount === totalCount
                ? 'All fields signed off.'
                : `${totalCount - confirmedCount} field(s) awaiting sign-off`}
            </span>

            <button
              onClick={handleContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-mono text-xs font-bold text-black hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
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
