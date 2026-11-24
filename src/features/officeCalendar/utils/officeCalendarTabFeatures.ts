/**
 * Office Calendar tab helper shared by the sidebar config and the page guard.
 * Only the Holidays tab has a backend permission (`holidays:read` via the
 * `calendar.holidays` feature); Overview and Calendar (events) have no
 * backend permission code and stay on the existing role/feature rules.
 */

export function isOfficeCalendarHolidayTab(tab: string): boolean {
  return tab === 'Holidays' || tab === 'Holiday Management'
}
