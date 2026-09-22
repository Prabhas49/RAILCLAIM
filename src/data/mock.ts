import type {
  AuditEvent,
  CaptureMeta,
  Claim,
  ClaimField,
  ComplianceCheck,
  EvidencePhoto,
  Oem,
  OemId,
  PipelineStage,
  TranscriptLine,
} from '../types'

export const OEMS: Oem[] = [
  {
    id: 'mitsubishi',
    name: 'Mitsubishi',
    legalName: 'Mitsubishi Electric Transportation Systems',
    hq: 'Kobe, Japan',
    portal: 'MELCO-WS / Supplier Web',
    accent: 'rose',
    slaDays: 30,
    requiredFields: ['failure_code', 'serial_no', 'labor_op', 'asset_id', 'running_hours'],
  },
  {
    id: 'hitachi',
    name: 'Hitachi',
    legalName: 'Hitachi Rail STS',
    hq: 'Tokyo, Japan',
    portal: 'HiWarranty Portal',
    accent: 'indigo',
    slaDays: 21,
    requiredFields: ['failure_code', 'serial_no', 'labor_op', 'depot_code', 'photo_evidence'],
  },
  {
    id: 'toshiba',
    name: 'Toshiba',
    legalName: 'Toshiba Infrastructure Systems & Solutions',
    hq: 'Fuchu, Tokyo, Japan',
    portal: 'Toshiba Rail EDI Gateway',
    accent: 'amber',
    slaDays: 28,
    requiredFields: ['failure_code', 'serial_no', 'labor_op', 'asset_id', 'photo_evidence'],
  },
  {
    id: 'kawasaki',
    name: 'Kawasaki',
    legalName: 'Kawasaki Heavy Industries Rolling Stock',
    hq: 'Kobe, Japan',
    portal: 'KHI After-Sales Desk',
    accent: 'sky',
    slaDays: 45,
    requiredFields: ['failure_code', 'serial_no', 'asset_id', 'photo_evidence', 'warranty_proof'],
  },
]

export const OEM_BY_ID = Object.fromEntries(OEMS.map((o) => [o.id, o])) as Record<OemId, Oem>

/**
 * The same claim must be re-keyed for each OEM portal — field names, casing and
 * accepted code formats all differ. This is the table that mapping step reads.
 */
export const OEM_SCHEMA: Record<string, Record<OemId, string>> = {
  failure_code: { mitsubishi: 'FAIL_CD', hitachi: 'FaultCode', kawasaki: 'fault_code', toshiba: 'ERR_CODE' },
  serial_no: { mitsubishi: 'SER_NO', hitachi: 'SerialNumber', kawasaki: 'part_serial', toshiba: 'SERIAL_NUM' },
  labor_op: { mitsubishi: 'LBR_OP', hitachi: 'LabourOperation', kawasaki: 'labor_code', toshiba: 'OP_CODE' },
  asset_id: { mitsubishi: 'CAR_EQP_ID', hitachi: 'AssetRef', kawasaki: 'equipment_id', toshiba: 'VEHICLE_EQ_ID' },
  running_hours: { mitsubishi: 'MILEAGE_HRS', hitachi: 'OperatingHours', kawasaki: 'run_hours', toshiba: 'TOTAL_HOURS' },
  symptom: { mitsubishi: 'FAIL_DESC', hitachi: 'SymptomCategory', kawasaki: 'symptom_class', toshiba: 'SYMPTOM_TXT' },
  depot_code: { mitsubishi: 'DEPOT', hitachi: 'DepotCode', kawasaki: 'depot_ref', toshiba: 'DEPOT_ID' },
  photo_evidence: { mitsubishi: 'ATTACH_REF', hitachi: 'PhotoEvidence', kawasaki: 'evid_ref', toshiba: 'ATTACH_DOC' },
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'asr',
    label: 'Speech recognition',
    blurb: 'Rail-jargon-tuned ASR',
    detail: 'Transcribing Tamil voice note with a railway vocabulary bias list',
    durationMs: 2100,
  },
  {
    id: 'translate',
    label: 'Translation',
    blurb: 'Tamil → English / Japanese',
    detail: 'Translating while pinning technical terms so they survive intact',
    durationMs: 1700,
  },
  {
    id: 'ocr',
    label: 'Vision & OCR',
    blurb: 'Serial + fault-code extraction',
    detail: 'Reading nameplate and HMI display from 3 attached photos',
    durationMs: 2400,
  },
  {
    id: 'extract',
    label: 'Entity extraction',
    blurb: 'Prose → structured fields',
    detail: 'Mapping free-text symptoms onto the OEM failure taxonomy',
    durationMs: 1900,
  },
  {
    id: 'oem_map',
    label: 'OEM schema mapper',
    blurb: 'Portal field alignment',
    detail: 'Re-keying 8 fields into Mitsubishi MELCO-WS format',
    durationMs: 1500,
  },
  {
    id: 'compliance',
    label: 'Compliance check',
    blurb: 'Pre-submission validation',
    detail: 'Validating warranty window, labor codes and mandatory attachments',
    durationMs: 1600,
  },
]

export const LANGUAGES = [
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
]

export const CAPTURE_META: CaptureMeta = {
  gps: '9.9937° N, 76.2987° E',
  assetId: 'RS-10-KM-0421',
  crewId: 'KM-DEP2-T04 · R. Karthik',
  capturedAt: '2026-09-21 06:42 IST',
  ambientTemp: '34 °C',
  runningHours: '18,420 h',
}

export const ACTIVE_CLAIM = {
  id: 'CLM-2481',
  assetId: 'RS-10-KM-0421',
  assetName: 'Traction Motor · MB-5085-A',
  depot: 'Kochi Metro · Muttom Depot',
  operator: 'Kochi Metro Rail Ltd',
  oem: 'mitsubishi' as OemId,
  crew: 'R. Karthik',
  crewInitials: 'RK',
  language: 'Tamil',
  raisedAt: '2026-09-21T06:42:00+05:30',
  ageDays: 0,
  amountInr: 482400,
  confidence: 0.89,
  failureCode: 'F042',
  symptom: 'thermal_overload',
  warrantyExpires: '2027-03-14',
  coacheset: 'CS-10 · 3-car',
}

export const TRANSCRIPT: TranscriptLine[] = [
  {
    id: 't1',
    source: 'டிராக்ஷன் மோட்டார் அதிக சூடாகிறது, நாற்பது நிமிட ஓட்டத்திலேயே வாசனை வருகிறது.',
    translation:
      'The traction motor is overheating badly — we get a burning smell within forty minutes of running.',
    terms: ['traction motor', 'overheating'],
    startMs: 0,
  },
  {
    id: 't2',
    source: 'எண்பது கிமீ வேகத்தில் வெப்பநிலை நூற்று நாற்பத்தைந்து டிகிரி காட்டுகிறது.',
    translation: 'At 80 km/h the temperature readout shows 145 degrees.',
    terms: ['145 °C', '80 km/h'],
    startMs: 6400,
  },
  {
    id: 't3',
    source: 'IGBT பால்ட் கோட் E-042 காட்டுகிறது, இரண்டு முறை வந்தது.',
    translation: 'It shows the IGBT fault code E-042, it came up twice.',
    terms: ['IGBT', 'E-042'],
    startMs: 11800,
  },
  {
    id: 't4',
    source: 'நேற்று இரவு ஷிப்டில் மோட்டாரை மாற்றினோம், அதன் பின் இந்த பிரச்சனை.',
    translation: 'We swapped the motor during last night’s shift, and this problem started after that.',
    terms: ['motor swap', 'night shift'],
    startMs: 17200,
  },
  {
    id: 't5',
    source: 'நேம்பர் பிளேட்டில் சீரியல் எண் கொஞ்சம் தெளிவாக இல்லை, படம் எடுத்திருக்கேன்.',
    translation:
      'The serial number on the nameplate is a bit unclear — I have photographed it though.',
    terms: ['nameplate', 'serial'],
    startMs: 23100,
  },
]

export const EVIDENCE_PHOTOS: EvidencePhoto[] = [
  {
    id: 'p1',
    caption: 'Nameplate — traction motor',
    kind: 'nameplate',
    annotations: [
      { id: 'a1', label: 'Serial', value: 'MB5085-2274-K', confidence: 0.91, x: 12, y: 34, w: 54, h: 13 },
      { id: 'a2', label: 'Mfg. date', value: '2023-03', confidence: 0.96, x: 12, y: 55, w: 38, h: 12 },
    ],
  },
  {
    id: 'p2',
    caption: 'HMI fault display',
    kind: 'hmi',
    annotations: [
      { id: 'a3', label: 'Code', value: 'E-042', confidence: 0.94, x: 26, y: 40, w: 44, h: 20 },
      { id: 'a4', label: 'Temp', value: '145 °C', confidence: 0.88, x: 58, y: 68, w: 30, h: 13 },
    ],
  },
  {
    id: 'p3',
    caption: 'Installation context',
    kind: 'context',
    annotations: [],
  },
]

export const CLAIM_FIELDS: ClaimField[] = [
  {
    id: 'failure_code',
    label: 'Failure code',
    value: 'F042',
    confidence: 0.87,
    source: 'photo',
    oemRequired: true,
    note: 'HMI showed E-042 — translated to OEM taxonomy code F042.',
  },
  {
    id: 'symptom',
    label: 'Symptom category',
    value: 'thermal_overload',
    confidence: 0.94,
    source: 'voice',
    oemRequired: true,
  },
  {
    id: 'serial_no',
    label: 'Part serial number',
    value: 'MB5085-2274-K',
    confidence: 0.91,
    source: 'photo',
    oemRequired: true,
    note: 'Recovered from nameplate OCR; crew flagged it as hard to read.',
  },
  {
    id: 'asset_id',
    label: 'Asset / equipment ID',
    value: 'RS-10-KM-0421',
    confidence: 0.99,
    source: 'metadata',
    oemRequired: true,
  },
  {
    id: 'running_hours',
    label: 'Running hours',
    value: '18,420 h',
    confidence: 0.99,
    source: 'metadata',
    oemRequired: true,
  },
  {
    id: 'speed_at_fault',
    label: 'Speed at fault',
    value: '80 km/h',
    confidence: 0.96,
    source: 'voice',
    oemRequired: false,
  },
  {
    id: 'observed_temp',
    label: 'Observed temperature',
    value: '145 °C',
    confidence: 0.93,
    source: 'voice',
    oemRequired: false,
  },
  {
    id: 'labor_op',
    label: 'Labour operation code',
    value: 'TMO-114',
    confidence: 0.58,
    source: 'inferred',
    oemRequired: true,
    note: 'Best match for a motor swap. Needs a human to confirm before submission.',
  },
  {
    id: 'depot_code',
    label: 'Depot code',
    value: 'KM-MUT-02',
    confidence: 0.99,
    source: 'metadata',
    oemRequired: true,
  },
  {
    id: 'photo_evidence',
    label: 'Photo evidence',
    value: '3 attachments · 4.2 MB',
    confidence: 1,
    source: 'metadata',
    oemRequired: true,
  },
]

export const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  {
    id: 'c1',
    rule: 'Warranty window',
    detail: 'Asset in warranty until 2027-03-14 — 174 days remaining.',
    state: 'pass',
  },
  {
    id: 'c2',
    rule: 'Failure code in OEM catalogue',
    detail: 'F042 exists in the Mitsubishi MB-5085 fault taxonomy.',
    state: 'pass',
  },
  {
    id: 'c3',
    rule: 'Mandatory attachments',
    detail: 'Nameplate, HMI display and context photo all attached.',
    state: 'pass',
  },
  {
    id: 'c4',
    rule: 'Labour operation code',
    detail: 'TMO-114 inferred at 58% confidence. Human confirmation required.',
    state: 'warn',
  },
  {
    id: 'c5',
    rule: 'Serial number legibility',
    detail: 'Nameplate OCR at 91%. Accepted, but marked as low-quality evidence.',
    state: 'warn',
  },
  {
    id: 'c6',
    rule: 'Submission window',
    detail: 'Raised 0 days ago — well inside the 30-day contractual window.',
    state: 'pass',
  },
]

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'e1',
    at: '2026-09-21 06:42:11',
    actor: 'R. Karthik',
    action: 'Voice note captured',
    detail: 'Tamil · 26.4 s · device KM-DEP2-T04',
    kind: 'capture',
    hash: '0x8f21c4',
  },
  {
    id: 'e2',
    at: '2026-09-21 06:43:02',
    actor: 'R. Karthik',
    action: '3 photos attached',
    detail: 'Nameplate, HMI display, installation context',
    kind: 'capture',
    hash: '0x1a77de',
  },
  {
    id: 'e3',
    at: '2026-09-21 06:43:40',
    actor: 'Pipeline',
    action: 'ASR + translation complete',
    detail: '5 utterances · technical terms preserved',
    kind: 'ai',
    hash: '0x44b190',
  },
  {
    id: 'e4',
    at: '2026-09-21 06:44:16',
    actor: 'Pipeline',
    action: 'OCR extraction complete',
    detail: '4 annotations · serial MB5085-2274-K',
    kind: 'ai',
    hash: '0x9c02fa',
  },
  {
    id: 'e5',
    at: '2026-09-21 06:45:03',
    actor: 'Pipeline',
    action: 'Mapped to Mitsubishi schema',
    detail: '8 fields re-keyed into MELCO-WS format',
    kind: 'ai',
    hash: '0x2de881',
  },
  {
    id: 'e6',
    at: '2026-09-21 06:45:31',
    actor: 'Pipeline',
    action: 'Compliance check raised 2 warnings',
    detail: 'Low-confidence labour code and serial legibility',
    kind: 'system',
    hash: '0x77ac13',
  },
  {
    id: 'e7',
    at: '2026-09-21 07:10:54',
    actor: 'S. Iyer · Warranty Admin',
    action: 'Labour code confirmed',
    detail: 'TMO-114 accepted after depot supervisor check',
    kind: 'human',
    hash: '0xb3106e',
  },
]

export const CLAIM_QUEUE: Claim[] = [
  {
    id: 'CLM-2481',
    assetId: 'RS-10-KM-0421',
    assetName: 'Traction Motor · MB-5085-A',
    depot: 'Kochi Metro · Muttom',
    operator: 'Kochi Metro Rail Ltd',
    oem: 'mitsubishi',
    crew: 'R. Karthik',
    crewInitials: 'RK',
    language: 'Tamil',
    raisedAt: '2026-09-21T06:42:00+05:30',
    ageDays: 0,
    status: 'ready',
    amountInr: 482400,
    confidence: 0.89,
    failureCode: 'F042',
    symptom: 'thermal_overload',
  },
  {
    id: 'CLM-2478',
    assetId: 'VVVF-03-CM-0117',
    assetName: 'VVVF Inverter · HIVECTOL',
    depot: 'Chennai Metro · Koyambedu',
    operator: 'Chennai Metro Rail Ltd',
    oem: 'hitachi',
    crew: 'M. Priya',
    crewInitials: 'MP',
    language: 'Tamil',
    raisedAt: '2026-09-18T14:20:00+05:30',
    ageDays: 3,
    status: 'needs_info',
    amountInr: 761200,
    confidence: 0.64,
    failureCode: 'INV-311',
    symptom: 'gating_failure',
    blocker: 'Serial number unreadable — RFI awaited from depot',
  },
  {
    id: 'CLM-2465',
    assetId: 'BRK-07-MM-0088',
    assetName: 'Brake Caliper · Knorr',
    depot: 'Mumbai Metro L3 · Aarey',
    operator: 'MMRCL',
    oem: 'kawasaki',
    crew: 'A. Deshmukh',
    crewInitials: 'AD',
    language: 'Marathi',
    raisedAt: '2026-09-14T09:05:00+05:30',
    ageDays: 7,
    status: 'submitted',
    amountInr: 218000,
    confidence: 0.93,
    failureCode: 'BRK-092',
    symptom: 'seal_leak',
  },
  {
    id: 'CLM-2459',
    assetId: 'HVC-02-BM-0231',
    assetName: 'HVAC Unit · Coach 2',
    depot: 'Bengaluru Metro · Peenya',
    operator: 'BMRCL',
    oem: 'mitsubishi',
    crew: 'S. Gowda',
    crewInitials: 'SG',
    language: 'Kannada',
    raisedAt: '2026-09-09T17:48:00+05:30',
    ageDays: 12,
    status: 'submitted',
    amountInr: 156700,
    confidence: 0.9,
    failureCode: 'CLG-204',
    symptom: 'compressor_trip',
  },
  {
    id: 'CLM-2451',
    assetId: 'DO-05-NM-0142',
    assetName: 'Door Operator · Slider',
    depot: 'Nagpur Metro · Kasturchand',
    operator: 'Maha Metro',
    oem: 'hitachi',
    crew: 'P. Meshram',
    crewInitials: 'PM',
    language: 'Hindi',
    raisedAt: '2026-09-05T11:32:00+05:30',
    ageDays: 16,
    status: 'needs_info',
    amountInr: 92400,
    confidence: 0.71,
    failureCode: 'DOR-118',
    symptom: 'obstruction_fault',
    blocker: 'Labour operation code rejected by Hitachi portal',
  },
  {
    id: 'CLM-2444',
    assetId: 'AUX-09-BM-0076',
    assetName: 'Auxiliary Converter',
    depot: 'Bengaluru Metro · Byappanahalli',
    operator: 'BMRCL',
    oem: 'kawasaki',
    crew: 'T. Rao',
    crewInitials: 'TR',
    language: 'Telugu',
    raisedAt: '2026-08-28T08:15:00+05:30',
    ageDays: 24,
    status: 'reimbursed',
    amountInr: 634900,
    confidence: 0.95,
    failureCode: 'AUX-455',
    symptom: 'dc_link_ripple',
  },
  {
    id: 'CLM-2438',
    assetId: 'PAN-01-DM-0002',
    assetName: 'Pantograph · Roof assembly',
    depot: 'Delhi Metro · Najafgarh',
    operator: 'DMRC',
    oem: 'mitsubishi',
    crew: 'V. Chauhan',
    crewInitials: 'VC',
    language: 'Hindi',
    raisedAt: '2026-08-26T19:02:00+05:30',
    ageDays: 26,
    status: 'rejected',
    amountInr: 342800,
    confidence: 0.52,
    failureCode: null,
    symptom: 'contact_strip_wear',
    blocker: 'Rejected — submitted outside the 30-day warranty window',
  },
  {
    id: 'CLM-2431',
    assetId: 'WHL-04-LM-0099',
    assetName: 'Wheel Bearing · Axle 4',
    depot: 'Lucknow Metro · Transport Nagar',
    operator: 'UPMRC',
    oem: 'hitachi',
    crew: 'N. Verma',
    crewInitials: 'NV',
    language: 'Hindi',
    raisedAt: '2026-08-21T05:55:00+05:30',
    ageDays: 31,
    status: 'submitted',
    amountInr: 289500,
    confidence: 0.86,
    failureCode: 'WHL-330',
    symptom: 'bearing_seizure',
  },
]

export function claimsByOem(oem: OemId) {
  return CLAIM_QUEUE.filter((c) => c.oem === oem)
}

export interface FailureScenario {
  id: '1' | '2' | '3'
  title: string
  subtitle: string
  equipment: string
  model: string
  serialNo: string
  oemId: OemId
  oemName: string
  oemHq: string
  operator: string
  depot: string
  claimId: string
  faultCode: string
  jisCode: string
  symptom: string
  failureDescription: string
  rootCause: string
  warrantyClause: string
  amountInr: number
  amountJpy: number
  confidence: number
  language: string
  crew: string
  crewInitials: string
  transcript: TranscriptLine[]
  nameplateSvg: string
  hmiSvg: string
  contextSvg: string
  costs: {
    partReplacementInr: number
    partReplacementJpy: number
    laborInr: number
    laborJpy: number
    testingInr: number
    testingJpy: number
  }
}

const SVG_TM_NAMEPLATE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="40" y="40" width="520" height="320" rx="12" fill="%230e0e0e" stroke="%23222222" stroke-width="2"/><rect x="70" y="80" width="460" height="120" rx="8" fill="%23000000" stroke="%23ffffff" stroke-width="1.5" stroke-dasharray="4"/><text x="90" y="115" fill="%23888888" font-family="monospace" font-size="13" font-weight="bold">OCR DETECTED [98% CONFIDENCE]</text><text x="90" y="155" fill="%2300C2FF" font-family="monospace" font-size="28" font-weight="900">MB5085-2274-K</text><text x="90" y="180" fill="%23aaaaaa" font-family="monospace" font-size="13">MFG: 2023-03 · JIS-E-4001 COMPLIANT</text><text x="70" y="240" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold">MITSUBISHI ELECTRIC ROLLING STOCK DIVISION</text><text x="70" y="270" fill="%23888888" font-family="monospace" font-size="13">TRACTION MOTOR TM-450 · 220 kW · 18,420 RUNNING HOURS</text><circle cx="500" cy="300" r="26" fill="%2310b981" fill-opacity="0.1" stroke="%2310b981" stroke-width="2"/><path d="M492 300 l6 6 l14 -14" fill="none" stroke="%2310b981" stroke-width="3" stroke-linecap="round"/></svg>`
const SVG_TM_HMI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="40" y="40" width="520" height="320" rx="8" fill="%230e0e0e" stroke="%23ef4444" stroke-width="2"/><rect x="70" y="70" width="460" height="70" fill="%23260a0a" rx="6"/><text x="90" y="112" fill="%23f87171" font-family="sans-serif" font-size="18" font-weight="bold">⚠ TCMS FAULT ALERT // TRAIN SET 04</text><rect x="70" y="160" width="220" height="160" fill="%23000000" rx="8" stroke="%23f59e0b" stroke-width="2"/><text x="90" y="200" fill="%23888888" font-family="monospace" font-size="13">FAULT CODE [98%]</text><text x="90" y="255" fill="%23f59e0b" font-family="monospace" font-size="38" font-weight="bold">E-TM-204</text><text x="90" y="295" fill="%23f87171" font-family="monospace" font-size="12">VIBRATION > 7.2 mm/s RMS</text><rect x="310" y="160" width="220" height="160" fill="%23000000" rx="8" stroke="%23222222" stroke-width="1"/><text x="330" y="200" fill="%23888888" font-family="monospace" font-size="13">COMPONENT ID</text><text x="330" y="255" fill="%23ffffff" font-family="monospace" font-size="34" font-weight="bold">TM-04-A</text><text x="330" y="295" fill="%23a1a1aa" font-family="monospace" font-size="12">SPEED: 82.4 KM/H</text></svg>`
const SVG_TM_CONTEXT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><circle cx="160" cy="220" r="100" fill="%230e0e0e" stroke="%23262626" stroke-width="6"/><circle cx="160" cy="220" r="40" fill="%23000000" stroke="%23ffffff" stroke-width="2"/><circle cx="440" cy="220" r="100" fill="%230e0e0e" stroke="%23262626" stroke-width="6"/><circle cx="440" cy="220" r="40" fill="%23000000" stroke="%23ffffff" stroke-width="2"/><rect x="80" y="120" width="440" height="24" rx="4" fill="%231a1a1a" stroke="%23333333" stroke-width="2"/><rect x="220" y="160" width="160" height="90" rx="8" fill="%23000000" stroke="%2300C2FF" stroke-width="1.5" stroke-dasharray="6"/><text x="235" y="200" fill="%2300C2FF" font-family="monospace" font-size="13" font-weight="bold">TRACTION MOTOR BAY</text><text x="235" y="225" fill="%23888888" font-family="monospace" font-size="12">MUTTOM DEPOT BAY #4</text><text x="50" y="360" fill="%23888888" font-family="monospace" font-size="13">DEPOT INSPECTION ANGLE 1 // KOCHI METRO</text></svg>`

const SVG_BCU_NAMEPLATE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="40" y="40" width="520" height="320" rx="12" fill="%230e0e0e" stroke="%23222222" stroke-width="2"/><rect x="70" y="80" width="460" height="120" rx="8" fill="%23000000" stroke="%23ffffff" stroke-width="1.5" stroke-dasharray="4"/><text x="90" y="115" fill="%23888888" font-family="monospace" font-size="13" font-weight="bold">OCR DETECTED [97% CONFIDENCE]</text><text x="90" y="155" fill="%236366F1" font-family="monospace" font-size="28" font-weight="900">NAB-HIT-9941-B</text><text x="90" y="180" fill="%23aaaaaa" font-family="monospace" font-size="13">MFG: 2023-08 · JIS-E-4112 COMPLIANT</text><text x="70" y="240" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold">HITACHI RAIL STS / NABTESCO</text><text x="70" y="270" fill="%23888888" font-family="monospace" font-size="13">MICROPROCESSOR BRAKE CONTROL BCU-80 · 7.5 BAR</text><circle cx="500" cy="300" r="26" fill="%2310b981" fill-opacity="0.1" stroke="%2310b981" stroke-width="2"/><path d="M492 300 l6 6 l14 -14" fill="none" stroke="%2310b981" stroke-width="3" stroke-linecap="round"/></svg>`
const SVG_BCU_HMI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="40" y="40" width="520" height="320" rx="8" fill="%230e0e0e" stroke="%23f59e0b" stroke-width="2"/><rect x="70" y="70" width="460" height="70" fill="%23241505" rx="6"/><text x="90" y="112" fill="%23f59e0b" font-family="sans-serif" font-size="18" font-weight="bold">⚠ TCMS PNEUMATIC BRAKE FAULT // SET 02</text><rect x="70" y="160" width="220" height="160" fill="%23000000" rx="8" stroke="%23ef4444" stroke-width="2"/><text x="90" y="200" fill="%23888888" font-family="monospace" font-size="13">FAULT CODE [97%]</text><text x="90" y="255" fill="%23ef4444" font-family="monospace" font-size="38" font-weight="bold">E-BK-102</text><text x="90" y="295" fill="%23f87171" font-family="monospace" font-size="12">MAIN RES DROP &lt; 6.4 BAR</text><rect x="310" y="160" width="220" height="160" fill="%23000000" rx="8" stroke="%23222222" stroke-width="1"/><text x="330" y="200" fill="%23888888" font-family="monospace" font-size="13">COMPONENT ID</text><text x="330" y="255" fill="%23ffffff" font-family="monospace" font-size="34" font-weight="bold">BCU-02-B</text><text x="330" y="295" fill="%23a1a1aa" font-family="monospace" font-size="12">PRESS: 6.2 BAR (WARN)</text></svg>`
const SVG_BCU_CONTEXT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="80" y="90" width="440" height="180" rx="8" fill="%23111827" stroke="%23374151" stroke-width="3"/><rect x="120" y="130" width="160" height="100" rx="6" fill="%23030712" stroke="%236366f1" stroke-width="2"/><circle cx="340" cy="180" r="30" fill="%231f2937" stroke="%23ef4444" stroke-width="2"/><circle cx="420" cy="180" r="30" fill="%231f2937" stroke="%2310b981" stroke-width="2"/><text x="135" y="175" fill="%236366f1" font-family="monospace" font-size="12" font-weight="bold">BCU MANIFOLD</text><text x="135" y="195" fill="%239ca3af" font-family="monospace" font-size="11">VALVE BANK #2</text><text x="50" y="340" fill="%23888888" font-family="monospace" font-size="13">PNEUMATIC UNDERFRAME // CHENNAI KOYAMBEDU</text></svg>`

const SVG_APU_NAMEPLATE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="40" y="40" width="520" height="320" rx="12" fill="%230e0e0e" stroke="%23222222" stroke-width="2"/><rect x="70" y="80" width="460" height="120" rx="8" fill="%23000000" stroke="%23ffffff" stroke-width="1.5" stroke-dasharray="4"/><text x="90" y="115" fill="%23888888" font-family="monospace" font-size="13" font-weight="bold">OCR DETECTED [99% CONFIDENCE]</text><text x="90" y="155" fill="%23F59E0B" font-family="monospace" font-size="28" font-weight="900">TOSH-APU-8820-X</text><text x="90" y="180" fill="%23aaaaaa" font-family="monospace" font-size="13">MFG: 2022-11 · JIS-E-5006 COMPLIANT</text><text x="70" y="240" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold">TOSHIBA INFRASTRUCTURE SYSTEMS</text><text x="70" y="270" fill="%23888888" font-family="monospace" font-size="13">STATIC INVERTER APU-120 · 415V 3-PHASE · 120 kVA</text><circle cx="500" cy="300" r="26" fill="%2310b981" fill-opacity="0.1" stroke="%2310b981" stroke-width="2"/><path d="M492 300 l6 6 l14 -14" fill="none" stroke="%2310b981" stroke-width="3" stroke-linecap="round"/></svg>`
const SVG_APU_HMI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="40" y="40" width="520" height="320" rx="8" fill="%230e0e0e" stroke="%23ef4444" stroke-width="2"/><rect x="70" y="70" width="460" height="70" fill="%23291307" rx="6"/><text x="90" y="112" fill="%23f59e0b" font-family="sans-serif" font-size="18" font-weight="bold">⚠ TCMS AUX POWER TRIP // TRAIN SET 07</text><rect x="70" y="160" width="220" height="160" fill="%23000000" rx="8" stroke="%23ef4444" stroke-width="2"/><text x="90" y="200" fill="%23888888" font-family="monospace" font-size="13">FAULT CODE [99%]</text><text x="90" y="255" fill="%23ef4444" font-family="monospace" font-size="38" font-weight="bold">E-APU-309</text><text x="90" y="295" fill="%23f87171" font-family="monospace" font-size="12">IGBT OVERHEAT TRIP 88°C</text><rect x="310" y="160" width="220" height="160" fill="%23000000" rx="8" stroke="%23222222" stroke-width="1"/><text x="330" y="200" fill="%23888888" font-family="monospace" font-size="13">COMPONENT ID</text><text x="330" y="255" fill="%23ffffff" font-family="monospace" font-size="34" font-weight="bold">INV-07-C</text><text x="330" y="295" fill="%23a1a1aa" font-family="monospace" font-size="12">LOAD: 104% (PEAK AC)</text></svg>`
const SVG_APU_CONTEXT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050505"/><rect x="60" y="110" width="480" height="140" rx="10" fill="%231c1917" stroke="%2378350f" stroke-width="3"/><rect x="100" y="130" width="180" height="100" rx="6" fill="%230c0a09" stroke="%23d97706" stroke-width="2"/><text x="120" y="175" fill="%23d97706" font-family="monospace" font-size="12" font-weight="bold">INVERTER MODULE</text><text x="120" y="195" fill="%23a8a29e" font-family="monospace" font-size="11">CHOPPER 3-PHASE</text><circle cx="360" cy="180" r="36" fill="%23292524" stroke="%23f59e0b" stroke-width="2"/><text x="50" y="340" fill="%23888888" font-family="monospace" font-size="13">ROOF AUX CONVERTER // MUMBAI METRO LINE 3</text></svg>`

export const FAILURE_SCENARIOS: FailureScenario[] = [
  {
    id: '1',
    title: 'Failure Type 1 · Traction Motor Vibration',
    subtitle: 'Mitsubishi Electric TM-450 (MB5085-2274-K)',
    equipment: 'Traction Motor TM-450',
    model: 'MB-5085-A',
    serialNo: 'MB5085-2274-K',
    oemId: 'mitsubishi',
    oemName: 'Mitsubishi Electric Transportation Systems',
    oemHq: 'Kobe, Japan',
    operator: 'Kochi Metro Rail Ltd',
    depot: 'Muttom Depot',
    claimId: 'HS-2026-0881',
    faultCode: 'E-TM-204',
    jisCode: 'JIS E-4001',
    symptom: 'Bearing vibration > 7.2 mm/s RMS & stator insulation degradation',
    failureDescription:
      'Excessive mechanical vibration observed on motor bogie 1 during high acceleration, accompanied by abnormal temperature readout (145°C) and burning odor.',
    rootCause:
      'Premature non-drive-end bearing race spalling causing rotor eccentricity and stator thermal insulation breakdown prior to 250,000 km MTBF threshold.',
    warrantyClause: 'Contract JICA-C08 // Clause 8.2 (Rotary Electrical Machinery Early Failure)',
    amountInr: 2450000,
    amountJpy: 4350000,
    confidence: 0.96,
    language: 'Tamil',
    crew: 'R. Karthik (Depot Maintenance Lead)',
    crewInitials: 'RK',
    transcript: [
      {
        id: 't1_1',
        source: 'டிராக்ஷன் மோட்டார் அதிக அதிர்வு ஏற்படுகிறது, வேகம் அதிகரிக்கும் போது தாங்க முடியாத சத்தம் கேட்கிறது.',
        translation:
          'Traction motor is experiencing abnormal vibration, accompanied by severe grinding noise during train acceleration.',
        terms: ['traction motor', 'bearing vibration', '80 km/h'],
        startMs: 0,
      },
    ],
    nameplateSvg: SVG_TM_NAMEPLATE,
    hmiSvg: SVG_TM_HMI,
    contextSvg: SVG_TM_CONTEXT,
    costs: {
      partReplacementInr: 1850000,
      partReplacementJpy: 3280000,
      laborInr: 360000,
      laborJpy: 640000,
      testingInr: 240000,
      testingJpy: 430000,
    },
  },
  {
    id: '2',
    title: 'Failure Type 2 · Brake Control Pneumatic Leakage',
    subtitle: 'Hitachi Rail STS / Nabtesco BCU-80 (NAB-HIT-9941-B)',
    equipment: 'Microprocessor Brake Control Unit BCU-80',
    model: 'BCU-80-MK2',
    serialNo: 'NAB-HIT-9941-B',
    oemId: 'hitachi',
    oemName: 'Hitachi Rail STS',
    oemHq: 'Tokyo, Japan',
    operator: 'Chennai Metro Rail Ltd',
    depot: 'Koyambedu Depot',
    claimId: 'HS-2026-0882',
    faultCode: 'E-BK-102',
    jisCode: 'JIS E-4112',
    symptom: 'Main reservoir pneumatic pressure drop below 6.4 bar',
    failureDescription:
      'Intermittent pneumatic pressure loss in brake pipe manifold during station brake self-test, causing emergency brake solenoid valve latch failure.',
    rootCause:
      'Pneumatic manifold solenoid seal ring extrusion leading to pressure dissipation under JIS E-4112 standard testing cycle.',
    warrantyClause: 'Contract CMRL-SYS-14 // Clause 5.4 (Braking & Pneumatic Integrity Guarantee)',
    amountInr: 1850000,
    amountJpy: 3280000,
    confidence: 0.94,
    language: 'Hindi',
    crew: 'S. Rao (Pneumatic Systems Inspector)',
    crewInitials: 'SR',
    transcript: [
      {
        id: 't2_1',
        source: 'ब्रेक कंट्रोल यूनिट में प्रेशर ड्रॉप हो रहा है, एमरजेंसी सोलनॉइड वाल्व लीक कर रहा है।',
        translation:
          'Brake control unit is dropping main reservoir pressure below 6.4 bar; emergency solenoid valve is leaking.',
        terms: ['brake control unit', 'pneumatic pressure', 'solenoid valve'],
        startMs: 0,
      },
    ],
    nameplateSvg: SVG_BCU_NAMEPLATE,
    hmiSvg: SVG_BCU_HMI,
    contextSvg: SVG_BCU_CONTEXT,
    costs: {
      partReplacementInr: 1350000,
      partReplacementJpy: 2400000,
      laborInr: 320000,
      laborJpy: 570000,
      testingInr: 180000,
      testingJpy: 310000,
    },
  },
  {
    id: '3',
    title: 'Failure Type 3 · Auxiliary Power Unit Overheat',
    subtitle: 'Toshiba Infrastructure Systems APU-120 (TOSH-APU-8820-X)',
    equipment: 'Static Inverter APU-120 (415V 3-Phase)',
    model: 'APU-120-K',
    serialNo: 'TOSH-APU-8820-X',
    oemId: 'toshiba',
    oemName: 'Toshiba Infrastructure Systems',
    oemHq: 'Fuchu, Tokyo, Japan',
    operator: 'Mumbai Metro Rail Corporation',
    depot: 'Aarey Car Shed',
    claimId: 'HS-2026-0883',
    faultCode: 'E-APU-309',
    jisCode: 'JIS E-5006',
    symptom: 'IGBT module gate driver over-temperature trip at 88°C ambient',
    failureDescription:
      'Auxiliary Power Unit phase 3 inverter tripped on thermal overload during 104% peak HVAC operating conditions, cutting off passenger saloon lighting.',
    rootCause:
      'Solid-state IGBT gate driver optical isolator drift and heat pipe thermal interface material (TIM) degradation under JIS E-5006.',
    warrantyClause: 'Contract MMRC-L3-W // Clause 11.1 (Solid-State Power Electronics MTBF)',
    amountInr: 3120000,
    amountJpy: 5540000,
    confidence: 0.98,
    language: 'English',
    crew: 'V. Mehta (High Voltage Depot Engineer)',
    crewInitials: 'VM',
    transcript: [
      {
        id: 't3_1',
        source: 'APU inverter module phase 3 tripping on thermal overload at 88 degrees during peak air conditioning load.',
        translation:
          'APU inverter module phase 3 tripping on thermal overload at 88°C during peak saloon air conditioning load.',
        terms: ['APU inverter', 'IGBT module', 'thermal overload'],
        startMs: 0,
      },
    ],
    nameplateSvg: SVG_APU_NAMEPLATE,
    hmiSvg: SVG_APU_HMI,
    contextSvg: SVG_APU_CONTEXT,
    costs: {
      partReplacementInr: 2450000,
      partReplacementJpy: 4350000,
      laborInr: 410000,
      laborJpy: 730000,
      testingInr: 260000,
      testingJpy: 460000,
    },
  },
]

export function getScenario(id?: string): FailureScenario {
  const match = FAILURE_SCENARIOS.find((s) => s.id === id)
  return match || FAILURE_SCENARIOS[0]
}

