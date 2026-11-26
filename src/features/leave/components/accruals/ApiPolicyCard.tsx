import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { getLeaveErrorMessage } from '../../api/leaveApi'
import type { BackendLeaveTypeRef } from '../../api/leaveApi.types'
import { formatPolicySingleDate } from '../../utils/formatPolicyDateRange'
import { LeaveErrorState } from '../LeaveErrorState'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LeaveInlineLoading } from '../shared/LeaveServerNotice'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { policyStickyTh } from './policyTableLayout'
import { leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

export type PolicyQueryView<T> = {
  data?: { items: T[]; pagination: { total: number } }
  isFetching: boolean
  isError: boolean
  error?: unknown
  refetch: () => unknown
}

export function policyTypeLabel(ref: BackendLeaveTypeRef | null, fallbackId: string): string {
  return ref ? `${ref.name} (${ref.code})` : fallbackId
}

/** @deprecated Use formatPolicySingleDate from formatPolicyDateRange */
export function policyDateLabel(value: string | null): string {
  return formatPolicySingleDate(value)
}

export function policyLimitLabel(value: number | null): string {
  return value === null ? 'No limit' : String(value)
}

export type PolicyColumnHead = { label: string; className?: string }

export function ApiPolicyCard<T extends { id: string }>({
  title,
  query,
  emptyMessage,
  head,
  row,
  headerAction,
  minTableClassName = 'min-w-[48rem]',
}: {
  title: string
  query: PolicyQueryView<T>
  emptyMessage: string
  head: PolicyColumnHead[] | string[]
  row: (item: T) => ReactNode
  headerAction?: ReactNode
  minTableClassName?: string
}) {
  const items = query.data?.items ?? []
  const total = query.data?.pagination.total ?? 0
  const columns = head.map((col) => (typeof col === 'string' ? { label: col } : col))

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-hrms-border pb-3">
        <CardTitle className="text-base font-semibold text-hrms-navy">{title}</CardTitle>
        {headerAction}
      </CardHeader>
      <CardContent className="min-w-0 space-y-3 p-0 text-sm">
        {query.isFetching && !query.data ? (
          <div className="px-5 py-4">
            <LeaveInlineLoading label={`Loading ${title.toLowerCase()}…`} />
          </div>
        ) : query.isError && !query.data ? (
          <LeaveErrorState
            message={getLeaveErrorMessage(query.error, `Could not load ${title.toLowerCase()}.`)}
            onRetry={() => void query.refetch()}
          />
        ) : items.length === 0 ? (
          <div className="p-4">
            <LeaveEmptyState message={emptyMessage} />
          </div>
        ) : (
          <>
            <div className="min-w-0 overflow-x-auto">
              <table className={cn('w-full table-auto text-left text-sm', minTableClassName)}>
                <thead className={LEAVE_TABLE_THEAD}>
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={col.label}
                        className={index === 0 ? policyStickyTh(col.className) : leaveThClass('left', col.className)}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{items.map((item) => (
                  <tr key={item.id} className={cn(LEAVE_TABLE_ROW, 'group')}>
                    {row(item)}
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {total > items.length ? (
              <p className="px-5 pb-3 text-xs text-hrms-text-secondary">
                Showing {items.length} of {total} policies.
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export const policyTd = leaveTdClass
export const policyTh = leaveThClass