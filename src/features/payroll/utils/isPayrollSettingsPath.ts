/**
 * True when the URL is the Payroll Settings section (any role prefix).
 */

export function isPayrollSettingsPath(pathname: string): boolean {
  if (pathname === '/payroll/settings') return true
  return /\/payroll\/settings\/?$/.test(pathname)
}