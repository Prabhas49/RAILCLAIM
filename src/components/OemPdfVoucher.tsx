import React from 'react'
import type { FailureScenario } from '../data/mock'

interface OemPdfVoucherProps {
  scenario: FailureScenario
  onClose?: () => void
}

export function openPrintableVoucher(scenario: FailureScenario) {
  const printWindow = window.open('', '_blank', 'width=900,height=1100')
  if (!printWindow) {
    alert('Please allow popups to download/print the OEM Warranty Claim PDF.')
    return
  }

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>OEM_Warranty_Claim_${scenario.claimId}.pdf</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Helvetica Neue', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 11px;
      line-height: 1.45;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #000;
    }
    .brand-sub {
      font-size: 10px;
      color: #4b5563;
      margin-top: 2px;
      font-weight: bold;
    }
    .voucher-title {
      text-align: center;
      margin: 12px 0 16px 0;
      padding: 6px 0;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }
    .voucher-title h1 {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      color: #111827;
    }
    .voucher-title p {
      margin: 2px 0 0 0;
      font-size: 9px;
      color: #6b7280;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .grid-2 {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
    }
    .col {
      flex: 1;
    }
    .sec-header {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      background: #1e293b;
      color: #ffffff;
      padding: 4px 8px;
      margin-bottom: 6px;
      border-radius: 2px;
      display: flex;
      justify-content: space-between;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #e5e7eb;
      padding: 5px 8px;
      font-size: 10px;
      text-align: left;
    }
    table.data-table th {
      background-color: #f9fafb;
      color: #4b5563;
      font-weight: bold;
      width: 35%;
    }
    table.cost-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 14px;
    }
    table.cost-table th, table.cost-table td {
      border: 1px solid #d1d5db;
      padding: 6px 10px;
      font-size: 10px;
    }
    table.cost-table th {
      background: #f3f4f6;
      font-weight: bold;
      text-align: left;
    }
    table.cost-table td.num {
      text-align: right;
      font-family: monospace;
      font-weight: 600;
    }
    .total-row {
      background: #fef3c7 !important;
      font-weight: bold;
      font-size: 11px !important;
    }
    .transcript-box {
      border: 1px solid #e5e7eb;
      background: #fafafa;
      padding: 8px 10px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    .transcript-label {
      font-weight: bold;
      font-size: 9px;
      color: #6b7280;
      margin-bottom: 3px;
      text-transform: uppercase;
    }
    .transcript-source {
      font-style: italic;
      color: #1f2937;
      font-size: 10px;
      margin-bottom: 4px;
    }
    .transcript-trans {
      color: #0369a1;
      font-size: 10px;
      font-weight: 600;
    }
    .footer-sign {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 20px;
      border-top: 1px solid #d1d5db;
      padding-top: 12px;
    }
    .hanko-stamp {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 68px;
      height: 68px;
      border: 2px solid #dc2626;
      border-radius: 50%;
      color: #dc2626;
      font-weight: bold;
      font-size: 9px;
      text-align: center;
      line-height: 1.1;
      transform: rotate(-5deg);
    }
    .security-hash {
      font-family: monospace;
      font-size: 8px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 3px;
      word-break: break-all;
      margin-top: 4px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#0284c7; color:#fff; padding:10px 16px; margin:-24px -24px 20px -24px; display:flex; justify-content:space-between; align-items:center;">
    <span style="font-weight:bold; font-size:13px;">Hashi Setu // Official Japanese OEM Claim Generator</span>
    <button onclick="window.print()" style="background:#fff; color:#0284c7; border:none; padding:6px 14px; font-weight:bold; border-radius:4px; cursor:pointer;">
      ⎙ Print / Save as PDF
    </button>
  </div>

  <table class="header-table">
    <tr>
      <td style="vertical-align: top;">
        <div class="brand-title">HASHI SETU 橋・सेतु</div>
        <div class="brand-sub">BILATERAL JAPAN-INDIA ROLLING STOCK WARRANTY PLATFORM</div>
        <div style="font-size: 9px; color: #6b7280; margin-top: 2px;">
          OPERATING AUTHORITY: <strong>${scenario.operator}</strong> (${scenario.depot})
        </div>
      </td>
      <td style="text-align: right; vertical-align: top;">
        <div style="font-weight: bold; font-size: 12px; color: #111;">VOUCHER REF: ${scenario.claimId}</div>
        <div style="font-size: 9px; color: #6b7280;">DISPATCH DATE: 2026-09-22 09:45 JST / 06:15 IST</div>
        <div style="font-size: 9px; color: #dc2626; font-weight: bold; margin-top: 2px;">JIS E-4001 / JIS E-5006 COMPLIANT</div>
      </td>
    </tr>
  </table>

  <div class="voucher-title">
    <h1>【鉄道車両重要部品 品質保証請求書】</h1>
    <p>OFFICIAL OEM ROLLING STOCK DEFECT & WARRANTY CLAIM VOUCHER</p>
  </div>

  <div class="grid-2">
    <div class="col">
      <div class="sec-header">
        <span>1. SUPPLIER & CONTRACT RECIPIENT</span>
        <span>受取先情報</span>
      </div>
      <table class="data-table">
        <tr>
          <th>OEM Supplier</th>
          <td><strong>${scenario.oemName}</strong></td>
        </tr>
        <tr>
          <th>Headquarters</th>
          <td>${scenario.oemHq}</td>
        </tr>
        <tr>
          <th>Warranty Contract</th>
          <td>JICA-METRO-WARR-2024-C08</td>
        </tr>
        <tr>
          <th>Applicable Clause</th>
          <td><strong>${scenario.warrantyClause}</strong></td>
        </tr>
        <tr>
          <th>Portal Endpoint</th>
          <td>https://supplier.${scenario.oemId}-rail.jp/api/v3/warranty</td>
        </tr>
      </table>
    </div>

    <div class="col">
      <div class="sec-header">
        <span>2. ROLLING STOCK ASSET IDENTITY</span>
        <span>車両識別情報</span>
      </div>
      <table class="data-table">
        <tr>
          <th>Equipment Name</th>
          <td><strong>${scenario.equipment}</strong></td>
        </tr>
        <tr>
          <th>Model / Part No</th>
          <td>${scenario.model}</td>
        </tr>
        <tr>
          <th>Serial Number (OCR)</th>
          <td><strong style="color:#0369a1;">${scenario.serialNo}</strong></td>
        </tr>
        <tr>
          <th>Trainset / Car No</th>
          <td>KM-TS04 / DM-04A</td>
        </tr>
        <tr>
          <th>Run Hours / Mileage</th>
          <td>18,420 Hours (42,180 KM)</td>
        </tr>
      </table>
    </div>
  </div>

  <div class="sec-header">
    <span>3. DEFECT ANALYSIS & ROOT CAUSE CLASSIFICATION</span>
    <span>故障分類及び原因判定</span>
  </div>
  <table class="data-table" style="margin-bottom: 8px;">
    <tr>
      <th style="width: 20%;">Primary Fault Code</th>
      <td style="width: 30%;"><strong style="color:#dc2626;">${scenario.faultCode}</strong> (${scenario.jisCode})</td>
      <th style="width: 20%;">AI Validation Match</th>
      <td style="width: 30%; font-weight: bold; color: #16a34a;">${Math.round(scenario.confidence * 100)}% JIS Standard Fit</td>
    </tr>
    <tr>
      <th>Defect Description</th>
      <td colspan="3">${scenario.failureDescription}</td>
    </tr>
    <tr>
      <th>Technical Root Cause</th>
      <td colspan="3">${scenario.rootCause}</td>
    </tr>
  </table>

  <div class="sec-header">
    <span>4. MULTILINGUAL FIELD TELEMETRY & ASR PROVENANCE</span>
    <span>現地保全音声データ照合</span>
  </div>
  <div class="transcript-box">
    <div class="transcript-label">VERIFIED FIELD LOG // ${scenario.language.toUpperCase()} TELEMETRY (${scenario.crew})</div>
    <div class="transcript-source">"${scenario.transcript[0]?.source || ''}"</div>
    <div class="transcript-trans">➔ English/Japanese Translation: "${scenario.transcript[0]?.translation || ''}"</div>
  </div>

  <div class="sec-header">
    <span>5. ITEMIZED WARRANTY RECOVERY CLAIM LEDGER</span>
    <span>保証請求明細書 (INR ↔ JPY)</span>
  </div>
  <table class="cost-table">
    <thead>
      <tr>
        <th>Recovery Item Description</th>
        <th>Standard Code</th>
        <th style="text-align: right;">Amount (INR ₹)</th>
        <th style="text-align: right;">Amount (JPY ¥)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>OEM Core Replacement / Subassembly Unit (${scenario.model})</td>
        <td>BOM-REP-01</td>
        <td class="num">₹${scenario.costs.partReplacementInr.toLocaleString('en-IN')}</td>
        <td class="num">¥${scenario.costs.partReplacementJpy.toLocaleString('ja-JP')}</td>
      </tr>
      <tr>
        <td>Depot Certified Rolling Stock Labor & Bogie Drop (48 Man-Hours)</td>
        <td>LBR-OPS-22</td>
        <td class="num">₹${scenario.costs.laborInr.toLocaleString('en-IN')}</td>
        <td class="num">¥${scenario.costs.laborJpy.toLocaleString('ja-JP')}</td>
      </tr>
      <tr>
        <td>Demurrage & JIS E-4001 Diagnostic Recalibration Testing</td>
        <td>TEST-CERT-09</td>
        <td class="num">₹${scenario.costs.testingInr.toLocaleString('en-IN')}</td>
        <td class="num">¥${scenario.costs.testingJpy.toLocaleString('ja-JP')}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2" style="text-transform: uppercase;">Total Indemnity Claimed (請求合計金額)</td>
        <td class="num">₹${scenario.amountInr.toLocaleString('en-IN')}</td>
        <td class="num">¥${scenario.amountJpy.toLocaleString('ja-JP')}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer-sign">
    <div>
      <div style="font-size: 9px; font-weight: bold; color: #4b5563;">CRYPTOGRAPHIC PROVENANCE // IMMUTABLE AUDIT TRAIL</div>
      <div class="security-hash">SHA256: 4f8a912e73d4c51b90aa184f0923ec18b8f2a6470de239841bbce82910fa3129</div>
      <div style="font-size: 8px; color: #6b7280; margin-top: 3px;">
        Digital Signature Verified · ISO/IEC 27001 & Japanese Rail Safety Standard No. 42
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 16px;">
      <div class="hanko-stamp">
        <span>検印</span>
        <span style="font-size:7px;">APPROVED</span>
        <span style="font-size:8px; font-weight:900;">PRAGNA</span>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 11px; font-weight: 800; color: #111;">Pragna Rao</div>
        <div style="font-size: 9px; color: #4b5563;">Chief Rolling Stock Engineer</div>
        <div style="font-size: 9px; color: #6b7280;">KMRL Rolling Stock Division · Depot Sign-off</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto open print dialog if requested
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

export default function OemPdfVoucherModal({
  scenario,
  onClose,
}: OemPdfVoucherProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-[#262626] bg-[#0c0c0c] p-6 shadow-2xl text-white my-8">
        <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-[#00c2ff] animate-pulse" />
            <h2 className="text-lg font-bold tracking-tight text-white">
              Official Japanese OEM Warranty Claim Voucher (JIS E-4001)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openPrintableVoucher(scenario)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00c2ff] px-4 py-2 text-xs font-bold text-black hover:bg-[#33ceff] transition-all shadow-md active:scale-95"
            >
              <span>⎙ Download / Print PDF</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg border border-[#262626] bg-[#141414] px-3 py-2 text-xs text-[#a1a1aa] hover:text-white"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Voucher Preview Body */}
        <div className="mt-5 rounded-xl border border-[#222] bg-[#121212] p-6 font-sans text-xs text-neutral-300">
          <div className="flex justify-between items-start border-b border-[#2a2a2a] pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#00c2ff] font-bold">
                BILATERAL WARRANTY RECOVERY
              </p>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {scenario.operator} ↔ {scenario.oemName}
              </h3>
              <p className="text-xs text-[#71717a] mt-0.5">
                Voucher Ref: <span className="font-mono text-white">{scenario.claimId}</span> · Depot: {scenario.depot}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-400">
                JIS COMPLIANT // APPROVED
              </span>
              <p className="font-mono text-[10px] text-[#71717a] mt-1.5">
                Inspector: <span className="text-white font-bold">Pragna Rao</span>
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#222] bg-[#181818] p-4">
              <span className="text-[10px] font-mono text-[#71717a] uppercase font-bold">
                Equipment & Serial Identification
              </span>
              <p className="text-sm font-bold text-white mt-1">{scenario.equipment}</p>
              <p className="text-xs text-[#00c2ff] font-mono mt-0.5">Part: {scenario.model} · Serial: {scenario.serialNo}</p>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                Warranty Clause: <strong className="text-neutral-200">{scenario.warrantyClause}</strong>
              </p>
            </div>

            <div className="rounded-lg border border-[#222] bg-[#181818] p-4">
              <span className="text-[10px] font-mono text-[#71717a] uppercase font-bold">
                Defect & Telemetry Verification
              </span>
              <p className="text-sm font-bold text-amber-400 mt-1">Fault Code: {scenario.faultCode}</p>
              <p className="text-xs text-[#aaa] mt-0.5">{scenario.failureDescription}</p>
              <p className="text-xs text-[#71717a] font-mono mt-2">
                Acoustic Log ({scenario.language}): "{scenario.transcript[0]?.source}"
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#222] bg-[#181818] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-[#71717a] uppercase font-bold">
                Total Indemnity Claim Amount
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-black text-white font-mono">
                  ₹{scenario.amountInr.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-bold text-[#00c2ff] font-mono">
                  (¥{scenario.amountJpy.toLocaleString('ja-JP')})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center h-14 w-14 rounded-full border-2 border-red-500 text-red-500 text-[8px] font-black -rotate-12">
                <span>検印</span>
                <span className="text-[7px]">PRAGNA</span>
              </div>
              <button
                onClick={() => openPrintableVoucher(scenario)}
                className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
