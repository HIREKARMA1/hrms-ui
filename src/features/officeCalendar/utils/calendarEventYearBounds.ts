/** Inclusive date range for GET /calendar/events (`from` / `to`, YYYY-MM-DD). */
export function calendarEventYearBounds(year: number): { from: string; to: string } {
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  }
}

export function calendarEventsListQuery(year: number) {
  const { from, to } = calendarEventYearBounds(year)
  return {
    year,
    from,
    to,
    page: 1,
    limit: 100,
    sortBy: 'startAt' as const,
    sortOrder: 'asc' as const,
  }
}
