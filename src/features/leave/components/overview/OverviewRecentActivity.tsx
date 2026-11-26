/**

 * Recent activity timeline with icons and request drill-down.

 */



import { useMemo, useState } from 'react'



import type { LeaveSnapshot } from '../../services/leaveService'

import type { LeaveRequest } from '../../types/leaveRequest'

import { buildRecentActivity } from '../../utils/buildRecentActivity'

import { formatRelativeTime } from '../../utils/formatRelativeTime'

import { formatDate } from '../../utils/formatDate'

import { ledgerBalanceForType } from '../../utils/calculateBalance'

import { RequestDetailDialog } from '../dialogs/RequestDetailDialog'

import { OverviewCard } from './OverviewCard'

import { ACTIVITY_ICONS } from './OverviewActivityIcons'



type Props = { snapshot: LeaveSnapshot; loading?: boolean; error?: string | null; onRetry?: () => void; onViewAll: () => void }



export function OverviewRecentActivity({ snapshot, loading, error, onRetry, onViewAll }: Props) {

  const items = useMemo(() => buildRecentActivity(snapshot), [snapshot])

  const [detail, setDetail] = useState<LeaveRequest | null>(null)

  const empty = items.length === 0



  return (

    <OverviewCard

      title="Recent activity"

      description="Last eight events across leave requests and accruals."

      loading={loading}

      error={error}

      onRetry={onRetry}

      empty={empty}

      fillHeight

      scrollBody

      skeleton="list"

      headerAside={

        <button type="button" className="text-xs font-medium text-hrms-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus" onClick={onViewAll}>

          View all

        </button>

      }

    >

      <ul className="space-y-2">

        {items.map((item) => {

          const tile = ACTIVITY_ICONS[item.kind]

          const Icon = tile.icon

          return (

            <li key={item.id}>

              <button

                type="button"

                disabled={!item.requestId}

                onClick={() => item.requestId && setDetail(snapshot.requests.find((row) => row.id === item.requestId) ?? null)}

                className="flex w-full gap-3 rounded-lg px-1 py-1 text-left hover:bg-hrms-row-hover disabled:cursor-default disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus"

              >

                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tile.className}`}>

                  <Icon className="h-4 w-4" aria-hidden />

                </span>

                <span className="min-w-0 flex-1">

                  <span className="block text-sm text-hrms-navy">{item.sentence}</span>

                  <span className="mt-0.5 block text-xs text-hrms-text-secondary">

                    by {item.actorName} ·{' '}

                    <time dateTime={item.at} title={formatDate(item.at.slice(0, 10))}>

                      {formatRelativeTime(item.at)}

                    </time>

                  </span>

                </span>

              </button>

            </li>

          )

        })}

      </ul>

      <RequestDetailDialog
        open={Boolean(detail)}
        request={detail}
        employeeName={
          detail ? snapshot.employees.find((item) => item.id === detail.employeeId)?.name : undefined
        }
        balanceBefore={detail ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) : 0}
        balanceAfter={detail ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) - detail.days : 0}
        onOpenChange={(open) => !open && setDetail(null)}
        useLiveApi={Boolean(snapshot.api)}
        useLiveApprovalHistory={Boolean(snapshot.api)}
      />

    </OverviewCard>

  )

}


