/**
 * Formats amounts in Indian Rupees with Indian digit grouping.
 * Used wherever payroll money values are displayed in the UI.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number): string {
  return inrFormatter.format(amount)
}
