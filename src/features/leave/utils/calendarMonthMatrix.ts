/**
 * Six-week Sunday-first grid for a month. Cells are local YYYY-MM-DD dates
 * (null outside the month); month overflow (-1, 12) rolls into the next year.
 */

function localIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  const shownMonth = first.getMonth()
  const weeks: (string | null)[][] = []
  for (let week = 0; week < 6; week++) {
    const row: (string | null)[] = []
    for (let day = 0; day < 7; day++) {
      const cell = new Date(start)
      cell.setDate(start.getDate() + week * 7 + day)
      row.push(cell.getMonth() === shownMonth ? localIsoDate(cell) : null)
    }
    weeks.push(row)
  }
  return weeks
}
