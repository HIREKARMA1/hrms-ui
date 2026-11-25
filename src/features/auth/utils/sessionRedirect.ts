/** Routes that are reachable without a session (see `App.tsx`). */
export const PUBLIC_PATHS = [
  '/',
  '/forgot-password',
  '/reset-password',
  '/contact-administrator',
]

/** Public path prefixes (e.g. candidate onboarding form). */
export const PUBLIC_PATH_PREFIXES = ['/organisation-onboarding'] as const

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/** Reset screen the emailed link opens (`/reset-password?token=...`). */
export const RESET_PASSWORD_PATH = '/reset-password'

/** Login screen route (the `/` route renders `LoginPage`). */
export const LOGIN_PATH = '/'

/**
 * Send the user to the login page after their session has ended.
 *
 * The app uses `BrowserRouter` (no router instance outside React), so this
 * performs a full navigation. It is a no-op when already on a public route,
 * which also prevents redirect loops.
 */
export function redirectToLogin(): void {
  if (typeof window === 'undefined') return
  if (isPublicPath(window.location.pathname)) return
  window.location.replace(LOGIN_PATH)
}
