/**
 * Returns the current calendar month in YYYY-MM form for payroll runs.
 * Used as default payrollMonth in provider when none is selected.
 */

export function defaultPayrollMonth(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}

export function payrollMonthIsFebruary(payrollMonth: string): boolean {
  const parts = payrollMonth.split('-')
  return parts[1] === '02'
}
