/**
 * Statutory deduction aggregate cards for the current payroll cycle.
 * Used on PayrollPage between status cards and alerts.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { usePayroll } from '../hooks/usePayroll'
import { formatCurrency } from '../utils/formatCurrency'

export function StatutoryTotals() {
  const { summary } = usePayroll()
  const rows = [
    { label: 'PF deducted', value: summary.totalPf },
    { label: 'Employer PF', value: summary.totalEmployerPf },
    { label: 'Tax (TDS)', value: summary.totalTds },
    { label: 'Professional tax', value: summary.totalProfessionalTax },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statutory totals</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-xl border border-hrms-border bg-hrms-page px-4 py-3"
          >
            <p className="text-xs font-medium text-hrms-text-muted">{row.label}</p>
            <p className="mt-1 text-lg font-semibold text-hrms-navy">
              {formatCurrency(row.value)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
