/**

 * Who is away card with compact rows and request detail dialog.

 */



import { useMemo, useState } from 'react'

import { Palmtree } from 'lucide-react'



import type { LeaveSnapshot } from '../../services/leaveService'

import type { LeaveRequest } from '../../types/leaveRequest'

import { formatBackOnLabel, formatDateRange } from '../../utils/formatDateRange'

import { listWhosAway, type WhosAwayWindow } from '../../utils/overviewWhosAway'

import { ledgerBalanceForType } from '../../utils/calculateBalance'

import { LeaveSegmentedControl } from '../shared/LeaveSegmentedControl'

import { LeaveTypeChip } from '../LeaveTypeChip'

import { RequestDetailDialog } from '../dialogs/RequestDetailDialog'

import { OverviewCard } from './OverviewCard'



const WINDOWS = [

  { value: 'today' as const, label: 'Today' },

  { value: 'next_7' as const, label: 'Next 7 days' },

  { value: 'next_30' as const, label: 'Next 30 days' },

]



type Props = { snapshot: LeaveSnapshot; loading?: boolean; error?: string | null; onRetry?: () => void }



export function OverviewWhosAway({ snapshot, loading, error, onRetry }: Props) {

  const [window, setWindow] = useState<WhosAwayWindow>('today')

  const [detail, setDetail] = useState<LeaveRequest | null>(null)

  const rows = useMemo(() => listWhosAway(snapshot, window), [snapshot, window])

  const empty = rows.length === 0

  const emptyMessage = 'Nobody is away today.'



  return (

    <OverviewCard title="Who's away" description="Approved leave in the selected window." loading={loading} error={error} onRetry={onRetry} empty={empty} emptyMessage={emptyMessage} fillHeight skeleton="list">

      <LeaveSegmentedControl options={WINDOWS} value={window} onChange={setWindow} ariaLabel="Away window" />

      {empty ? (

        <div className="mt-4 flex items-center gap-2 text-sm text-hrms-text-secondary">

          <Palmtree className="h-4 w-4 text-hrms-primary" aria-hidden />

          <span>{emptyMessage}</span>

        </div>

      ) : (

        <ul className="mt-3 divide-y divide-hrms-border/60">

          {rows.map((row) => (

            <li key={row.requestId}>

              <button

                type="button"

                className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-hrms-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus"

                onClick={() => setDetail(snapshot.requests.find((item) => item.id === row.requestId) ?? null)}

              >

                <Initials name={row.employeeName} />

                <span className="min-w-0 flex-1">

                  <span className="block font-medium text-hrms-navy">{row.employeeName}</span>

                  <span className="block text-xs text-hrms-text-secondary">{row.department}</span>

                </span>

                <span className="shrink-0 text-right text-xs">

                  <LeaveTypeChip code={row.leaveTypeCode} abbreviated className="justify-end" />

                  <span className="mt-1 block text-hrms-text-secondary">{formatDateRange(row.fromDate, row.toDate)}</span>

                  <span className="block text-hrms-text-muted">{formatBackOnLabel(row.backOn)}</span>

                </span>

              </button>

            </li>

          ))}

        </ul>

      )}

      <RequestDetailDialog
        open={Boolean(detail)}
        request={detail}
        employeeName={
          detail ? snapshot.employees.find((item) => item.id === detail.employeeId)?.name : undefined
        }
        balanceBefore={detail ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) : 0}
        balanceAfter={detail ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) - detail.days : 0}
        onOpenChange={(open) => !open && setDetail(null)}
      />

    </OverviewCard>

  )

}



function Initials({ name }: { name: string }) {

  const parts = name.split(' ').filter(Boolean)

  const initials = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()

  return (

    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hrms-lavender text-xs font-semibold text-hrms-primary" aria-hidden>

      {initials}

    </span>

  )

}


