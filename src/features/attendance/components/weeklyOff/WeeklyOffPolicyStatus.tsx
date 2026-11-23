/**
 * Loading / error states for GET /calendar/weekly-offs.
 */
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type WeeklyOffPolicyStatusProps = {
  canFetch: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
}

export function WeeklyOffPolicyStatus({
  canFetch,
  isFetching,
  isError,
  onRetry,
}: WeeklyOffPolicyStatusProps) {
  if (!canFetch || (!isFetching && !isError)) return null
  if (isFetching) {
    return (
      <Card className="border-border-soft shadow-sm">
        <CardContent className="py-8 text-center text-sm text-text-secondary">
          Loading weekly-off policy…
        </CardContent>
      </Card>
    )
  }
  if (isError) {
    return (
      <Card className="border-hrms-danger/30 bg-red-50 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center text-sm text-hrms-danger">
          Could not load weekly-off policy.
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }
  return null
}