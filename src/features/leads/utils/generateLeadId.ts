/**
 * Auto-increment lead id for mock store (LD-YYYY-#####).
 */

import type { Lead } from '../types/lead'

export function generateLeadId(existing: Lead[], year = new Date().getFullYear()): string {
  const prefix = `LD-${year}-`
  const max = existing
    .filter((item) => item.id.startsWith(prefix))
    .reduce((acc, item) => {
      const seq = Number(item.id.slice(prefix.length))
      return Number.isFinite(seq) ? Math.max(acc, seq) : acc
    }, 0)
  return `${prefix}${String(max + 1).padStart(5, '0')}`
}