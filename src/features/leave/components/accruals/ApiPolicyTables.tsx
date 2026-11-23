/**
 * Read-only server accrual and carry-forward policy tables
 * (GET /leave-policies/accrual, /leave-policies/carry-forward).
 */

import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { getLeaveErrorMessage, useListAccrualPoliciesQuery, useListCarryForwardPoliciesQuery } from '../../api/leaveApi'
import { toDateOnly } from '../../api/leaveMappers'
import type { BackendLeaveTypeRef } from '../../api/leaveApi.types'
import { formatDate } from '../../utils/formatDate'
import { LeaveErrorState } from '../LeaveErrorState'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LeaveInlineLoading } from '../shared/LeaveServerNotice'
import { LEAVE_TABLE_THEAD } from '../shared/leaveUi'

const POLICY_LIMIT = 100

type QueryView<T> = {
  data?: { items: T[]; pagination: { total: number } }
  isFetching: boolean
  isError: boolean
  error?: unknown
  refetch: () => unknown
}

function typeLabel(ref: BackendLeaveTypeRef | null, fallbackId: string): string {
  return ref ? `${ref.name} (${ref.code})` : fallbackId
}

function dateLabel(value: string | null): string {
  const date = value ? toDateOnly(value) : null
  return date ? formatDate(date) : '—'
}

function limitLabel(value: number | null): string {
  return value === null ? 'No limit' : String(value)
}

function PolicyCard<T>({ title, query, emptyMessage, head, row }: {
  title: string
  query: QueryView<T>
  emptyMessage: string
  head: string[]
  row: (item: T) => ReactNode
}) {
  const items = query.data?.items ?? []
  const total = query.data?.pagination.total ?? 0
  return (
    <Card>
      <CardHeader className="border-b border-hrms-border pb-3">
        <CardTitle className="text-base font-semibold text-hrms-navy">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 overflow-x-auto p-0">
        {query.isFetching && !query.data ? (
          <div className="px-5"><LeaveInlineLoading label={`Loading ${title.toLowerCase()}…`} /></div>
        ) : query.isError && !query.data ? (
          <LeaveErrorState message={getLeaveErrorMessage(query.error, `Could not load ${title.toLowerCase()}.`)} onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <LeaveEmptyState message={emptyMessage} />
        ) : (
          <>
            <table className="w-full text-left text-xs">
              <thead className={LEAVE_TABLE_THEAD}>
                <tr>
                  {head.map((label) => (
                    <th key={label} className="px-3 py-2 font-semibold">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{items.map(row)}</tbody>
            </table>
            {total > items.length ? (
              <p className="px-3 py-2 text-xs text-hrms-text-secondary">Showing {items.length} of {total} policies.</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function ApiAccrualPoliciesCard() {
  const query = useListAccrualPoliciesQuery({ page: 1, limit: POLICY_LIMIT })
  return (
    <PolicyCard
      title="Accrual policies"
      query={query}
      emptyMessage="No accrual policies are configured."
      head={['Leave type', 'Frequency', 'Amount', 'Annual limit', 'Max balance', 'Effective', 'Status']}
      row={(item) => (
        <tr key={item.id} className="border-b border-hrms-border/40">
          <td className="px-3 py-2">{typeLabel(item.leaveType, item.leaveTypeId)}</td>
          <td className="px-3 py-2">{item.frequency === 'MONTHLY' ? 'Monthly' : 'Yearly'}</td>
          <td className="px-3 py-2 tabular-nums">{item.accrualAmount}</td>
          <td className="px-3 py-2 tabular-nums">{limitLabel(item.annualAllocationLimit)}</td>
          <td className="px-3 py-2 tabular-nums">{limitLabel(item.maxAccumulatedBalance)}</td>
          <td className="px-3 py-2 whitespace-nowrap">{dateLabel(item.effectiveFrom)} – {item.effectiveTo ? dateLabel(item.effectiveTo) : 'open'}</td>
          <td className="px-3 py-2">{item.isActive ? 'Active' : 'Inactive'}</td>
        </tr>
      )}
    />
  )
}

export function ApiCarryForwardPoliciesCard() {
  const query = useListCarryForwardPoliciesQuery({ page: 1, limit: POLICY_LIMIT })
  return (
    <PolicyCard
      title="Carry-forward policies"
      query={query}
      emptyMessage="No carry-forward policies are configured."
      head={['Leave type', 'Carry forward', 'Max days', 'Expires after', 'Effective year', 'Status']}
      row={(item) => (
        <tr key={item.id} className="border-b border-hrms-border/40">
          <td className="px-3 py-2">{typeLabel(item.leaveType, item.leaveTypeId)}</td>
          <td className="px-3 py-2">{item.enabled ? 'Enabled' : 'Disabled'}</td>
          <td className="px-3 py-2 tabular-nums">{item.maxCarryForwardDays}</td>
          <td className="px-3 py-2">{item.expiryMonths === null ? 'Never' : `${item.expiryMonths} months`}</td>
          <td className="px-3 py-2 tabular-nums">{item.effectiveYear}</td>
          <td className="px-3 py-2">{item.isActive ? 'Active' : 'Inactive'}</td>
        </tr>
      )}
    />
  )
}
