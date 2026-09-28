// ── Simulated OEM response lifecycle ────────────────────────────────────────
// After a claim is dispatched, the OEM "responds": ACK → (delay) → decision
// (approve / partial approve / reject with a Japanese reasoning letter).
// Stored in localStorage, surfaced in the notification drawer + Claims page.

export type OemDecision = 'approved' | 'partial' | 'rejected'

export interface OemResponse {
  claimId: string
  oem: string
  equipment: string
  amountInr: number
  state: 'ack' | 'decided'
  decision?: OemDecision
  /** Amount actually recovered after the decision. */
  recoveredInr?: number
  reference: string
  reasonJp?: string
  reasonEn?: string
  arrivedAt: string
  seen: boolean
  disputed?: boolean
  reconsidered?: OemDecision
  reconsideredInr?: number
}

const KEY = 'HS_OEM_RESPONSES_V1'

const JP_REASONS: Record<OemDecision, (eq: string) => { jp: string; en: string }> = {
  approved: (eq) => ({
    jp: `${eq}の保証請求を承認しました。部品交換費用及び工賃は契約条項に基づき全額支払されます。検収後10営業日以内に入金いたします。`,
    en: `Warranty claim for ${eq} APPROVED in full. Part replacement and labor reimbursed per contract clause. Funds within 10 business days of acceptance.`,
  }),
  partial: (eq) => ({
    jp: `${eq}の保証請求を一部承認しました。労務費及び試験費用は通常摩耗の可能性があるため、部品交換費用の60%のみ支払対象となります。追加証拠（分解写真）のご提示で再審査可能です。`,
    en: `Warranty claim for ${eq} PARTIALLY approved at 60%. Labor/testing excluded as possible wear-and-tear. Additional teardown photos may qualify for re-assessment.`,
  }),
  rejected: (eq) => ({
    jp: `${eq}の保証請求を却下しました。損傷形態が取扱説明書に定める許容運用条件の範囲外であることを走行データが示しているため、保証対象外と判定されました。`,
    en: `Warranty claim for ${eq} REJECTED. Telemetry indicates damage occurred outside permitted operating conditions defined in the maintenance manual — out of coverage.`,
  }),
}

function read(): OemResponse[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as OemResponse[]) : []
  } catch {
    return []
  }
}

function write(list: OemResponse[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('hs-oem-sync'))
  } catch {
    // in-memory only
  }
}

/** Called by markSubmitted: schedule the OEM lifecycle for a dispatched claim. */
export function scheduleOemResponse(claim: {
  id: string
  equipment: string
  oem: string
  amountInr: number
}) {
  const ref = `ACK-${claim.id}-${Date.now().toString().slice(-4)}`
  const ack: OemResponse = {
    claimId: claim.id,
    oem: claim.oem,
    equipment: claim.equipment,
    amountInr: claim.amountInr,
    state: 'ack',
    reference: ref,
    arrivedAt: new Date().toISOString(),
    seen: true,
  }
  write([ack, ...read().filter((r) => r.claimId !== claim.id)])

  // Decide after a realistic demo delay (30–60s so judges see it live).
  const delayMs = 30000 + Math.floor(Math.random() * 30000)
  window.setTimeout(() => {
    const roll = Math.random()
    const decision: OemDecision = roll < 0.55 ? 'approved' : roll < 0.85 ? 'partial' : 'rejected'
    const recoveredInr = decision === 'approved' ? claim.amountInr : decision === 'partial' ? Math.round(claim.amountInr * 0.6) : 0
    const { jp, en } = JP_REASONS[decision](claim.equipment)
    const current = read()
    write(
      current.map((r) =>
        r.claimId === claim.id
          ? { ...r, state: 'decided', decision, recoveredInr, reasonJp: jp, reasonEn: en, arrivedAt: new Date().toISOString(), seen: false }
          : r,
      ),
    )
  }, delayMs)
}

export function getOemResponses(): OemResponse[] {
  return read()
}

/**
 * Depot disputes a rejection/partial. The app auto-assembles a rebuttal
 * (JIS clause + telemetry + SHA-verified hashes), and the OEM 'reconsiders'
 * after a short delay — usually flipping to (partial) approval.
 */
export function disputeClaim(claimId: string): string {
  const list = read()
  const target = list.find((r) => r.claimId === claimId)
  if (!target || target.decision === 'approved' || target.reconsidered) return ''
  write(list.map((r) => (r.claimId === claimId ? { ...r, disputed: true } : r)))

  const rebuttal = `REBUTTAL ${claimId}: Failure signature matches ${target.equipment} warranty clause; telemetry within permitted operating envelope; evidence integrity cryptographically verified (SHA-256). Requesting reassessment.`

  window.setTimeout(() => {
    const roll = Math.random()
    const flipped: OemDecision = roll < 0.65 ? 'approved' : 'partial'
    const recovered = flipped === 'approved' ? target.amountInr : Math.round(target.amountInr * 0.85)
    write(
      read().map((r) =>
        r.claimId === claimId
          ? {
              ...r,
              reconsidered: flipped,
              reconsideredInr: recovered,
              reasonEn: `RECONSIDERED → ${flipped === 'approved' ? 'APPROVED in full' : 'APPROVED at 85%'}: rebuttal evidence (verified hash chain + telemetry envelope) accepted per JIS review protocol.`,
              reasonJp: flipped === 'approved'
                ? '再審査の結果、保証請求を全額承認しました。'
                : '再審査の結果、請求額の85%を承認しました。',
              arrivedAt: new Date().toISOString(),
              seen: false,
            }
          : r,
      ),
    )
  }, 12000)

  return rebuttal
}

export function markOemSeen(claimId: string) {
  write(read().map((r) => (r.claimId === claimId ? { ...r, seen: true } : r)))
}

/** Total INR actually recovered from decided OEM responses (incl. reconsiderations). */
export function getRecoveredTotalInr(): number {
  return read().reduce((sum, r) => sum + (r.reconsideredInr ?? r.recoveredInr ?? 0), 0)
}

export function getUnseenOemCount(): number {
  return read().filter((r) => r.state === 'decided' && !r.seen).length
}
