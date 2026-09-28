// ── One-click demo mode ─────────────────────────────────────────────────────
// Seeds a realistic end-to-end scenario (draft with photos → submitted claim →
// immediate OEM decision) so judges see the full loop in ~60 seconds.

import { EQUIPMENT_FAULT_INFO } from '../data/equipmentFaults'
import { saveDraft, getSubmittedClaims, type ClaimDraft, type DraftPhoto } from './claimStore'
import { logAuditEvent } from './auditLog'
import { scheduleOemResponse, getOemResponses } from './oemResponses'
import { DEFAULT_NAMEPLATE_SVG } from './evidenceStore'

export function isDemoRun(): boolean {
  try {
    return sessionStorage.getItem('HS_DEMO_RUN') === '1'
  } catch {
    return false
  }
}

/**
 * Seeds a submitted traction-motor claim with a guaranteed immediate OEM
 * approval, then returns the claim id. Used by the "Run demo" button.
 */
export function runDemo(): string {
  const profile = EQUIPMENT_FAULT_INFO['Traction Motor']
  const photos: DraftPhoto[] = [
    { slot: 1, name: 'motor_nameplate.jpg', dataUrl: DEFAULT_NAMEPLATE_SVG, tag: 'Traction Motor nameplate', confidence: 0.97 },
    { slot: 2, name: 'hmi_fault_screen.jpg', dataUrl: DEFAULT_NAMEPLATE_SVG, tag: 'Fault screen', confidence: 0.94 },
  ]
  const draft: ClaimDraft = {
    id: `HS-2026-${String(Math.floor(Math.random() * 200) + 900).padStart(4, '0')}`,
    scenarioId: '1',
    status: 'submitted',
    updatedAt: new Date().toISOString(),
    equipmentType: 'Traction Motor',
    manufacturer: profile.oem,
    model: profile.model,
    serialNumber: profile.serialNo,
    trainset: profile.trainset,
    componentId: profile.componentId,
    faultSummary: profile.faultSummary,
    faultCode: profile.faultCode,
    faultDate: new Date().toISOString().slice(0, 10),
    classification: profile.classification,
    depot: 'Lasya Depot',
    amountInr: profile.amountInr,
    photos,
    hasVoiceNote: true,
    voiceSeconds: 14,
    voiceTranscript: 'Traction motor number four is making a loud grinding noise and the casing is very hot after running.',
    voiceJapanese: '牽引電動機4号が大きな擦れる音を発生させており、運転後ケーシングが非常に高温になっています。',
    voiceRomaji: 'Ken’in dēndōki yon-gō ga ōkina sureru oto o hassei sasete orimasu.',
  }

  saveDraft(draft)

  const claim = {
    id: draft.id,
    equipment: draft.equipmentType,
    fault: draft.faultSummary,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    amountInr: draft.amountInr,
    oem: draft.manufacturer,
    submittedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem('HS_SUBMITTED_CLAIMS_V1', JSON.stringify([claim, ...getSubmittedClaims()]))
  } catch {
    // ignore
  }

  logAuditEvent({
    actor: 'Demo Mode',
    action: 'Captured warranty claim evidence',
    detail: `${draft.equipmentType} (${draft.faultCode}) · 2 photos · voice note with Japanese translation`,
    kind: 'capture',
    claimId: draft.id,
  })

  // Immediate ACK, then a guaranteed decision after ~8 seconds so the demo
  // lands inside a 60-second pitch.
  scheduleOemResponse(claim)
  const responses = getOemResponses()
  const ack = responses.find((r) => r.claimId === claim.id)
  if (ack) {
    // Force a fast, always-approve decision for the demo by deciding now.
    const decided = {
      ...ack,
      state: 'decided' as const,
      decision: 'approved' as const,
      recoveredInr: claim.amountInr,
      seen: false,
      reasonJp: '牽引電動機の保証請求を承認しました。契約条項に基づき全額支払されます。',
      reasonEn: 'Warranty claim for Traction Motor APPROVED in full per contract clause. Funds within 10 business days.',
      arrivedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem('HS_OEM_RESPONSES_V1', JSON.stringify([decided, ...responses.filter((r) => r.claimId !== claim.id)]))
      window.dispatchEvent(new CustomEvent('hs-oem-sync'))
    } catch {
      // ignore
    }
  }

  try {
    sessionStorage.setItem('HS_DEMO_RUN', '1')
  } catch {
    // ignore
  }
  return draft.id
}
