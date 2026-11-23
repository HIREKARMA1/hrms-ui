/**
 * Resolves leads base path per role prefix from current pathname.
 */

export function leadsBaseFromPathname(pathname: string): string {
  if (pathname.startsWith('/employee/leads')) return '/employee/leads'
  if (pathname.startsWith('/hr/leads')) return '/hr/leads'
  if (pathname.startsWith('/superadmin/leads')) return '/superadmin/leads'
  if (pathname.startsWith('/admin/leads')) return '/admin/leads'
  return '/admin/leads'
}