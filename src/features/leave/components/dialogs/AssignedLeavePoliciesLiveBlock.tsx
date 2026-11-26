/**
 * Read-only assigned policies from GET /employee-leave-policies for one employee.
 */

import { useMemo } from 'react'

import { getApiErrorMessage } from '@/services/api/errors'

import { useGetEmployeeLeavePoliciesQuery } from '../../api/employeeLeavePoliciesApi'
import { mapApiEmployeeLeavePolicyListToRows } from '../../utils/mapApiEmployeeLeavePolicyList'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LEAVE_TABLE_THEAD } from '../shared/leaveUi'

type AssignedLeavePoliciesLiveBlockProps = {
  employeeId: string
  year: number
  enabled: boolean
}

export function AssignedLeavePoliciesLiveBlock({
  employeeId,
  year,
  enabled,
}: AssignedLeavePoliciesLiveBlockProps) {
  const { data, isError, error, isFetching } = useGetEmployeeLeavePoliciesQuery(
    { employeeId, year, page: 1, limit: 100 },
    { skip: !enabled },
  )

  const rows = useMemo(() => {
    if (!data || isError) return []
    return mapApiEmployeeLeavePolicyListToRows(data)
  }, [data, isError])

  const errorMessage =
    enabled && isError
      ? getApiErrorMessage(error, 'Unable to load assigned leave policies from the server.')
      : null

  if (!enabled) return null

  return (
    <div className="space-y-2 rounded-xl border border-hrms-border bg-hrms-muted-bg/30 p-3">
      <p className="text-xs font-semibold text-hrms-navy">Assigned policies (live)</p>
      <p className="text-[11px] text-hrms-text-muted">
        Entitlements for {year} from GET /employee-leave-policies (assigned policies for this employee).
      </p>
      {errorMessage ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
      {isFetching ? (
        <p className="text-xs text-hrms-text-muted">Loading assigned policies…</p>
      ) : null}
      {!isFetching && rows.length === 0 ? (
        <p className="text-xs text-hrms-text-muted">No assigned policies returned for this employee.</p>
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-xs">
            <thead className={LEAVE_TABLE_THEAD}>
              <tr>
                {['Leave type', 'Grant mode', 'Entitlement', 'Effective', 'Defaults', 'Status'].map((head) => (
                  <th key={head} className="px-2 py-2 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-hrms-border/40">
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                      <span>{row.leaveTypeName}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 font-normal text-hrms-text-secondary">{row.grantMode}</td>
                  <td className="px-2 py-2 font-normal tabular-nums">{row.entitlementDetail}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-normal">{row.effectiveRange}</td>
                  <td className="px-2 py-2 font-normal">{row.useCompanyDefaults ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-2">
                    <LeaveStatusPill status={row.active ? 'Active' : 'Inactive'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}