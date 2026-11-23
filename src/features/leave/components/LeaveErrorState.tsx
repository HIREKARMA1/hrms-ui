/**
 * Error panel with retry for leave snapshot load failures.
 * Shown on LeavePage when leaveService fetch rejects.
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type LeaveErrorStateProps = {
  message: string
  onRetry: () => void
}

export function LeaveErrorState({ message, onRetry }: LeaveErrorStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-3 p-6">
        <p className="text-sm text-hrms-danger">{message}</p>
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}
