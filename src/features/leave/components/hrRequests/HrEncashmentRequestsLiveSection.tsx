/**
 * HR Requests → Encashment segment: GET /leave-encashments + detail by id.
 */

import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/services/api/errors'

import { useGetEncashmentRequestsQuery } from '../../api/leaveEncashmentsApi'
import { useCanFetchLeaveEncashments } from '../../hooks/useCanFetchLeaveEncashments'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import type { HrEncashmentRequestRow } from '../../types/api/leaveEncashmentList.types'
import {
  filterHrEncashmentRows,
  mapApiEncashmentListToHrRows,
} from '../../utils/mapApiEncashmentRequest'
import { LeaveTableFilters } from '../shared/LeaveTableFilters'
import { EncashmentRequestDetailDialog } from '../dialogs/EncashmentRequestDetailDialog'
import { HrEncashmentRequestsTable } from './HrEncashmentRequestsTable'

type HrEncashmentRequestsLiveSectionProps = {
  search: string
  onSearchChange: (value: string) => void
  employeeName: (id: string) => string
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  busyId?: string | null
}

export function HrEncashmentRequestsLiveSection({
  search,
  onSearchChange,
  employeeName,
  onApprove,
  onReject,
  busyId,
}: HrEncashmentRequestsLiveSectionProps) {
  const [detailRow, setDetailRow] = useState<HrEncashmentRequestRow | null>(null)
  const canFetch = useCanFetchLeaveEncashments()
  const permissions = useLeavePermissions()
  const { data, isError, error, isFetching } = useGetEncashmentRequestsQuery(
    { page: 1, limit: 100 },
    { skip: !canFetch },
  )

  const allRows = useMemo(() => {
    if (!data || isError) return []
    return mapApiEncashmentListToHrRows(data)
  }, [data, isError])

  const rows = useMemo(
    () => filterHrEncashmentRows(allRows, search, employeeName),
    [allRows, employeeName, search],
  )

  const errorMessage =
    canFetch && isError
      ? getApiErrorMessage(error, 'Unable to load encashment requests from the server.')
      : null

  if (!canFetch) {
    return (
      <HrEncashmentRequestsTable
        rows={[]}
        employeeName={employeeName}
        emptyLabel="You need leave encashments read access to load requests from the API."
      />
    )
  }

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {isFetching ? <p className="text-xs text-hrms-text-muted">Loading encashment requests…</p> : null}
      <LeaveTableFilters
        searchId="hr-encashment-search"
        searchPlaceholder="Search employee, type or status"
        searchValue={search}
        onSearchChange={onSearchChange}
        showing={rows.length}
        total={allRows.length}
      />
      <HrEncashmentRequestsTable
        rows={rows}
        employeeName={employeeName}
        onView={setDetailRow}
        onApprove={onApprove}
        onReject={onReject}
        busyId={busyId}
        emptyLabel={
          allRows.length === 0
            ? 'No encashment requests returned from the API.'
            : 'No encashment requests match your filters.'
        }
      />
      <EncashmentRequestDetailDialog
        open={Boolean(detailRow)}
        row={detailRow}
        employeeName={detailRow ? resolveEncashmentEmployeeLabel(detailRow, employeeName) : ''}
        onOpenChange={(open) => !open && setDetailRow(null)}
        useLiveApi={canFetch}
        canCancel={permissions.canCancelEncashment}
        onCancelled={() => setDetailRow(null)}
      />
    </div>
  )
}

function resolveEncashmentEmployeeLabel(
  row: HrEncashmentRequestRow,
  nameFor: (id: string) => string,
): string {
  if (row.employeeDisplayName) return row.employeeDisplayName
  const fromSnapshot = nameFor(row.employeeId)
  return fromSnapshot || row.employeeId
}