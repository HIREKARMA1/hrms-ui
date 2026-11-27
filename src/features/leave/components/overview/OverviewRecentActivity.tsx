/**
 * Recent activity list with status chips (no horizontal scroll).
 */

import { useMemo, useState } from 'react'

import type { LeaveSnapshot } from '../../services/leaveService'
import type { LeaveRequest } from '../../types/leaveRequest'
import { buildRecentActivity, type RecentActivityItem } from '../../utils/buildRecentActivity'
import { activityKindLabel } from '../../utils/activityKindLabel'
import { formatRelativeTime } from '../../utils/formatRelativeTime'
import { formatDate } from '../../utils/formatDate'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { RequestDetailDialog } from '../dialogs/RequestDetailDialog'
import { OverviewCard } from './OverviewCard'
import { ACTIVITY_CHIP_STYLES, ACTIVITY_ICONS } from './OverviewActivityIcons'
import { OV_FOCUS } from './overviewVisual'
import { cn } from '@/lib/utils'

type Props = {
  snapshot: LeaveSnapshot
  items?: RecentActivityItem[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onViewAll: () => void
  description?: string
  emptyMessage?: string
}

export function OverviewRecentActivity({
  snapshot,
  items: itemsProp,
  loading,
  error,
  onRetry,
  onViewAll,
  description,
  emptyMessage,
}: Props) {
  const [detail, setDetail] = useState<LeaveRequest | null>(null)
  const items = useMemo(() => itemsProp ?? buildRecentActivity(snapshot), [itemsProp, snapshot])
  const empty = items.length === 0
  const serverMode = Boolean(snapshot.api)
  const resolvedDescription =
    description ??
    (serverMode
      ? 'Last 8 events from the 13 most recent leave requests.'
      : 'Last eight events across leave requests and accruals.')
  const resolvedEmpty =
    emptyMessage ??
    (serverMode ? 'No recent leave events in the loaded request window.' : 'No recent activity to show.')

  const activitySnapshot = useMemo(() => snapshot, [snapshot])

  return (
    <OverviewCard
      chrome="overview"
      title="Recent activity"
      description={resolvedDescription}
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={empty}
      emptyMessage={resolvedEmpty}
      fillHeight
      scrollBody
      skeleton="list"
      headerAside={
        <button
          type="button"
          className={cn('text-[13px] font-semibold text-[#5938DB] hover:text-[#7055EB]', OV_FOCUS)}
          onClick={onViewAll}
        >
          View all
        </button>
      }
    >
      <ul className="divide-y divide-[#E2E6EF]">
        {items.map((item) => (
          <ActivityListRow
            key={item.id}
            item={item}
            onOpen={() =>
              item.requestId &&
              setDetail(activitySnapshot.requests.find((row) => row.id === item.requestId) ?? null)
            }
          />
        ))}
      </ul>
      <RequestDetailDialog
        open={Boolean(detail)}
        request={detail}
        employeeName={
          detail ? activitySnapshot.employees.find((item) => item.id === detail.employeeId)?.name : undefined
        }
        balanceBefore={
          detail
            ? ledgerBalanceForType(activitySnapshot.ledger, detail.employeeId, detail.leaveTypeCode)
            : 0
        }
        balanceAfter={
          detail
            ? ledgerBalanceForType(activitySnapshot.ledger, detail.employeeId, detail.leaveTypeCode) -
              detail.days
            : 0
        }
        onOpenChange={(open) => !open && setDetail(null)}
        useLiveApi={Boolean(activitySnapshot.api)}
        useLiveApprovalHistory={Boolean(activitySnapshot.api)}
      />
    </OverviewCard>
  )
}

function ActivityListRow({ item, onOpen }: { item: RecentActivityItem; onOpen: () => void }) {
  const tile = ACTIVITY_ICONS[item.kind]
  const chip = ACTIVITY_CHIP_STYLES[item.kind]
  const Icon = tile.icon
  return (
    <li>
      <button
        type="button"
        disabled={!item.requestId}
        onClick={onOpen}
        className={cn(
          'flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-[#F3F4F8] disabled:cursor-default disabled:hover:bg-transparent',
          OV_FOCUS,
        )}
      >
        <EmployeeAvatar name={item.employeeName} />
        <span className="min-w-0 flex-1 font-semibold text-[#17213A]">{item.employeeName}</span>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
            chip.className,
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {activityKindLabel(item.kind)}
        </span>
      </button>
      <p className="sr-only">
        {formatRelativeTime(item.at)} · {item.sentence}
      </p>
      <time className="sr-only" dateTime={item.at} title={formatDate(item.at.slice(0, 10))}>
        {formatRelativeTime(item.at)}
      </time>
    </li>
  )
}

function EmployeeAvatar({ name }: { name: string }) {
  const parts = name.split(' ').filter(Boolean)
  const initials = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  return (
    <span
      className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#F0EDFF] text-[11px] font-semibold text-[#5938DB]"
      aria-hidden
    >
      {initials}
    </span>
  )
}