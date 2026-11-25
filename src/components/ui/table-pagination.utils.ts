/** Build page tokens: numbers plus `'ellipsis'` gaps (e.g. 1 … 4 5 6 7 8 … 20). */
export function buildPaginationItems(
  page: number,
  totalPages: number,
  siblingCount = 2,
): Array<number | 'ellipsis'> {
  const safeTotal = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotal)
  const siblings = Math.max(0, siblingCount)

  // Small ranges: show every page — no ellipsis churn.
  const maxWithoutEllipsis = siblings * 2 + 5
  if (safeTotal <= maxWithoutEllipsis) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1)
  }

  const start = Math.max(2, safePage - siblings)
  const end = Math.min(safeTotal - 1, safePage + siblings)

  const items: Array<number | 'ellipsis'> = [1]
  if (start > 2) items.push('ellipsis')
  for (let n = start; n <= end; n += 1) items.push(n)
  if (end < safeTotal - 1) items.push('ellipsis')
  items.push(safeTotal)

  return items
}
