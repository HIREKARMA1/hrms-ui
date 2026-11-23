export function calendarBaseFromPathname(pathname: string): string {
  if (pathname.startsWith('/superadmin/calendar')) return '/superadmin/calendar'
  if (pathname.startsWith('/admin/calendar')) return '/admin/calendar'
  if (pathname.startsWith('/hr/calendar')) return '/hr/calendar'
  if (pathname.startsWith('/employee/calendar')) return '/employee/calendar'
  return '/admin/calendar'
}