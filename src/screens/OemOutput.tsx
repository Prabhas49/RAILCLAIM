import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { getScenario } from '../data/mock'
import { openPrintableVoucher } from '../components/OemPdfVoucher'
import { getDraft, markSubmitted } from '../lib/claimStore'

export default function OemOutput({ onContinue }: { onContinue: () => void }) {
  const draft = useMemo(() => getDraft(), [])
  const scenario = getScenario(draft?.scenarioId)
  const [activeTab, setActiveTab] = useState<'voucher' | 'payload' | 'dispatch'>('voucher')
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'transmitting' | 'confirmed'>('idle')
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [receiptId] = useState(
    () => `MELCO-ACK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
  )

  if (!draft) {
    return (
      <div className="mx-auto max-w-3xl py-24 text-center text-white">
        <h1 className="text-2xl font-bold">No claim draft found</h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">Create a claim first — dispatch transmits your actual draft.</p>
      </div>
    )
  }

  const handleDispatch = () => {
    setDispatchStatus('transmitting')
    setTimeout(() => {
      markSubmitted(draft, draft.manufacturer)
      setDispatchStatus('confirmed')
    }, 1200)
  }

  const rawXmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<WARRANTY_VOUCHER version="3.2">
  <HEADER>
    <TRANSACTION_ID>${draft.id}</TRANSACTION_ID>
    <TIMESTAMP>${new Date().toISOString()}</TIMESTAMP>
    <DEPOT_AUTHORITY>${draft.depot.toUpperCase().replace(/\s+/g, '_')}</DEPOT_AUTHORITY>
  </HEADER>
  <CLAIM_DETAILS>
    <CLAIM_REF>${draft.id}</CLAIM_REF>
    <EQUIPMENT_TYPE>${draft.equipmentType}</EQUIPMENT_TYPE>
    <MANUFACTURER>${draft.manufacturer}</MANUFACTURER>
    <MODEL>${draft.model}</MODEL>
    <PART_SERIAL_NUMBER>${draft.serialNumber}</PART_SERIAL_NUMBER>
    <TRAIN_SET>${draft.trainset}</TRAIN_SET>
    <COMPONENT_ID>${draft.componentId}</COMPONENT_ID>
    <FAULT_TAXONOMY_CODE>${draft.faultCode}</FAULT_TAXONOMY_CODE>
    <SYMPTOM_CATEGORY>${draft.classification}</SYMPTOM_CATEGORY>
    <FAULT_DATE>${draft.faultDate}</FAULT_DATE>
    <CLAIMED_CURRENCY>INR</CLAIMED_CURRENCY>
    <CLAIMED_AMOUNT_INR>${draft.amountInr}</CLAIMED_AMOUNT_INR>
    <OEM_EQUIVALENT_JPY>${scenario.amountJpy}</OEM_EQUIVALENT_JPY>
  </CLAIM_DETAILS>
  <ATTACHMENTS count="${draft.photos.length}">
${draft.photos
  .map(
    (p, i) =>
      `    <ATTACHMENT index="${i + 1}" name="${p.name}" tag="${p.tag}" confidence="${p.confidence}"/>`,
  )
  .join('\n')}
  </ATTACHMENTS>
  <VOICE_NOTE attached="${draft.hasVoiceNote}" durationSeconds="${draft.voiceSeconds}"/>
</WARRANTY_VOUCHER>`

  const handleCopy = () => {
    navigator.clipboard?.writeText(rawXmlPayload)
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16 text-white">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">
              OEM Transmission // {draft.manufacturer.toUpperCase()}
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white tracking-tight">
            Warranty Claim Submission
          </h1>
          <p className="font-mono text-xs text-[#a1a1aa] mt-1">
            Claim {draft.id} · {draft.equipmentType} · SN {draft.serialNumber}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => openPrintableVoucher(scenario)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-xs font-bold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            ⎙ Download Official PDF
          </button>

          <div className="flex rounded-full bg-black border border-[#1e1e1e] p-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('voucher')}
              className={`rounded-full px-4 py-2 font-bold transition-colors cursor-pointer ${
                activeTab === 'voucher' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Voucher
            </button>
            <button
              onClick={() => setActiveTab('payload')}
              className={`rounded-full px-4 py-2 font-bold transition-colors cursor-pointer ${
                activeTab === 'payload' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              XML Payload
            </button>
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`rounded-full px-4 py-2 font-bold transition-colors cursor-pointer ${
                activeTab === 'dispatch' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* ── Voucher tab ─────────────────────────────────────────────────── */}
      {activeTab === 'voucher' && (
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-8 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#1e1e1e] pb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white mt-2">
                Rolling Stock Warranty Settlement Voucher
              </h2>
              <p className="font-mono text-xs text-[#a1a1aa] mt-1">
                {draft.depot} ↔ {draft.manufacturer}
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <span className="rounded-full bg-[#141414] px-3 py-1 font-bold text-white border border-[#262626]">
                REF: {draft.id}
              </span>
              <p className="text-[#71717a] mt-2">Date: {new Date().toLocaleDateString('en-CA')}</p>
              <p className="text-emerald-400 font-bold mt-0.5">STATUS: READY FOR DISPATCH</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
            <div className="rounded-xl bg-black p-4 border border-[#1e1e1e]">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Equipment</span>
              <p className="font-bold text-white mt-1 text-sm">{draft.equipmentType}</p>
              <p className="text-[10px] text-[#71717a] mt-0.5">{draft.model}</p>
            </div>
            <div className="rounded-xl bg-black p-4 border border-[#1e1e1e]">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Part Serial</span>
              <p className="font-bold text-white mt-1 text-sm">{draft.serialNumber}</p>
              <p className="text-[10px] text-[#71717a] mt-0.5">{draft.componentId}</p>
            </div>
            <div className="rounded-xl bg-black p-4 border border-[#1e1e1e]">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Fault Code</span>
              <p className="font-bold text-white mt-1 text-sm">{draft.faultCode}</p>
              <p className="text-[10px] text-[#71717a] mt-0.5">{draft.classification}</p>
            </div>
            <div className="rounded-xl bg-black p-4 border border-[#1e1e1e]">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Settlement Sum</span>
              <p className="font-bold text-emerald-400 mt-1 text-sm">
                ₹{draft.amountInr.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-[#71717a] mt-0.5">
                ¥{scenario.amountJpy.toLocaleString('ja-JP')} equivalent
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-black p-6 border border-[#1e1e1e] font-mono text-xs space-y-2">
            <p className="text-[#71717a] font-bold uppercase text-[10px]">Fault summary</p>
            <p className="text-neutral-300 leading-relaxed font-sans text-sm">{draft.faultSummary}</p>
          </div>

          <div className="border-t border-[#1e1e1e] pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Attached Evidence</span>
              <p className="text-[#a1a1aa]">
                {draft.photos.length} photo(s){draft.hasVoiceNote ? ' · 1 voice note' : ''} · hash-verified
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('payload')}
                className="rounded-full border border-[#262626] bg-[#141414] px-5 py-2.5 font-mono text-xs font-semibold text-white hover:bg-[#222222] transition-colors cursor-pointer"
              >
                Inspect XML Payload
              </button>
              <button
                onClick={() => setActiveTab('dispatch')}
                className="rounded-full bg-white px-6 py-2.5 font-mono text-xs font-bold text-black hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
              >
                Proceed to Dispatch →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payload tab ─────────────────────────────────────────────────── */}
      {activeTab === 'payload' && (
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
            <span className="font-mono text-xs font-bold uppercase text-white">
              Generated from draft {draft.id}
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full bg-[#141414] border border-[#262626] px-4 py-1.5 font-mono text-xs font-bold text-white hover:bg-[#222222] transition-colors cursor-pointer"
            >
              <Icon name="copy" className="h-3.5 w-3.5" />
              <span>{copiedPayload ? 'Copied!' : 'Copy XML'}</span>
            </button>
          </div>

          <pre className="rounded-xl bg-black border border-[#1e1e1e] p-6 font-mono text-xs text-neutral-200 leading-relaxed overflow-x-auto">
            {rawXmlPayload}
          </pre>
        </div>
      )}

      {/* ── Dispatch tab ────────────────────────────────────────────────── */}
      {activeTab === 'dispatch' && (
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-8 space-y-8">
          <div className="border-b border-[#1e1e1e] pb-6">
            <span className="font-mono text-xs font-bold uppercase text-[#71717a]">
              Electronic Data Interchange (EDI) Transmission
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">Direct Gateway Submission</h2>
            <p className="font-mono text-xs text-[#a1a1aa] mt-1">
              Demo gateway — dispatch is simulated and recorded locally.
            </p>
          </div>

          {dispatchStatus === 'idle' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-mono text-xs text-[#71717a]">
                Ready to transmit signed voucher {draft.id}
              </span>
              <button
                onClick={handleDispatch}
                className="w-full sm:w-auto rounded-full bg-white px-8 py-4 font-mono text-xs font-bold text-black hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
              >
                TRANSMIT CLAIM TO {draft.manufacturer.toUpperCase()}
              </button>
            </div>
          )}

          {dispatchStatus === 'transmitting' && (
            <div className="rounded-xl bg-black p-8 text-center border border-[#1e1e1e] font-mono text-xs text-white space-y-3">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="text-white font-bold text-sm">Transmitting payload…</p>
              <p className="text-[#71717a]">Validating evidence hashes and claim schema</p>
            </div>
          )}

          {dispatchStatus === 'confirmed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-black border border-[#1e1e1e] p-8 space-y-4 font-mono text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-black">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-white uppercase">
                  Claim Submitted // HTTP 200 OK
                </span>
              </div>
              <p className="text-neutral-300 font-sans text-sm">
                {draft.manufacturer} gateway accepted claim {draft.id}. It now appears in your Claims list.
              </p>
              <div className="rounded-xl bg-[#0a0a0a] p-4 border border-[#1e1e1e] space-y-1.5 text-neutral-300">
                <p>Receipt: <span className="text-white font-bold">{receiptId}</span></p>
                <p>Claim amount: <span className="text-white font-bold">₹{draft.amountInr.toLocaleString('en-IN')}</span></p>
                <p>Depot: <span className="text-white font-bold">{draft.depot}</span></p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={onContinue}
                  className="rounded-full bg-white px-6 py-2.5 font-mono text-xs font-bold text-black hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
