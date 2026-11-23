/**
 * Resolves the payroll module base path from the current URL (demo vs role-prefixed).
 */

const ORDERED_PREFIXES = [
  '/superadmin/payroll',
  '/hradmin/payroll',
  '/manager/payroll',
  '/employee/payslips',
  '/payroll',
] as const

export function payrollBaseFromPathname(pathname: string): string {
  for (const base of ORDERED_PREFIXES) {
    if (pathname === base || pathname.startsWith(`${base}/`)) return base
  }
  return '/payroll'
}
