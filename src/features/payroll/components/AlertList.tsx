/**
 * Computed payroll alerts based on employee payment statuses.
 * Used on PayrollPage below statutory totals.
 */

import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { usePayroll } from '../hooks/usePayroll'
import type { PayrollAlert } from '../types/payroll'

const toneStyles: Record<PayrollAlert['tone'], string> = {
  success: 'border-hrms-success/30 bg-hrms-success/5 text-hrms-success',
  warning: 'border-hrms-warning/30 bg-hrms-warning/5 text-hrms-warning',
  danger: 'border-hrms-danger/30 bg-hrms-danger/5 text-hrms-danger',
  info: 'border-hrms-info/30 bg-hrms-info/5 text-hrms-info',
}

function AlertIcon({ tone }: { tone: PayrollAlert['tone'] }) {
  if (tone === 'success') {
    return <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
  }
  if (tone === 'info') {
    return <Info className="h-4 w-4 shrink-0" aria-hidden />
  }
  return <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
}

export function AlertList() {
  const { alerts } = usePayroll()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium',
              toneStyles[alert.tone],
            )}
          >
            <AlertIcon tone={alert.tone} />
            <span>{alert.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
