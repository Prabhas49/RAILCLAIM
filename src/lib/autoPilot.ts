// ── Auto-pilot presentation mode ────────────────────────────────────────────
// Runs the entire hands-free demo: seeds a claim → dispatch animation →
// OEM rejection → auto-dispute → reconsideration → approval → money up.
// The presenter presses one button and narrates.

import { runDemo } from './demoMode'
import { disputeClaim, getOemResponses, type OemResponse } from './oemResponses'

export interface AutoPilotStep {
  at: number // ms from start
  label: string
}

export const AUTOPILOT_SCRIPT: AutoPilotStep[] = [
  { at: 0, label: 'Creating claim from photo evidence…' },
  { at: 1500, label: 'Claim filed — dispatching to OEM…' },
  { at: 11000, label: 'OEM reviewing the claim…' },
  { at: 16000, label: '⚠ OEM pushed back — assembling dispute…' },
  { at: 17500, label: 'Rebuttal sent: JIS clause + verified hash chain…' },
  { at: 34000, label: '✓ OEM reconsidered — awaiting final credit…' },
]

/** Kick off auto-pilot; returns the claim id it runs against. */
export function startAutoPilot(): string {
  const claimId = runDemo()

  // Force the first response to be a rejection so the dispute arc plays out.
  window.setTimeout(() => {
    try {
      const list: OemResponse[] = getOemResponses()
      const target = list.find((r) => r.claimId === claimId)
      if (target) {
        localStorage.setItem(
          'HS_OEM_RESPONSES_V1',
          JSON.stringify(
            list.map((r) =>
              r.claimId === claimId
                ? {
                    ...r,
                    state: 'decided' as const,
                    decision: 'rejected' as const,
                    recoveredInr: 0,
                    seen: false,
                    reasonEn: 'REJECTED: Telemetry indicates damage outside permitted operating conditions — out of coverage.',
                    reasonJp: '保証請求を却下しました。許容運用条件の範囲外のため保証対象外です。',
                    arrivedAt: new Date().toISOString(),
                  }
                : r,
            ),
          ),
        )
        window.dispatchEvent(new CustomEvent('hs-oem-sync'))
        window.dispatchEvent(new CustomEvent('hs-autopilot-rejected'))
      }
    } catch {
      // ignore
    }
  }, 9000)

  // Auto-dispute right after the rejection lands.
  window.setTimeout(() => {
    disputeClaim(claimId)
    window.dispatchEvent(new CustomEvent('hs-autopilot-disputed'))
  }, 16000)

  return claimId
}
