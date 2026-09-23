// ── Per-equipment fault catalog + claim profiles ────────────────────────────
// Each equipment type carries its own realistic fault profile so the claim
// form pre-fills correctly when selected, and each generates its OWN PDF.

export interface EquipmentClaimProfile {
  faultCode: string
  classification: string
  componentId: string
  faultSummary: string
  model: string
  serialNo: string
  oem: string
  jisCode: string
  jisStandardLabel: string
  rootCause: string
  warrantyClause: string
  warrantyContract: string
  amountInr: number
  amountJpy: number
  confidence: number
  costs: {
    partReplacementInr: number
    partReplacementJpy: number
    laborInr: number
    laborJpy: number
    testingInr: number
    testingJpy: number
  }
}

export const EQUIPMENT_FAULT_INFO: Record<string, EquipmentClaimProfile> = {
  'Traction Motor': {
    faultCode: 'E-TM-204',
    classification: 'Bearing Vibration',
    componentId: 'TM-04-A',
    faultSummary: 'Abnormal bearing vibration > 7.2 mm/s RMS with stator insulation degradation at high acceleration.',
    model: 'MB-5085-A',
    serialNo: 'MB5085-2274-K',
    oem: 'Mitsubishi Electric',
    jisCode: 'JIS E-4001',
    jisStandardLabel: 'JIS E-4001 COMPLIANT',
    rootCause: 'Premature non-drive-end bearing race spalling causing rotor eccentricity and stator thermal insulation breakdown.',
    warrantyClause: 'Clause 8.2 (Rotary Electrical Machinery Early Failure)',
    warrantyContract: 'JICA-METRO-WARR-2024-C08',
    amountInr: 2450000,
    amountJpy: 4350000,
    confidence: 0.96,
    costs: { partReplacementInr: 1850000, partReplacementJpy: 3280000, laborInr: 360000, laborJpy: 640000, testingInr: 240000, testingJpy: 430000 },
  },
  'Door System': {
    faultCode: 'E-DR-118',
    classification: 'Door Obstruction',
    componentId: 'DR-02-B',
    faultSummary: 'Door fails to lock at station stop — obstruction sensor reports repeated false clearing, actuator intermittent.',
    model: 'HS-DO-3300',
    serialNo: 'HSDO33-1180-D',
    oem: 'Hitachi Rail',
    jisCode: 'JIS E-4105',
    jisStandardLabel: 'JIS E-4105 COMPLIANT',
    rootCause: 'Door drive belt tension loss plus debris-contaminated obstruction sensor optics causing latch solenoid misfire.',
    warrantyClause: 'Clause 6.1 (Passenger Door System Guarantee)',
    warrantyContract: 'JICA-METRO-WARR-2024-D12',
    amountInr: 940000,
    amountJpy: 1670000,
    confidence: 0.93,
    costs: { partReplacementInr: 610000, partReplacementJpy: 1080000, laborInr: 210000, laborJpy: 370000, testingInr: 120000, testingJpy: 220000 },
  },
  'Brake System': {
    faultCode: 'E-BK-102',
    classification: 'Pneumatic Leakage',
    componentId: 'BCU-02-B',
    faultSummary: 'Main reservoir pneumatic pressure drops below 6.4 bar during station brake self-test; solenoid valve leaking.',
    model: 'BCU-80-MK2',
    serialNo: 'NAB-HIT-9941-B',
    oem: 'Hitachi Rail',
    jisCode: 'JIS E-4112',
    jisStandardLabel: 'JIS E-4112 COMPLIANT',
    rootCause: 'Pneumatic manifold solenoid seal ring extrusion leading to pressure dissipation under JIS E-4112 testing cycle.',
    warrantyClause: 'Clause 5.4 (Braking & Pneumatic Integrity Guarantee)',
    warrantyContract: 'CMRL-SYS-14',
    amountInr: 1850000,
    amountJpy: 3280000,
    confidence: 0.94,
    costs: { partReplacementInr: 1350000, partReplacementJpy: 2400000, laborInr: 320000, laborJpy: 570000, testingInr: 180000, testingJpy: 310000 },
  },
  'HVAC Unit': {
    faultCode: 'E-HV-204',
    classification: 'Compressor Trip',
    componentId: 'HV-02-A',
    faultSummary: 'HVAC compressor trips on high head pressure during peak saloon cooling load; condenser airflow restricted.',
    model: 'HR-HV-2200',
    serialNo: 'HRHV22-0477-H',
    oem: 'Toshiba Infrastructure',
    jisCode: 'JIS E-5006',
    jisStandardLabel: 'JIS E-5006 COMPLIANT',
    rootCause: 'Condenser fan bearing seizure restricting airflow, driving refrigerant head pressure beyond compressor cut-out limit.',
    warrantyClause: 'Clause 9.3 (HVAC Refrigeration Circuit Warranty)',
    warrantyContract: 'BMRCL-HVAC-2025-03',
    amountInr: 1240000,
    amountJpy: 2200000,
    confidence: 0.92,
    costs: { partReplacementInr: 890000, partReplacementJpy: 1580000, laborInr: 240000, laborJpy: 430000, testingInr: 110000, testingJpy: 190000 },
  },
  Pantograph: {
    faultCode: 'E-PN-077',
    classification: 'Contact Strip Wear',
    componentId: 'PN-01-L',
    faultSummary: 'Excessive contact strip wear with arcing damage on collector strip; catenary contact pressure out of tolerance.',
    model: 'PT-4500-S',
    serialNo: 'PT45-0771-P',
    oem: 'Kawasaki Heavy Industries',
    jisCode: 'JIS E-4007',
    jisStandardLabel: 'JIS E-4007 COMPLIANT',
    rootCause: 'Collector strip carbon insert worn beyond 5 mm limit with arcing pitting; raising gear spring fatigue altering contact force.',
    warrantyClause: 'Clause 7.2 (Current Collection Equipment Warranty)',
    warrantyContract: 'DMRC-PAN-2024-19',
    amountInr: 1680000,
    amountJpy: 2990000,
    confidence: 0.91,
    costs: { partReplacementInr: 1150000, partReplacementJpy: 2040000, laborInr: 330000, laborJpy: 590000, testingInr: 200000, testingJpy: 360000 },
  },
  Bogie: {
    faultCode: 'E-BG-311',
    classification: 'Axle Box Overheat',
    componentId: 'BG-04-C',
    faultSummary: 'Axle box bearing temperature exceeds 95°C alarm threshold on axle 4; grease degradation suspected.',
    model: 'BG-9200-M',
    serialNo: 'BG92-3114-M',
    oem: 'Kawasaki Heavy Industries',
    jisCode: 'JIS E-4009',
    jisStandardLabel: 'JIS E-4009 COMPLIANT',
    rootCause: 'Axle box bearing grease thermal breakdown causing rolling contact fatigue and elevated running temperature.',
    warrantyClause: 'Clause 8.4 (Bogie & Running Gear Early Failure)',
    warrantyContract: 'JICA-METRO-WARR-2024-B07',
    amountInr: 2980000,
    amountJpy: 5290000,
    confidence: 0.95,
    costs: { partReplacementInr: 2200000, partReplacementJpy: 3910000, laborInr: 520000, laborJpy: 920000, testingInr: 260000, testingJpy: 460000 },
  },
  Coupler: {
    faultCode: 'E-CP-093',
    classification: 'Coupler Misalignment',
    componentId: 'CP-03-F',
    faultSummary: 'Semi-permanent coupler fails to engage locking head fully during shunting; misalignment beyond ±4 mm tolerance.',
    model: 'CP-2800-S',
    serialNo: 'CP28-0932-S',
    oem: 'Hitachi Rail',
    jisCode: 'JIS E-4011',
    jisStandardLabel: 'JIS E-4011 COMPLIANT',
    rootCause: 'Coupler head wear bushing erosion beyond tolerance preventing full locking-head engagement during shunting moves.',
    warrantyClause: 'Clause 6.6 (Coupler & Draft Gear Warranty)',
    warrantyContract: 'JICA-METRO-WARR-2024-C14',
    amountInr: 760000,
    amountJpy: 1350000,
    confidence: 0.9,
    costs: { partReplacementInr: 520000, partReplacementJpy: 920000, laborInr: 160000, laborJpy: 280000, testingInr: 80000, testingJpy: 150000 },
  },
  'Signaling Unit': {
    faultCode: 'E-SG-501',
    classification: 'Communication Loss',
    componentId: 'SG-01-A',
    faultSummary: 'Onboard ATC unit loses track-circuit communication intermittently; balise telegram errors logged at low speed.',
    model: 'SG-ATC-6100',
    serialNo: 'SGAT61-5011-A',
    oem: 'Toshiba Infrastructure',
    jisCode: 'JIS E-6401',
    jisStandardLabel: 'JIS E-6401 COMPLIANT',
    rootCause: 'Balise antenna coax connector intermittent contact plus onboard ATC receiver board firmware telegram timeout.',
    warrantyClause: 'Clause 12.1 (Onboard Signaling & ATC Systems Warranty)',
    warrantyContract: 'JICA-SG-ATC-2025-02',
    amountInr: 3420000,
    amountJpy: 6070000,
    confidence: 0.89,
    costs: { partReplacementInr: 2600000, partReplacementJpy: 4610000, laborInr: 560000, laborJpy: 990000, testingInr: 260000, testingJpy: 470000 },
  },
  Other: {
    faultCode: 'E-OT-000',
    classification: 'Unclassified',
    componentId: 'GEN-01-X',
    faultSummary: 'Fault observed during depot inspection — details pending technician review.',
    model: '',
    serialNo: '',
    oem: 'Other',
    jisCode: 'JIS E-4001',
    jisStandardLabel: 'JIS E-4001 COMPLIANT',
    rootCause: 'Pending depot inspection and technician root-cause confirmation.',
    warrantyClause: 'Clause 4.1 (General Equipment Warranty)',
    warrantyContract: 'JICA-METRO-WARR-2024-G00',
    amountInr: 500000,
    amountJpy: 890000,
    confidence: 0.75,
    costs: { partReplacementInr: 350000, partReplacementJpy: 620000, laborInr: 100000, laborJpy: 180000, testingInr: 50000, testingJpy: 90000 },
  },
}

/** Order in which uploaded photos are "AI detected" as equipment types. */
export const PHOTO_DETECTION_ORDER = [
  'Traction Motor',
  'Brake System',
  'HVAC Unit',
  'Door System',
  'Pantograph',
  'Bogie',
  'Coupler',
  'Signaling Unit',
  'Other',
] as const
