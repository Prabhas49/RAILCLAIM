import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { ACTIVE_CLAIM, OEM_BY_ID, getScenario } from '../data/mock'
import { openPrintableVoucher } from '../components/OemPdfVoucher'

export default function OemOutput({ onContinue }: { onContinue: () => void }) {
  const [activeTab, setActiveTab] = useState<'voucher' | 'payload' | 'dispatch'>('voucher')
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'transmitting' | 'confirmed'>('idle')
  const [copiedPayload, setCopiedPayload] = useState(false)

  const oem = OEM_BY_ID[ACTIVE_CLAIM.oem]

  const handleDispatch = () => {
    setDispatchStatus('transmitting')
    setTimeout(() => {
      setDispatchStatus('confirmed')
    }, 1200)
  }

  const rawXmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<MELCO_WARRANTY_VOUCHER version="3.2" xmlns="urn:melco:railway:warranty:v3">
  <HEADER>
    <TRANSACTION_ID>MELCO-TX-20260921-9482</TRANSACTION_ID>
    <TIMESTAMP>2026-09-21T07:15:30+05:30</TIMESTAMP>
    <DEPOT_AUTHORITY>KOCHI_METRO_RAIL_LTD</DEPOT_AUTHORITY>
    <DEPOT_LOCATION>MUTTOM_BAY_4</DEPOT_LOCATION>
    <CHIEF_INSPECTOR_ID>KM-T04-PRAGNA</CHIEF_INSPECTOR_ID>
  </HEADER>
  <CLAIM_DETAILS>
    <CLAIM_REF>${ACTIVE_CLAIM.id}</CLAIM_REF>
    <ASSET_IDENTIFIER>${ACTIVE_CLAIM.assetId}</ASSET_IDENTIFIER>
    <COMPONENT_SPEC>TRACTION_MOTOR_MB5085A</COMPONENT_SPEC>
    <PART_SERIAL_NUMBER>MB5085-2274-K</PART_SERIAL_NUMBER>
    <OPERATING_HOURS>18420</OPERATING_HOURS>
    <FAULT_TAXONOMY_CODE>${ACTIVE_CLAIM.failureCode}</FAULT_TAXONOMY_CODE>
    <SYMPTOM_CATEGORY>${ACTIVE_CLAIM.symptom}</SYMPTOM_CATEGORY>
    <LABOR_OPERATION_CODE>REPLACE_STATOR_CORE</LABOR_OPERATION_CODE>
    <CLAIMED_CURRENCY>INR</CLAIMED_CURRENCY>
    <CLAIMED_AMOUNT_INR>${ACTIVE_CLAIM.amountInr}</CLAIMED_AMOUNT_INR>
    <OEM_EQUIVALENT_JPY>872000</OEM_EQUIVALENT_JPY>
    <WARRANTY_EXPIRY_DATE>${ACTIVE_CLAIM.warrantyExpires}</WARRANTY_EXPIRY_DATE>
  </CLAIM_DETAILS>
  <ATTACHMENTS count="3">
    <ATTACHMENT index="1" type="NAMEPLATE_OCR" sha256="4d8e91..."/>
    <ATTACHMENT index="2" type="HMI_FAULT_CODE" sha256="b2a71f..."/>
    <ATTACHMENT index="3" type="DEPOT_INSTALL_CONTEXT" sha256="9f3c88..."/>
  </ATTACHMENTS>
  <CRYPTOGRAPHIC_SIGNATURE algorithm="SHA-256-RSA">
    7f4c9a81e2b04f33d7c5889a014e59bb12a76f200c8192a6b22340f6991ec67a
  </CRYPTOGRAPHIC_SIGNATURE>
</MELCO_WARRANTY_VOUCHER>`

  const handleCopy = () => {
    navigator.clipboard?.writeText(rawXmlPayload)
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16 text-white">
      {/* ── Transmission Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#71717a]">
              Bilateral OEM Transmission // {oem.name.toUpperCase()} ELECTRIC CORP
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white tracking-tight">
            Warranty Claim Submission Terminal
          </h1>
          <p className="font-mono text-xs text-[#a1a1aa] mt-1">
            Target Gateway: {oem.portal} (Kobe Works, Japan) · SLA: {oem.slaDays} Days
          </p>
        </div>

        {/* Action Tabs & PDF Download */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => openPrintableVoucher(getScenario('1'))}
            className="inline-flex items-center gap-2 rounded-full bg-[#00c2ff] px-4 py-2 font-mono text-xs font-bold text-black hover:bg-[#3cd3ff] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>⎙ Download Official JIS PDF</span>
          </button>

          <div className="flex rounded-full bg-black border border-[#1e1e1e] p-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('voucher')}
              className={`rounded-full px-4 py-2 font-bold transition-colors ${
                activeTab === 'voucher' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Formal Voucher
            </button>
            <button
              onClick={() => setActiveTab('payload')}
              className={`rounded-full px-4 py-2 font-bold transition-colors ${
                activeTab === 'payload' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              MELCO-WS XML
            </button>
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`rounded-full px-4 py-2 font-bold transition-colors ${
                activeTab === 'dispatch' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              API Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Workspace Display ──────────────────────────────────── */}
      {activeTab === 'voucher' && (
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-8 sm:p-10 space-y-8">
          {/* Document Heading */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#1e1e1e] pb-8">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#71717a]">
                <span>FORM JIS-W-2026-MELCO</span>
                <span>· MLIT BILATERAL ACCORD</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-2">
                Rolling Stock Warranty Settlement Voucher
              </h2>
              <p className="font-mono text-xs text-[#a1a1aa] mt-1">
                Kochi Metro Rail Ltd (KMRL) ↔ Mitsubishi Electric Transportation Systems
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <span className="rounded-full bg-[#141414] px-3 py-1 font-bold text-white border border-[#262626]">
                REF: {ACTIVE_CLAIM.id}
              </span>
              <p className="text-[#71717a] mt-2">Date: 2026-09-21</p>
              <p className="text-emerald-400 font-bold mt-0.5">STATUS: VERIFIED ELIGIBLE</p>
            </div>
          </div>

          {/* Core Technical Specifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
            <div className="rounded-xl bg-black p-4 border border-[#1e1e1e]">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Rolling Stock Asset</span>
              <p className="font-bold text-white mt-1 text-sm">{ACTIVE_CLAIM.assetId}</p>
              <p className="text-[10px] text-[#71717a] mt-0.5">CS-10 3-Car Rake</p>
            </div>
            <div className="rounded-xl bg-black p-4 border border-[#1e1e1e]">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Part Serial (OCR)</span>
              <p className="font-bold text-[#00c2ff] mt-1 text-sm">MB5085-2274-K</p>
              <p className="text-[10px] text-[#71717a] mt-0.5">Nameplate Matched</p>
            </div>
            <div className="rounded-xl bg-black p-4 border border-[#1e1e1e]">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Supplier Failure Code</span>
              <p className="font-bold text-amber-400 mt-1 text-sm">{ACTIVE_CLAIM.failureCode}</p>
              <p className="text-[10px] text-[#71717a] mt-0.5">thermal_overload</p>
            </div>
            <div className="rounded-xl bg-black p-4 border border-[#1e1e1e]">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Settlement Sum</span>
              <p className="font-bold text-emerald-400 mt-1 text-sm">₹{ACTIVE_CLAIM.amountInr.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-[#71717a] mt-0.5">¥872,000 Equivalent</p>
            </div>
          </div>

          {/* Bilateral Warranty Clause */}
          <div className="rounded-xl bg-black p-6 border border-[#1e1e1e] font-mono text-xs space-y-2">
            <p className="text-[#71717a] font-bold uppercase text-[10px]">
              Contractual Warranty Verification Clause (Article 14.2)
            </p>
            <p className="text-neutral-300 leading-relaxed font-sans text-sm">
              Component verified under original delivery warranty of Kochi Metro Line 1. Warranty remains active through{' '}
              <span className="text-white font-bold font-mono">{ACTIVE_CLAIM.warrantyExpires}</span>. Contractual response SLA is{' '}
              <span className="text-[#00c2ff] font-bold font-mono">{oem.slaDays} calendar days</span> from electronic gateway timestamp.
            </p>
          </div>

          {/* Attached Cryptographic Evidence */}
          <div className="border-t border-[#1e1e1e] pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[#71717a] text-[10px] uppercase font-bold">Attached Evidentiary Hashes</span>
              <p className="text-[#a1a1aa]">
                3 Artifacts: Nameplate OCR (sha256:4d8e), HMI Code (sha256:b2a7), Bogie Context (sha256:9f3c)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('payload')}
                className="rounded-full border border-[#262626] bg-[#141414] px-5 py-2.5 font-mono text-xs font-semibold text-white hover:bg-[#222222] transition-colors"
              >
                Inspect Raw EDI XML
              </button>
              <button
                onClick={() => setActiveTab('dispatch')}
                className="rounded-full bg-[#00c2ff] px-6 py-2.5 font-mono text-xs font-bold text-black hover:bg-[#2ed2ff] transition-colors shadow-sm"
              >
                Proceed to Dispatch →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Raw Payload Viewer Tab ──────────────────────────────────── */}
      {activeTab === 'payload' && (
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
            <span className="font-mono text-xs font-bold uppercase text-white">
              Compiled MELCO-WS XML Payload // Target Gateway Schema
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full bg-[#141414] border border-[#262626] px-4 py-1.5 font-mono text-xs font-bold text-white hover:bg-[#222222] transition-colors"
            >
              <Icon name="copy" className="h-3.5 w-3.5" />
              <span>{copiedPayload ? 'Copied to Clipboard!' : 'Copy XML'}</span>
            </button>
          </div>

          <pre className="rounded-xl bg-black border border-[#1e1e1e] p-6 font-mono text-xs text-neutral-200 leading-relaxed overflow-x-auto">
            {rawXmlPayload}
          </pre>
        </div>
      )}

      {/* ── Live API Gateway Dispatch Tab ───────────────────────────── */}
      {activeTab === 'dispatch' && (
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] shadow-sm p-8 space-y-8">
          <div className="border-b border-[#1e1e1e] pb-6">
            <span className="font-mono text-xs font-bold uppercase text-[#71717a]">
              Electronic Data Interchange (EDI) Transmission
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">Direct Gateway Submission</h2>
            <p className="font-mono text-xs text-[#a1a1aa] mt-1">
              Secure mutual TLS 1.3 connection to Mitsubishi MELCO-WS Portal (Kobe, Japan)
            </p>
          </div>

          <div className="rounded-xl bg-black border border-[#1e1e1e] p-6 font-mono text-xs space-y-3">
            <div className="flex justify-between items-center text-[#a1a1aa]">
              <span>Endpoint:</span>
              <span className="text-[#00c2ff] font-bold">https://supplier.melco-rail.jp/api/v3/warranty/claims</span>
            </div>
            <div className="flex justify-between items-center text-[#a1a1aa]">
              <span>Encryption:</span>
              <span className="text-white font-bold">TLS_AES_256_GCM_SHA384 (Verified)</span>
            </div>
            <div className="flex justify-between items-center text-[#a1a1aa]">
              <span>Authentication:</span>
              <span className="text-white font-bold">KMRL Client X.509 Certificate · Authority #8821</span>
            </div>
          </div>

          {dispatchStatus === 'idle' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="font-mono text-xs text-[#71717a]">
                Ready to transmit signed voucher {ACTIVE_CLAIM.id}
              </span>
              <button
                onClick={handleDispatch}
                className="w-full sm:w-auto rounded-full bg-[#00c2ff] px-8 py-4 font-mono text-xs font-bold text-black hover:bg-[#2ed2ff] transition-colors shadow-sm"
              >
                TRANSMIT CLAIM TO MITSUBISHI MELCO-WS
              </button>
            </div>
          )}

          {dispatchStatus === 'transmitting' && (
            <div className="rounded-xl bg-black p-8 text-center border border-[#1e1e1e] font-mono text-xs text-white space-y-3">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#00c2ff] border-t-transparent" />
              <p className="text-white font-bold text-sm">Performing mTLS Handshake & Cryptographic Hash Validation...</p>
              <p className="text-[#71717a]">Transmitting 2.4 MB payload to MELCO-WS Kobe Gateway</p>
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
                  Claim Received & Acknowledged // HTTP 200 OK
                </span>
              </div>
              <p className="text-neutral-300 font-sans text-sm">
                Mitsubishi Electric Supplier Gateway has accepted Claim CLM-2481. Formal transaction receipt registered:
              </p>
              <div className="rounded-xl bg-[#0a0a0a] p-4 border border-[#1e1e1e] space-y-1.5 text-neutral-300">
                <p>Transaction Ref: <span className="text-[#00c2ff] font-bold">MELCO-ACK-20260921-88421</span></p>
                <p>SLA Adjudication Window: <span className="text-white font-bold">30 Calendar Days (Due: 2026-10-21)</span></p>
                <p>Settlement Pipeline: <span className="text-emerald-400 font-bold">₹4,82,400 Approved for Review</span></p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={onContinue}
                  className="rounded-full bg-[#00c2ff] px-6 py-2.5 font-mono text-xs font-bold text-black hover:bg-[#2ed2ff] transition-colors shadow-sm"
                >
                  Return to Command Center
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
