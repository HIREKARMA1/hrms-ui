/**
 * Punch count badges and table after a successful biometric-by-code query.
 */
import { Badge } from '@/components/ui/badge'
import { BiometricAttendancePunchesTable } from '@/features/biometric/components/BiometricAttendancePunchesTable'
import type { BiometricPunch } from '@/features/biometric/types/api/biometricAttendance.types'

type BiometricPunchResultSectionProps = {
  employeeCode: string
  source?: string
  punches: BiometricPunch[]
}

export function BiometricPunchResultSection({
  employeeCode,
  source,
  punches,
}: BiometricPunchResultSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="secondary">{punches.length} punch(es)</Badge>
        <Badge variant="secondary">Code: {employeeCode}</Badge>
        {source ? <Badge variant="secondary">Source: {source}</Badge> : null}
      </div>
      <BiometricAttendancePunchesTable punches={punches} />
    </div>
  )
}