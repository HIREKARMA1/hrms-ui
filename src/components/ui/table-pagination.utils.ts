/** Build page tokens: numbers plus `'ellipsis'` gaps (e.g. 1 … 4 5 6 … 20). */
export function buildPaginationItems(
  page: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  const safeTotal = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotal)

  if (safeTotal <= 7) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1)
  }

  const items: Array<number | 'ellipsis'> = [1]
  const start = Math.max(2, safePage - 1)
  const end = Math.min(safeTotal - 1, safePage + 1)

  if (start > 2) items.push('ellipsis')
  for (let n = start; n <= end; n += 1) items.push(n)
  if (end < safeTotal - 1) items.push('ellipsis')
  items.push(safeTotal)

  return items
}
