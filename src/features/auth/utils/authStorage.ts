import type { AuthUser } from '../types/auth.types'

const STORAGE_KEY = 'hrms.auth'

export interface StoredAuth {
  accessToken: string
  /**
   * Null after the server has revoked refresh tokens (e.g. change password)
   * while the access JWT is still usable.
   */
  refreshToken: string | null
  user: AuthUser
  /** true -> localStorage (survives browser restart), false -> sessionStorage */
  rememberMe: boolean
}

function safeStorage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

/** True when `value` is a persistable auth snapshot (refreshToken may be null). */
export function isStoredAuth(value: unknown): value is StoredAuth {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.accessToken === 'string' &&
    (v.refreshToken === null || typeof v.refreshToken === 'string') &&
    typeof v.user === 'object' &&
    v.user !== null
  )
}

export function loadStoredAuth(): StoredAuth | null {
  for (const kind of ['local', 'session'] as const) {
    const raw = safeStorage(kind)?.getItem(STORAGE_KEY)
    if (!raw) continue
    try {
      const parsed: unknown = JSON.parse(raw)
      if (isStoredAuth(parsed)) {
        return { ...parsed, rememberMe: kind === 'local' }
      }
    } catch {
      // fall through and treat as missing
    }
  }
  return null
}

export function saveStoredAuth(auth: StoredAuth): void {
  clearStoredAuth()
  safeStorage(auth.rememberMe ? 'local' : 'session')?.setItem(
    STORAGE_KEY,
    JSON.stringify(auth),
  )
}

export function clearStoredAuth(): void {
  safeStorage('local')?.removeItem(STORAGE_KEY)
  safeStorage('session')?.removeItem(STORAGE_KEY)
}
