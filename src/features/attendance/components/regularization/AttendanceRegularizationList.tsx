/**
 * GET /attendance/regularizations list with optional revoke.
 */
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AttendanceRegularizationRecord } from '../../types/api/attendanceRegularization.types'
import {
  formatRegularizationCreatedAt,
  formatRegularizationDates,
  formatRegularizationType,
  regularizationStatusLabel,
} from '../../utils/regularizationDisplay'
import { getApiErrorMessage } from '@/services/api/errors'

type AttendanceRegularizationListProps = {
  items: AttendanceRegularizationRecord[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  canRevoke: boolean
  onRevoke: (id: string) => void
  onRefresh: () => void
}

export function AttendanceRegularizationList({
  items,
  isLoading,
  isFetching,
  isError,
  error,
  canRevoke,
  onRevoke,
  onRefresh,
}: AttendanceRegularizationListProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-navy">Regularization list</h2>
          <p className="text-sm text-text-secondary">GET /attendance/regularizations</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={isFetching} onClick={onRefresh}>
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {isError ? (
        <p className="p-4 text-sm text-amber-700">
          {getApiErrorMessage(error, 'Could not load regularizations.')}
        </p>
      ) : null}

      {isLoading && !items.length ? (
        <p className="flex items-center gap-2 p-4 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </p>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <p className="p-4 text-sm text-text-secondary">No regularization records found.</p>
      ) : null}

      {items.length > 0 ? (
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted-bg/70 text-text-secondary">
            <tr>
              <th className="px-3 py-3 font-medium">Employee</th>
              <th className="px-3 py-3 font-medium">Dates</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Reason</th>
              <th className="px-3 py-3 font-medium">Created</th>
              <th className="px-3 py-3 font-medium">Status</th>
              {canRevoke ? <th className="px-3 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const revoked = Boolean(row.revokedAt)
              const status = regularizationStatusLabel(row.revokedAt)
              return (
                <tr key={row.id} className="border-t border-border-soft">
                  <td className="px-3 py-3 text-navy">
                    {row.employeeCode ?? row.employeeId ?? '—'}
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
                  <td className="px-3 py-3 text-text-secondary">
                    {formatRegularizationCreatedAt(row.createdAt)}
                  </td>
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
                        onClick={() => onRevoke(row.id)}
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
      ) : null}
    </div>
  )
}