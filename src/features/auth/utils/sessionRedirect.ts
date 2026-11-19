/** Routes that are reachable without a session (see `App.tsx`). */
export const PUBLIC_PATHS = ['/', '/forgot-password', '/contact-administrator']

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
  if (PUBLIC_PATHS.includes(window.location.pathname)) return
  window.location.replace(LOGIN_PATH)
}
