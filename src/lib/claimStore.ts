// ── Single source of truth for the claim lifecycle ──────────────────────────
// Capture writes here → Pipeline/Review/OemOutput read from here →
// dispatch appends to the submitted list that Dashboard/Claims display.
// One claim-ID scheme: HS-2026-NNNN.

import type { FailureScenario } from '../data/mock'

export interface DraftPhoto {
  slot: number
  name: string
  dataUrl: string
  tag: string
  confidence: number
}

export interface ClaimDraft {
  id: string
  scenarioId: '1' | '2' | '3'
  status: 'draft' | 'review' | 'submitted' | 'pending_approval' | 'approved'
  updatedAt: string
  // Equipment
  equipmentType: string
  manufacturer: string
  model: string
  serialNumber: string
  trainset: string
  componentId: string
  // Fault
  faultSummary: string
  faultCode: string
  faultDate: string
  classification: string
  depot: string
  // Commercial
  amountInr: number
  // Evidence
  photos: DraftPhoto[]
  hasVoiceNote: boolean
  voiceSeconds: number
  voiceTranscript?: string
  voiceJapanese?: string
  voiceRomaji?: string
  voiceAudioDataUrl?: string
  voiceJapaneseAudioDataUrl?: string
}

export interface SubmittedClaim {
  id: string
  equipment: string
  fault: string
  date: string
  amountInr: number
  oem: string
  submittedAt: string
}

const DRAFT_KEY = 'HS_CLAIM_DRAFT_V1'
const SUBMITTED_KEY = 'HS_SUBMITTED_CLAIMS_V1'
const SEQ_KEY = 'HS_CLAIM_SEQ_V1'

function nextClaimId(): string {
  try {
    const seq = (parseInt(localStorage.getItem(SEQ_KEY) || '883', 10) % 9999) + 1
    localStorage.setItem(SEQ_KEY, String(seq))
    return `HS-2026-${String(seq).padStart(4, '0')}`
  } catch {
    return 'HS-2026-0884'
  }
}

export function draftFromScenario(sc: FailureScenario): ClaimDraft {
  return {
    id: nextClaimId(),
    scenarioId: sc.id,
    status: 'draft',
    updatedAt: new Date().toISOString(),
    equipmentType: sc.equipment,
    manufacturer: sc.oemName,
    model: sc.model,
    serialNumber: sc.serialNo,
    trainset: 'Train Set 04',
    componentId: `${sc.model.split('-')[0]}-04-A`,
    faultSummary: sc.failureDescription,
    faultCode: sc.faultCode,
    faultDate: new Date().toISOString().slice(0, 10),
    classification: sc.symptom,
    depot: sc.depot,
    amountInr: sc.amountInr,
    photos: [],
    hasVoiceNote: false,
    voiceSeconds: 0,
  }
}

export function getDraft(): ClaimDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as ClaimDraft) : null
  } catch {
    return null
  }
}

export function saveDraft(draft: ClaimDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }))
  } catch (e) {
    console.warn('Draft save failed:', e)
  }
}

export function patchDraft(patch: Partial<ClaimDraft>) {
  const current = getDraft()
  if (current) saveDraft({ ...current, ...patch })
}

/** Start a fresh draft. Resumes an existing draft unless the previous one was submitted. */
export function getOrInitDraft(scenario: FailureScenario): ClaimDraft {
  const stored = getDraft()
  if (stored && stored.status === 'draft' && stored.scenarioId === scenario.id) return stored
  const fresh = draftFromScenario(scenario)
  saveDraft(fresh)
  return fresh
}

export function getSubmittedClaims(): SubmittedClaim[] {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY)
    return raw ? (JSON.parse(raw) as SubmittedClaim[]) : []
  } catch {
    return []
  }
}

/** Called on OEM dispatch confirmation: file the claim and keep the receipt. */
export function markSubmitted(draft: ClaimDraft, oemName: string): SubmittedClaim {
  const claim: SubmittedClaim = {
    id: draft.id,
    equipment: draft.equipmentType,
    fault: draft.faultSummary,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    amountInr: draft.amountInr,
    oem: oemName,
    submittedAt: new Date().toISOString(),
  }
  try {
    const list = [claim, ...getSubmittedClaims()]
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify(list))
    saveDraft({ ...draft, status: 'submitted' })
    window.dispatchEvent(new CustomEvent('hs-claim-sync'))
  } catch (e) {
    console.warn('Submit save failed:', e)
  }
  return claim
}
