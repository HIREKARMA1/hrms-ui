/**
 * Browser prompts to add a manual settlement line label and amount.
 * Used from SettlementDetailPanel manual earning/deduction actions.
 */

export function promptManualSettlementLine(add: (label: string, amount: number) => void) {
  const label = window.prompt('Line label')
  const amount = Number(window.prompt('Amount'))
  if (label && amount > 0) {
    add(label, amount)
  }
}
