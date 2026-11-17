import { Badge } from '@/components/ui/badge'

type HolidayMandatoryBadgeProps = {
  mandatory: boolean
}

export function HolidayMandatoryBadge({ mandatory }: HolidayMandatoryBadgeProps) {
  return (
    <Badge variant={mandatory ? 'success' : 'secondary'}>{mandatory ? 'Yes' : 'No'}</Badge>
  )
}