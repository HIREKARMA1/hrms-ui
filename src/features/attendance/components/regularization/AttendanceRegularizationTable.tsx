import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AttendanceRegularizationRecord } from '../../types/api/attendanceRegularization.types'
import {
  mergeRegularizationEmployeeLookup,
  useRegularizationEmployeeLookup,
} from '../../hooks/useRegularizationEmployeeLookup'
import {
  formatRegularizationCreatedAt,
  formatRegularizationDates,
  formatRegularizationEmployeePrimary,
  formatRegularizationEmployeeSecondary,
  formatRegularizationType,
  regularizationStatusLabel,
} from '../../utils/regularizationDisplay'

type AttendanceRegularizationTableProps = {
  items: AttendanceRegularizationRecord[]
  showCreated?: boolean
  canRevoke?: boolean
  onRevoke?: (id: string) => void
}

export function AttendanceRegularizationTable({
  items,
  showCreated = true,
  canRevoke = false,
  onRevoke,
}: AttendanceRegularizationTableProps) {
  const { lookup, isLoading: lookupLoading } = useRegularizationEmployeeLookup(items)

  return (
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="bg-muted-bg/70 text-text-secondary">
        <tr>
          <th className="px-3 py-3 font-medium">Employee</th>
          <th className="px-3 py-3 font-medium">Dates</th>
          <th className="px-3 py-3 font-medium">Type</th>
          <th className="px-3 py-3 font-medium">Reason</th>
          {showCreated ? <th className="px-3 py-3 font-medium">Created</th> : null}
          <th className="px-3 py-3 font-medium">Status</th>
          {canRevoke ? <th className="px-3 py-3 font-medium">Actions</th> : null}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const row = mergeRegularizationEmployeeLookup(item, lookup)
          const revoked = Boolean(row.revokedAt)
          const status = regularizationStatusLabel(row.revokedAt)
          const employeeSecondary = formatRegularizationEmployeeSecondary(row)
          return (
            <tr key={row.id} className="border-t border-border-soft">
              <td className="px-3 py-3">
                <p className="font-medium text-navy">
                  {lookupLoading && !row.employeeName && row.employeeId ? (
                    <span className="text-text-secondary">Loading…</span>
                  ) : (
                    formatRegularizationEmployeePrimary(row)
                  )}
                </p>
                {employeeSecondary ? (
                  <p className="text-xs text-text-secondary">{employeeSecondary}</p>
                ) : null}
              </td>
              <td className="px-3 py-3 text-text-secondary">
                {formatRegularizationDates(row.dates)}
              </td>
              <td className="px-3 py-3 text-text-secondary">
                {formatRegularizationType(row.type)}
              </td>
              <td className="max-w-[200px] truncate px-3 py-3 text-text-secondary">
                {row.reason ?? '—'}
              </td>
              {showCreated ? (
                <td className="px-3 py-3 text-text-secondary">
                  {formatRegularizationCreatedAt(row.createdAt)}
                </td>
              ) : null}
              <td className="px-3 py-3">
                <Badge variant={revoked ? 'warning' : 'success'}>{status}</Badge>
              </td>
              {canRevoke ? (
                <td className="px-3 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={revoked}
                    onClick={() => onRevoke?.(row.id)}
                  >
                    Revoke
                  </Button>
                </td>
              ) : null}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}