import { cn } from '@/lib/utils'

import { ADMIN_REQUEST_STATUS_LABELS } from '../constants/issueOptions'
import type { AdminRequestStatus } from '../types/adminSupportRequest'

const STATUS_STYLES: Record<AdminRequestStatus, string> = {
  open: 'border-amber-200 bg-amber-50 text-amber-800',
  replied: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  closed: 'border-slate-200 bg-slate-50 text-slate-600',
}

export function AdminRequestStatusBadge({
  status,
  className,
}: {
  status: AdminRequestStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        STATUS_STYLES[status],
        className,
      )}
    >
      {ADMIN_REQUEST_STATUS_LABELS[status]}
    </span>
  )
}