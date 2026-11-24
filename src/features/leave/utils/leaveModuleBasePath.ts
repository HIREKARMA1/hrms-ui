/**
 * Resolves the leave module base path from the current URL (demo vs role-prefixed).
 */

const ORDERED_PREFIXES = [
  '/superadmin/leave',
  '/hradmin/leave',
  '/manager/leave',
  '/employee/leave',
  '/leave',
] as const

export function leaveBaseFromPathname(pathname: string): string {
  for (const base of ORDERED_PREFIXES) {
    if (pathname === base || pathname.startsWith(`${base}/`)) return base
  }
  return '/leave'
}
