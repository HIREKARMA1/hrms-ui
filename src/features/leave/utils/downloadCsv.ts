/**
 * Builds and downloads a CSV in the browser (no extra packages).
 */

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const lines = [headers.map(escapeCell).join(',')]
  for (const row of rows) {
    lines.push(row.map((cell) => escapeCell(String(cell))).join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function csvFilename(reportName: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return `${reportName.replace(/\s+/g, '-').toLowerCase()}-${date}.csv`
}
