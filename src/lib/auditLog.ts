// ── Real activity log: every entry corresponds to something the user actually did ──
// Stored in localStorage, newest first. Seeds once from the demo timeline so the
// screen isn't empty on first run; everything after that is genuine.

import { AUDIT_EVENTS } from '../data/mock'
import type { AuditEvent } from '../types'

const KEY = 'HS_AUDIT_LOG_V1'

function stamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function seedIfEmpty(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as AuditEvent[]
    }
  } catch {
    // fall through to seed
  }
  const seed = [...AUDIT_EVENTS]
  try {
    localStorage.setItem(KEY, JSON.stringify(seed))
  } catch {
    // storage unavailable — just return the seed
  }
  return seed
}

export function getAuditLog(): AuditEvent[] {
  try {
    return seedIfEmpty()
  } catch {
    return [...AUDIT_EVENTS]
  }
}

let seq = 0

export function logAuditEvent(e: {
  actor: string
  action: string
  detail: string
  kind: AuditEvent['kind']
  claimId?: string
}): AuditEvent {
  const event: AuditEvent = {
    id: `log-${Date.now()}-${(seq += 1)}`,
    at: stamp(),
    actor: e.actor,
    action: e.claimId ? `${e.action} · ${e.claimId}` : e.action,
    detail: e.detail,
    kind: e.kind,
    hash: '',
  }
  try {
    const current = seedIfEmpty()
    localStorage.setItem(KEY, JSON.stringify([event, ...current].slice(0, 200)))
    window.dispatchEvent(new CustomEvent('hs-audit-sync'))
  } catch {
    // log in-memory only
  }
  return event
}
