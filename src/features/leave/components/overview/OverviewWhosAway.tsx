/**
 * Who is away card with compact rows and request detail dialog.
 */

import { useMemo, useState } from 'react'

import type { LeaveSnapshot } from '../../services/leaveService'
import type { LeaveRequest } from '../../types/leaveRequest'
import { formatBackOnLabel, formatDateRange } from '../../utils/formatDateRange'
import { listWhosAway, type WhosAwayRow, type WhosAwayWindow } from '../../utils/overviewWhosAway'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { LeaveSegmentedControl } from '../shared/LeaveSegmentedControl'
import { RequestDetailDialog } from '../dialogs/RequestDetailDialog'
import { OverviewCard } from './OverviewCard'
import { OV_FOCUS } from './overviewVisual'
import { cn } from '@/lib/utils'

const WINDOWS = [
  { value: 'today' as const, label: 'Today' },
  { value: 'next_7' as const, label: 'Next 7 days' },
  { value: 'next_30' as const, label: 'Next 30 days' },
]

type Props = {
  snapshot: LeaveSnapshot
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  liveTodayRows?: WhosAwayRow[]
  liveTodayLoading?: boolean
  liveTodayError?: string | null
  onRetryLiveToday?: () => void
  whosAwayFromCalendar?: (window: WhosAwayWindow) => WhosAwayRow[] | undefined
  calendarWindowLoading?: boolean
  calendarWindowError?: string | null
  onRetryCalendarWindow?: () => void
}

export function OverviewWhosAway({
  snapshot,
  loading,
  error,
  onRetry,
  liveTodayRows,
  liveTodayLoading,
  liveTodayError,
  onRetryLiveToday,
  whosAwayFromCalendar,
  calendarWindowLoading,
  calendarWindowError,
  onRetryCalendarWindow,
}: Props) {
  const [window, setWindow] = useState<WhosAwayWindow>('today')
  const [detail, setDetail] = useState<LeaveRequest | null>(null)

  const useLiveToday = window === 'today' && liveTodayRows !== undefined
  const calendarRows = whosAwayFromCalendar?.(window)

  const rows = useMemo(() => {
    if (useLiveToday) return liveTodayRows
    if (calendarRows) return calendarRows
    return listWhosAway(snapshot, window)
  }, [calendarRows, liveTodayRows, snapshot, useLiveToday, window])

  const useCalendarPanel = window !== 'today' && calendarRows !== undefined
  const panelLoading = useLiveToday ? liveTodayLoading : useCalendarPanel ? calendarWindowLoading : loading
  const panelError = useLiveToday ? liveTodayError : useCalendarPanel ? calendarWindowError : error
  const panelRetry = useLiveToday
    ? onRetryLiveToday
    : useCalendarPanel
      ? onRetryCalendarWindow
      : onRetry

  const empty = rows.length === 0
  const emptyMessage = 'Nobody is away in this window.'

  return (
    <OverviewCard
      chrome="overview"
      title="Who's away"
      description="Approved leave in the selected window."
      loading={panelLoading}
      error={panelError}
      onRetry={panelRetry}
      empty={empty}
      emptyMessage={emptyMessage}
      fillHeight
      skeleton="list"
    >
      <LeaveSegmentedControl
        options={WINDOWS}
        value={window}
        onChange={setWindow}
        ariaLabel="Away window"
        appearance="overview"
      />

      {empty ? (
        <p className="mt-6 text-center text-[13px] text-[#98A2B3]">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 divide-y divide-[#E2E6EF] border-t border-[#E2E6EF]">
          {rows.map((row) => (
            <li key={row.requestId}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-[#F3F4F8]',
                  OV_FOCUS,
                )}
                onClick={() => setDetail(snapshot.requests.find((item) => item.id === row.requestId) ?? null)}
              >
                <Initials name={row.employeeName} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[#17213A]">{row.employeeName}</span>
                  <span className="block text-xs text-[#98A2B3]">{row.department}</span>
                </span>
                <span className="shrink-0 text-right text-xs">
                  <LeaveTypeTag code={row.leaveTypeCode} />
                  <span className="mt-1 block text-[#667085]">{formatDateRange(row.fromDate, row.toDate)}</span>
                  <span className="block text-[#98A2B3]">{formatBackOnLabel(row.backOn)}</span>
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
        balanceAfter={
          detail
            ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) - detail.days
            : 0
        }
        onOpenChange={(open) => !open && setDetail(null)}
        useLiveApi={Boolean(snapshot.api)}
        useLiveApprovalHistory={Boolean(snapshot.api)}
      />
    </OverviewCard>
  )
}

function Initials({ name }: { name: string }) {
  const parts = name.split(' ').filter(Boolean)
  const initials = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0EDFF] text-xs font-semibold text-[#5938DB]"
      aria-hidden
    >
      {initials}
    </span>
  )
}

function LeaveTypeTag({ code }: { code: string }) {
  return (
    <span className="inline-block rounded-md bg-[#F0EDFF] px-1.5 py-0.5 text-[11px] font-bold text-[#5938DB]">
      {code}
    </span>
  )
}