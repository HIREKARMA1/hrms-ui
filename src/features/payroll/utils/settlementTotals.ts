/**
 * Recomputes settlement header totals from line items and TDS.
 * Used after manual line add/remove in the settlement editor.
 */

import type { FinalSettlement } from '../types/finalSettlement'
import { roundMoney } from './roundMoney'

export function applySettlementTotals(settlement: FinalSettlement): FinalSettlement {
  const totalEarnings = roundMoney(
    settlement.earningsLines
      .filter((line) => !line.infoOnly)
      .reduce((sum, line) => sum + line.amount, 0),
  )
  const totalDeductions = roundMoney(
    settlement.deductionLines.reduce((sum, line) => sum + line.amount, 0) + settlement.tds,
  )
  return {
    ...settlement,
    totalEarnings,
    totalDeductions,
    netPayable: roundMoney(totalEarnings - totalDeductions),
  }
}
