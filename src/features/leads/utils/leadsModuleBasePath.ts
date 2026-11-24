/**
 * Resolves leads base path per role prefix from current pathname.
 */

export function leadsBaseFromPathname(pathname: string): string {
  if (pathname.startsWith('/employee/leads')) return '/employee/leads'
  if (pathname.startsWith('/manager/leads')) return '/manager/leads'
  if (pathname.startsWith('/superadmin/leads')) return '/superadmin/leads'
  if (pathname.startsWith('/hradmin/leads')) return '/hradmin/leads'
  return '/hradmin/leads'
}