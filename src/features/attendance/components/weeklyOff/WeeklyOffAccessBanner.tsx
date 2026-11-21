/**
 * Shown when weekly-off APIs are unavailable for the current user.
 */
import { Card, CardContent } from '@/components/ui/card'

type WeeklyOffAccessBannerProps = {
  canFetch: boolean
  canConfigure: boolean
}

export function WeeklyOffAccessBanner({ canFetch, canConfigure }: WeeklyOffAccessBannerProps) {
  if (canFetch) {
    if (canConfigure) return null
    return (
      <Card className="border-amber-200 bg-amber-50 shadow-sm">
        <CardContent className="py-4 text-sm text-amber-950">
          You can view company weekly-off policy with <strong>calendar:read</strong>. Saving changes
          requires <strong>calendar:configure</strong>.
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="border-border-soft bg-muted-bg shadow-sm">
      <CardContent className="py-4 text-sm text-text-secondary">
        Sign in with <strong className="text-navy">calendar:read</strong> to load the company
        weekly-off policy from the server.
      </CardContent>
    </Card>
  )
}