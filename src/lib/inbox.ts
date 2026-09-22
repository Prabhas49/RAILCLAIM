// ── Engineer inbox: which incoming claims haven't been looked at yet ──
// Persistent in localStorage, so a claim filed by the depot account is still
// "new" when the engineer logs in later (same browser).

import { getDraft } from './claimStore'

const SEEN_KEY = 'HS_SEEN_CLAIMS_V1'

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function isClaimUnseen(claimId: string): boolean {
  return !readSeen().includes(claimId)
}

export function markClaimSeen(claimId: string) {
  try {
    const seen = readSeen()
    if (!seen.includes(claimId)) {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, claimId].slice(-100)))
      window.dispatchEvent(new CustomEvent('hs-inbox-sync'))
    }
  } catch {
    // ignore
  }
}

/** The depot-filed claim waiting for engineer review, if any. */
export function getPendingInbox() {
  const draft = getDraft()
  if (draft && (draft.status === 'pending_approval' || draft.status === 'review')) {
    return { draft, unseen: isClaimUnseen(draft.id) }
  }
  return null
}
