import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { ACTIVE_CLAIM, OEM_BY_ID } from '../data/mock'

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
    <CHIEF_INSPECTOR_ID>KM-T04-IYER</CHIEF_INSPECTOR_ID>
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
    <div className="mx-auto max-w-5xl space-y-8 pb-16 text-black">
      {/* ── Transmission Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">
              Bilateral OEM Transmission // {oem.name.toUpperCase()} ELECTRIC CORP
            </p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-black tracking-tight">
            Warranty Claim Submission Terminal
          </h1>
          <p className="font-mono text-xs text-neutral-500 mt-1">
            Target Gateway: {oem.portal} (Kobe Works, Japan) · SLA: {oem.slaDays} Days
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex rounded-full bg-neutral-100 p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('voucher')}
            className={`rounded-full px-4 py-2 font-bold transition-colors ${
              activeTab === 'voucher' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Formal Voucher
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`rounded-full px-4 py-2 font-bold transition-colors ${
              activeTab === 'payload' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
            }`}
          >
            MELCO-WS XML
          </button>
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`rounded-full px-4 py-2 font-bold transition-colors ${
              activeTab === 'dispatch' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
            }`}
          >
            API Dispatch
          </button>
        </div>
      </div>

      {/* ── Main Workspace Display ──────────────────────────────────── */}
      {activeTab === 'voucher' && (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-card p-8 sm:p-10 space-y-8">
          {/* Document Heading */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-neutral-200 pb-8">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-500">
                <span>FORM JIS-W-2026-MELCO</span>
                <span>· MLIT BILATERAL ACCORD</span>
              </div>
              <h2 className="text-2xl font-extrabold text-black mt-2">
                Rolling Stock Warranty Settlement Voucher
              </h2>
              <p className="font-mono text-xs text-neutral-600 mt-1">
                Kochi Metro Rail Ltd (KMRL) ↔ Mitsubishi Electric Transportation Systems
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <span className="rounded-full bg-neutral-100 px-3 py-1 font-bold text-black border border-neutral-200">
                REF: {ACTIVE_CLAIM.id}
              </span>
              <p className="text-neutral-500 mt-2">Date: 2026-09-21</p>
              <p className="text-emerald-700 font-bold mt-0.5">STATUS: VERIFIED ELIGIBLE</p>
            </div>
          </div>

          {/* Core Technical Specifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
            <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
              <span className="text-neutral-500 text-[10px] uppercase font-bold">Rolling Stock Asset</span>
              <p className="font-bold text-black mt-1 text-sm">{ACTIVE_CLAIM.assetId}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">CS-10 3-Car Rake</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
              <span className="text-neutral-500 text-[10px] uppercase font-bold">Part Serial (OCR)</span>
              <p className="font-bold text-black mt-1 text-sm">MB5085-2274-K</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Nameplate Matched</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
              <span className="text-neutral-500 text-[10px] uppercase font-bold">Supplier Failure Code</span>
              <p className="font-bold text-black mt-1 text-sm">{ACTIVE_CLAIM.failureCode}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">thermal_overload</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
              <span className="text-neutral-500 text-[10px] uppercase font-bold">Settlement Sum</span>
              <p className="font-bold text-black mt-1 text-sm">₹{ACTIVE_CLAIM.amountInr.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">¥872,000 Equivalent</p>
            </div>
          </div>

          {/* Bilateral Warranty Clause */}
          <div className="rounded-xl bg-neutral-50 p-6 border border-neutral-200 font-mono text-xs space-y-2">
            <p className="text-neutral-500 font-bold uppercase text-[10px]">
              Contractual Warranty Verification Clause (Article 14.2)
            </p>
            <p className="text-neutral-800 leading-relaxed font-sans text-sm">
              Component verified under original delivery warranty of Kochi Metro Line 1. Warranty remains active through{' '}
              <span className="text-black font-bold font-mono">{ACTIVE_CLAIM.warrantyExpires}</span>. Contractual response SLA is{' '}
              <span className="text-black font-bold font-mono">{oem.slaDays} calendar days</span> from electronic gateway timestamp.
            </p>
          </div>

          {/* Attached Cryptographic Evidence */}
          <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold">Attached Evidentiary Hashes</span>
              <p className="text-neutral-700">
                3 Artifacts: Nameplate OCR (sha256:4d8e), HMI Code (sha256:b2a7), Bogie Context (sha256:9f3c)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('payload')}
                className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 font-mono text-xs font-semibold text-black hover:bg-neutral-50"
              >
                Inspect Raw EDI XML
              </button>
              <button
                onClick={() => setActiveTab('dispatch')}
                className="rounded-full bg-black px-6 py-2.5 font-mono text-xs font-bold text-white hover:bg-neutral-800"
              >
                Proceed to Dispatch →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Raw Payload Viewer Tab ──────────────────────────────────── */}
      {activeTab === 'payload' && (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <span className="font-mono text-xs font-bold uppercase text-black">
              Compiled MELCO-WS XML Payload // Target Gateway Schema
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-1.5 font-mono text-xs font-bold text-black hover:bg-neutral-200 transition-colors"
            >
              <Icon name="copy" className="h-3.5 w-3.5" />
              <span>{copiedPayload ? 'Copied to Clipboard!' : 'Copy XML'}</span>
            </button>
          </div>

          <pre className="rounded-xl bg-neutral-900 p-6 font-mono text-xs text-neutral-200 leading-relaxed overflow-x-auto">
            {rawXmlPayload}
          </pre>
        </div>
      )}

      {/* ── Live API Gateway Dispatch Tab ───────────────────────────── */}
      {activeTab === 'dispatch' && (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-card p-8 space-y-8">
          <div className="border-b border-neutral-200 pb-6">
            <span className="font-mono text-xs font-bold uppercase text-neutral-500">
              Electronic Data Interchange (EDI) Transmission
            </span>
            <h2 className="text-2xl font-bold text-black mt-1">Direct Gateway Submission</h2>
            <p className="font-mono text-xs text-neutral-500 mt-1">
              Secure mutual TLS 1.3 connection to Mitsubishi MELCO-WS Portal (Kobe, Japan)
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-6 font-mono text-xs space-y-3">
            <div className="flex justify-between items-center text-neutral-600">
              <span>Endpoint:</span>
              <span className="text-black font-bold">https://supplier.melco-rail.jp/api/v3/warranty/claims</span>
            </div>
            <div className="flex justify-between items-center text-neutral-600">
              <span>Encryption:</span>
              <span className="text-black font-bold">TLS_AES_256_GCM_SHA384 (Verified)</span>
            </div>
            <div className="flex justify-between items-center text-neutral-600">
              <span>Authentication:</span>
              <span className="text-black font-bold">KMRL Client X.509 Certificate · Authority #8821</span>
            </div>
          </div>

          {dispatchStatus === 'idle' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="font-mono text-xs text-neutral-500">
                Ready to transmit signed voucher {ACTIVE_CLAIM.id}
              </span>
              <button
                onClick={handleDispatch}
                className="w-full sm:w-auto rounded-full bg-black px-8 py-4 font-mono text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
              >
                TRANSMIT CLAIM TO MITSUBISHI MELCO-WS
              </button>
            </div>
          )}

          {dispatchStatus === 'transmitting' && (
            <div className="rounded-xl bg-neutral-50 p-8 text-center border border-neutral-200 font-mono text-xs text-black space-y-3">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <p className="text-black font-bold text-sm">Performing mTLS Handshake & Cryptographic Hash Validation...</p>
              <p className="text-neutral-500">Transmitting 2.4 MB payload to MELCO-WS Kobe Gateway</p>
            </div>
          )}

          {dispatchStatus === 'confirmed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-neutral-50 border border-neutral-200 p-8 space-y-4 font-mono text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-black uppercase">
                  Claim Received & Acknowledged // HTTP 200 OK
                </span>
              </div>
              <p className="text-neutral-700 font-sans text-sm">
                Mitsubishi Electric Supplier Gateway has accepted Claim CLM-2481. Formal transaction receipt registered:
              </p>
              <div className="rounded-xl bg-white p-4 border border-neutral-200 space-y-1.5 text-neutral-700">
                <p>Transaction Ref: <span className="text-black font-bold">MELCO-ACK-20260921-88421</span></p>
                <p>SLA Adjudication Window: <span className="text-black font-bold">30 Calendar Days (Due: 2026-10-21)</span></p>
                <p>Settlement Pipeline: <span className="text-black font-bold">₹4,82,400 Approved for Review</span></p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={onContinue}
                  className="rounded-full bg-black px-6 py-2.5 font-mono text-xs font-semibold text-white hover:bg-neutral-800"
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
