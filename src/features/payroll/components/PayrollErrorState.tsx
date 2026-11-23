/**
 * Error panel with retry action when payrollService fails.
 * Used by PayrollPage in place of content on load errors.
 */

import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type PayrollErrorStateProps = {
  message: string
  onRetry: () => void
}

export function PayrollErrorState({ message, onRetry }: PayrollErrorStateProps) {
  return (
    <Card className="border-hrms-danger/30">
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hrms-danger/10 text-hrms-danger">
          <AlertCircle className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-base font-semibold text-hrms-navy">Unable to load payroll</p>
          <p className="text-sm text-hrms-text-secondary">{message}</p>
        </div>
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}
