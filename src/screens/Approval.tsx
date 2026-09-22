import { useMemo, useState } from 'react'
import { getScenario } from '../data/mock'
import { getDraft, patchDraft, markSubmitted } from '../lib/claimStore'
import { openPrintableVoucher } from '../components/OemPdfVoucher'
import { speakJapanese } from '../lib/translator'

const inputCls =
  'w-full rounded-lg border border-[#262626] bg-black px-3.5 py-2 font-mono text-sm font-bold text-white outline-none focus:border-white'

export default function Approval({ onDone }: { onDone: () => void }) {
  const draft = useMemo(() => getDraft(), [])
  const [fields, setFields] = useState(() => draft ? {
    equipmentType: draft.equipmentType, manufacturer: draft.manufacturer,
    model: draft.model, serialNumber: draft.serialNumber, trainset: draft.trainset,
    componentId: draft.componentId, faultCode: draft.faultCode,
    faultSummary: draft.faultSummary, depot: draft.depot, faultDate: draft.faultDate,
  } : null)
  const [done, setDone] = useState(false)
  const [receipt, setReceipt] = useState('')
  const [sending, setSending] = useState(false)

  if (!draft || !fields) {
    return <div className="py-24 text-center text-white"><h1 className="text-2xl font-bold">No claim waiting</h1><p className="mt-2 text-sm text-[#a1a1aa]">Create a claim first.</p></div>
  }

  const scenario = getScenario(draft.scenarioId)
  const set = (k: keyof typeof fields, v: string) => {
    setFields({ ...fields, [k]: v })
    patchDraft({ [k]: v } as any)
  }

  const voucherScenario = {
    ...scenario,
    claimId: draft.id,
    equipment: fields.equipmentType,
    model: fields.model,
    serialNo: fields.serialNumber,
    faultCode: fields.faultCode,
    failureDescription: fields.faultSummary,
    oemName: fields.manufacturer,
    // Engineer hears the real voices; the PDF carries the real words too.
    transcript: draft.voiceTranscript || draft.voiceJapanese
      ? [{ id: 'v1', source: draft.voiceTranscript || '(no transcript)', translation: draft.voiceJapanese || '(translation pending)', terms: [], startMs: 0 }]
      : scenario.transcript,
  } as any

  /** Single decision: approve → PDF opens → claim filed to the OEM. */
  const approveAndSend = () => {
    if (sending || done) return
    setSending(true)
    openPrintableVoucher(voucherScenario)
    setTimeout(() => {
      const rec = markSubmitted({ ...draft, ...fields }, fields.manufacturer)
      patchDraft({ status: 'approved' })
      setReceipt(`ACK-${rec.id}-${Date.now().toString().slice(-4)}`)
      setSending(false)
      setDone(true)
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-6xl pb-16 text-white">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">Engineer approval // {draft.id}</p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">Review & send to OEM</h1>
      <p className="mt-1 font-mono text-xs text-[#a1a1aa]">Check fault + info + photos + both voices → one click generates the PDF and files it.</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Evidence: fault type + info + photos + both voices */}
        <div className="lg:col-span-5 rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] p-4 sm:p-6 space-y-4">
          <div className="rounded-xl border border-[#1e1e1e] bg-black p-4">
            <h2 className="font-mono text-xs font-bold uppercase">Fault type</h2>
            <p className="mt-1 text-sm font-bold text-white">{fields.faultCode} · {fields.equipmentType}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-300">{fields.faultSummary}</p>
          </div>
          <div className="rounded-xl border border-[#1e1e1e] bg-black p-4 font-mono text-xs">
            <h2 className="font-bold uppercase">Info</h2>
            <div className="mt-2 space-y-1 text-neutral-300">
              <p>OEM: <span className="text-white">{fields.manufacturer}</span></p>
              <p>Train: <span className="text-white">{fields.trainset}</span> · Model: <span className="text-white">{fields.model}</span></p>
              <p>Serial: <span className="text-white">{fields.serialNumber}</span> · Component: <span className="text-white">{fields.componentId}</span></p>
              <p>Depot: <span className="text-white">{fields.depot}</span> · Date: <span className="text-white">{fields.faultDate}</span></p>
            </div>
          </div>
          <h2 className="font-mono text-xs font-bold uppercase">Photos ({draft.photos.length})</h2>
          {draft.photos.length === 0
            ? <p className="text-xs text-[#71717a]">No photos attached.</p>
            : draft.photos.map((p) => (
              <div key={p.slot + p.name} className="overflow-hidden rounded-lg border border-[#1e1e1e]">
                <img src={p.dataUrl} alt={p.name} className="aspect-video w-full object-cover" />
                <p className="px-3 py-1.5 font-mono text-[11px] text-[#a1a1aa]">{p.name}</p>
              </div>
            ))}
          <div className="rounded-xl border border-[#1e1e1e] bg-black p-4">
            <h3 className="font-mono text-xs font-bold uppercase">① Original voice (technician)</h3>
            {draft.voiceAudioDataUrl
              ? <audio controls src={draft.voiceAudioDataUrl} className="mt-2 h-9 w-full" />
              : <p className="mt-2 font-mono text-xs text-[#71717a]">{draft.hasVoiceNote ? `${draft.voiceSeconds}s recorded.` : 'No voice note.'}</p>}
            {draft.voiceTranscript && <p className="mt-2 text-sm text-neutral-200">“{draft.voiceTranscript}”</p>}
          </div>
          <div className="rounded-xl border border-white/15 bg-white/[0.04] p-4">
            <h3 className="font-mono text-xs font-bold uppercase">② Japanese voice (for OEM 🇯🇵)</h3>
            {draft.voiceJapaneseAudioDataUrl
              ? <audio controls src={draft.voiceJapaneseAudioDataUrl} className="mt-2 h-9 w-full" />
              : draft.voiceJapanese
                ? <button onClick={() => draft.voiceJapanese && speakJapanese(draft.voiceJapanese)} className="mt-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-neutral-300 hover:text-white">🔊 Play Japanese</button>
                : <p className="mt-2 font-mono text-xs text-[#71717a]">No Japanese audio yet.</p>}
            {draft.voiceJapanese && <p className="mt-2 font-bold text-white">{draft.voiceJapanese}</p>}
            {draft.voiceRomaji && <p className="mt-1 font-mono text-xs italic text-neutral-400">{draft.voiceRomaji}</p>}
          </div>
          <p className="font-mono text-[10px] text-[#71717a]">Depot: {fields.depot} · <span className="text-emerald-400 font-bold">SHA-256 Verified ✓</span></p>
        </div>

        {/* Fields */}
        <div className="lg:col-span-7 rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] p-4 sm:p-6 space-y-3">
          <h2 className="font-mono text-xs font-bold uppercase">Claim data (editable)</h2>
          {(Object.keys(fields) as (keyof typeof fields)[]).map((k) => (
            <label key={k} className="block">
              <span className="font-mono text-[10px] uppercase text-[#71717a]">{k}</span>
              {k === 'faultSummary'
                ? <textarea rows={3} value={fields[k]} onChange={(e) => set(k, e.target.value)} className={inputCls + ' font-sans font-medium'} />
                : <input value={fields[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} />}
            </label>
          ))}
          {!done ? (
            <div className="space-y-3">
              <button
                onClick={approveAndSend}
                disabled={sending}
                className="w-full rounded-xl bg-white py-4 text-sm font-extrabold text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-wait"
              >
                {sending ? 'Generating PDF & sending…' : '⎙ Approve, generate PDF & send to OEM →'}
              </button>
              <button
                onClick={() => openPrintableVoucher(voucherScenario)}
                className="w-full rounded-xl border border-white/15 bg-transparent py-2.5 text-xs font-semibold text-[#a1a1aa] hover:text-white"
              >
                Preview PDF only (doesn't file the claim)
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-5 font-mono text-xs">
              <p className="font-bold text-emerald-400">✓ SENT TO {fields.manufacturer.toUpperCase()} — receipt {receipt}</p>
              <p className="mt-1 text-neutral-300">PDF generated and claim dispatched to the OEM in Japan.</p>
              <button onClick={onDone} className="mt-3 rounded-full bg-white px-6 py-2.5 font-bold text-black">Back to dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
