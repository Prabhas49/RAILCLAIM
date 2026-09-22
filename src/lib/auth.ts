// Simple frontend-only auth with preset passwords.
// Edit USERS below to change logins. Stored in localStorage.

export type AccessLevel = 'engineer' | 'depot' | 'admin'

export interface AuthUser {
  username: string
  name: string
  role: string
  depot: string
  initials: string
  /** What the user is allowed to see: depot crew files claims, engineers approve + dispatch. */
  access: AccessLevel
}

interface Preset extends AuthUser {
  password: string
}

// ── EDIT THESE TO SET USERNAME / PASSWORD ──
export const USERS: Preset[] = [
  { username: 'pragna', password: 'metro123', name: 'Pragna Rao', role: 'Chief Rolling Stock Engineer', depot: 'Kochi Metro · Muttom', initials: 'PR', access: 'engineer' },
  { username: 'depot', password: 'depot123', name: 'Depot Crew', role: 'Depot Operator', depot: 'Kochi Metro · Muttom', initials: 'DC', access: 'depot' },
  { username: 'admin', password: 'admin123', name: 'Admin', role: 'Administrator', depot: 'Hashi Setu HQ', initials: 'AD', access: 'admin' },
]

/** Engineers + admins may open Approval/Dispatch, Analytics and Audit. Depot crew may not. */
export function canApprove(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  // Back-compat: sessions stored before `access` existed fall back to role-name matching.
  if (user.access) return user.access === 'engineer' || user.access === 'admin'
  return /engineer|admin/i.test(user.role)
}

const KEY = 'hs_auth_user'

export function login(username: string, password: string): AuthUser | null {
  const u = USERS.find(
    (x) => x.username.toLowerCase() === username.trim().toLowerCase() && x.password === password
  )
  if (!u) return null
  const { password: _pw, ...safe } = u
  localStorage.setItem(KEY, JSON.stringify(safe))
  return safe
}

export function logout() {
  localStorage.removeItem(KEY)
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}
