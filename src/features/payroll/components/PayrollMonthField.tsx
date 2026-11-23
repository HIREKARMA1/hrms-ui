/**
 * Month picker for non-HR payroll views (employee / manager).
 */

import { CalendarRange } from 'lucide-react'

import { usePayroll } from '../hooks/usePayroll'

export function PayrollMonthField() {
  const { payrollMonth, setPayrollMonth } = usePayroll()

  return (
    <label className="flex items-center gap-2 text-sm text-hrms-text-secondary">
      <span className="sr-only">Payroll month</span>
      <CalendarRange className="h-4 w-4 text-hrms-text-muted" aria-hidden />
      <input
        type="month"
        value={payrollMonth}
        onChange={(event) => setPayrollMonth(event.target.value)}
        className="h-10 rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus"
        aria-label="Payroll month"
      />
    </label>
  )
}
