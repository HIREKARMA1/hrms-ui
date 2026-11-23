import { Badge } from '@/components/ui/badge'

import type { JobPostingStatus } from '../../api/jobsApi.types'
import { formatJobStatusLabel } from '../../utils/jobFormat'

export function ApiJobStatusBadge({ status }: { status: JobPostingStatus }) {
  const variant =
    status === 'PUBLISHED'
      ? 'success'
      : status === 'CLOSED' || status === 'CANCELLED'
        ? 'secondary'
        : 'outline'
  return <Badge variant={variant}>{formatJobStatusLabel(status)}</Badge>
}
