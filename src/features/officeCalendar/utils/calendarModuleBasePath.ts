export function calendarBaseFromPathname(pathname: string): string {
  if (pathname.startsWith('/superadmin/calendar')) return '/superadmin/calendar'
  if (pathname.startsWith('/hradmin/calendar')) return '/hradmin/calendar'
  if (pathname.startsWith('/manager/calendar')) return '/manager/calendar'
  if (pathname.startsWith('/employee/calendar')) return '/employee/calendar'
  return '/hradmin/calendar'
}