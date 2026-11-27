/**
 * GET /attendance/regularizations list with optional revoke.
 */
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { AttendanceRegularizationRecord } from '../../types/api/attendanceRegularization.types'
import { getApiErrorMessage } from '@/services/api/errors'
import { AttendanceRegularizationTable } from './AttendanceRegularizationTable'

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
        <AttendanceRegularizationTable
          items={items}
          canRevoke={canRevoke}
          onRevoke={onRevoke}
        />
      ) : null}
    </div>
  )
}