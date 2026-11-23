/**
 * Consumes comp-off credit lots FIFO by earliest expiry (pure allocation).
 * Used when an approved leave request uses compensatory off balance.
 */

import type { CompOffLot } from '../types/compOff'

export type CompOffConsumption = {
  lotId: string
  days: number
}

export function consumeCompOffLots(
  lots: CompOffLot[],
  employeeId: string,
  daysNeeded: number,
  asOfDate: string,
): CompOffConsumption[] {
  const available = lots
    .filter(
      (item) =>
        item.employeeId === employeeId &&
        item.status === 'Available' &&
        item.expiresOn >= asOfDate,
    )
    .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))

  let remaining = daysNeeded
  const picked: CompOffConsumption[] = []
  for (const lot of available) {
    if (remaining <= 0) {
      break
    }
    const take = Math.min(remaining, lot.creditedDays)
    if (take > 0) {
      picked.push({ lotId: lot.id, days: take })
      remaining -= take
    }
  }
  return picked
}
