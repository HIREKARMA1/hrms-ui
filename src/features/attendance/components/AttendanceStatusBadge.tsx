import { Badge } from '@/components/ui/badge'

import type { ApprovalStatus, AttendanceStatus } from '../types/attendance'

const attendanceVariant: Record<
  AttendanceStatus,
  'success' | 'danger' | 'warning' | 'secondary' | 'default' | 'outline'
> = {
  Present: 'success',
  Absent: 'danger',
  Late: 'warning',
  'Half-Day': 'secondary',
  'On Leave': 'default',
  Holiday: 'outline',
  'Weekly Off': 'outline',
}

const approvalVariant: Record<
  ApprovalStatus,
  'success' | 'danger' | 'warning'
> = {
  Approved: 'success',
  Rejected: 'danger',
  Pending: 'warning',
}

export function AttendanceStatusBadge({
  status,
}: {
  status: AttendanceStatus
}) {
  return <Badge variant={attendanceVariant[status]}>{status}</Badge>
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return <Badge variant={approvalVariant[status]}>{status}</Badge>
}
