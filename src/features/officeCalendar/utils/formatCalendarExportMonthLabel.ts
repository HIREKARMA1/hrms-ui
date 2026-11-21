/** Human label for export UI (e.g. "November 2026"). */
export function formatCalendarExportMonthLabel(month: Date): string {
  return month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}