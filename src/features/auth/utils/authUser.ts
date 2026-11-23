import type { AuthUser, LoginResponseData } from '../types/auth.types'

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

/**
 * Defensive view of the persisted/backend user.
 * Returns null when identity fields are missing (unusable session). Malformed
 * `roles` / `permissions` become empty arrays, which deny access - they are
 * never treated as "unrestricted".
 */
export function normalizeAuthUser(user: unknown): AuthUser | null {
  if (typeof user !== 'object' || user === null) return null
  const u = user as Record<string, unknown>
  if (typeof u.id !== 'string' || !u.id) return null
  if (typeof u.role !== 'string' || !u.role) return null

  return {
    id: u.id,
    email: typeof u.email === 'string' ? u.email : '',
    role: u.role,
    roles: toStringArray(u.roles),
    permissions: toStringArray(u.permissions),
    isActive: u.isActive === true,
  }
}

/**
 * Strict check for a user freshly returned by the server (login, refresh,
 * /auth/me). Unlike `normalizeAuthUser`, nothing is defaulted: a payload
 * missing any field is rejected so it can never replace a known-good user.
 */
export function parseAuthUserStrict(value: unknown): AuthUser | null {
  if (!isRecord(value)) return null
  const { id, email, role, roles, permissions, isActive } = value
  if (typeof id !== 'string' || !id) return null
  if (typeof email !== 'string' || !email.trim()) return null
  if (typeof role !== 'string' || !role) return null
  if (!isStringArray(roles) || !isStringArray(permissions)) return null
  if (typeof isActive !== 'boolean') return null
  return { id, email, role, roles: [...roles], permissions: [...permissions], isActive }
}

/** `{ success: true, data: { user } }` from GET /auth/me, or null for anything else (incl. empty 304 bodies). */
export function parseCurrentUserResponse(body: unknown): AuthUser | null {
  if (!isRecord(body) || body.success !== true || !isRecord(body.data)) return null
  return parseAuthUserStrict(body.data.user)
}

/** `data` of POST /auth/login, or null when the envelope, tokens or user are unusable. */
export function parseLoginResponse(body: unknown): LoginResponseData | null {
  if (!isRecord(body) || body.success !== true || !isRecord(body.data)) return null
  const { accessToken, refreshToken, expiresIn, user } = body.data
  if (typeof accessToken !== 'string' || !accessToken) return null
  if (typeof refreshToken !== 'string' || !refreshToken) return null
  const parsedUser = parseAuthUserStrict(user)
  if (!parsedUser) return null
  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: typeof expiresIn === 'string' ? expiresIn : '',
    user: parsedUser,
  }
}

/**
 * User to keep after a token refresh.
 * - A valid refreshed user for the same account replaces the current one.
 * - A missing/incomplete refreshed user keeps the current one unchanged.
 * - A refreshed user for a different account returns null (session unusable).
 */
export function resolveRefreshedUser(
  current: AuthUser | null,
  incoming: unknown,
): AuthUser | null {
  const refreshed = parseAuthUserStrict(incoming)
  if (!current) return refreshed
  if (refreshed && refreshed.id !== current.id) return null
  return refreshed ?? current
}

/**
 * Display label for the signed-in user. The API returns no name fields, so
 * the email is shown as-is rather than guessing a name from it.
 */
export function getUserDisplayName(user: Pick<AuthUser, 'email'>): string {
  return user.email.trim() || 'Signed-in user'
}

/** Avatar initials from the email local part ("priya.sharma@x" -> "PS"). */
export function getUserInitials(user: Pick<AuthUser, 'email'>): string {
  const local = user.email.trim().split('@')[0] ?? ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  const letters =
    parts.length > 1
      ? parts.slice(0, 2).map((part) => part.charAt(0))
      : [local.charAt(0)]
  return letters.join('').toUpperCase() || 'U'
}
