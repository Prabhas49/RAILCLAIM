export type OemId = 'mitsubishi' | 'hitachi' | 'kawasaki'

export type Accent = 'indigo' | 'rose' | 'amber' | 'emerald' | 'sky'

export interface Oem {
  id: OemId
  name: string
  legalName: string
  hq: string
  portal: string
  accent: Accent
  /** Contractual days allowed to respond before the claim is disputed. */
  slaDays: number
  /** Fields this OEM's portal refuses to accept a claim without. */
  requiredFields: string[]
}

export type ClaimStatus =
  | 'draft'
  | 'processing'
  | 'needs_info'
  | 'ready'
  | 'submitted'
  | 'reimbursed'
  | 'rejected'

export interface Claim {
  id: string
  assetId: string
  assetName: string
  depot: string
  operator: string
  oem: OemId
  crew: string
  crewInitials: string
  language: string
  raisedAt: string
  ageDays: number
  status: ClaimStatus
  amountInr: number
  confidence: number
  failureCode: string | null
  symptom: string
  /** Why this claim is stuck, when it is. Drives the ageing panel. */
  blocker?: string
}

export type StageId = 'asr' | 'translate' | 'ocr' | 'extract' | 'oem_map' | 'compliance'

export interface PipelineStage {
  id: StageId
  label: string
  blurb: string
  detail: string
  durationMs: number
}

/** Where a structured field's value came from — shown as provenance on review. */
export type FieldSource = 'voice' | 'photo' | 'metadata' | 'inferred'

export interface ClaimField {
  id: string
  label: string
  value: string
  confidence: number
  source: FieldSource
  oemRequired: boolean
  note?: string
}

export interface TranscriptLine {
  id: string
  /** Original utterance in the crew's language. */
  source: string
  /** Machine translation used to populate the claim. */
  translation: string
  terms: string[]
  startMs: number
}

export interface PhotoAnnotation {
  id: string
  label: string
  value: string
  confidence: number
  /** Position as a percentage of the image box. */
  x: number
  y: number
  w: number
  h: number
}

export interface EvidencePhoto {
  id: string
  caption: string
  kind: 'nameplate' | 'hmi' | 'context'
  annotations: PhotoAnnotation[]
}

export interface ComplianceCheck {
  id: string
  rule: string
  detail: string
  state: 'pass' | 'warn' | 'fail'
}

export interface AuditEvent {
  id: string
  at: string
  actor: string
  action: string
  detail: string
  kind: 'capture' | 'ai' | 'human' | 'system'
  hash: string
}

export type ViewId =
  | 'dashboard'
  | 'capture'
  | 'pipeline'
  | 'review'
  | 'oem'
  | 'audit'

export interface CaptureMeta {
  gps: string
  assetId: string
  crewId: string
  capturedAt: string
  ambientTemp: string
  runningHours: string
}
