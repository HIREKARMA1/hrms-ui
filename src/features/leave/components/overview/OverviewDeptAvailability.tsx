/**
 * Department availability bars for today with coverage limit marker.
 */

import { useMemo } from 'react'

import { cn } from '@/lib/utils'

import type { LeaveSnapshot } from '../../services/leaveService'
import { departmentAvailabilityToday, type DeptAvailabilityRow } from '../../utils/overviewDeptAvailability'
import { isTeamCoverageConfigured } from '../../utils/overviewTeamCoverage'
import { OverviewCard } from './OverviewCard'
import { OV_FOCUS } from './overviewVisual'

type Props = {
  snapshot?: LeaveSnapshot
  liveRows?: DeptAvailabilityRow[]
  coverageLimit?: number | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onDepartmentSelect: (department: string) => void
}

export function OverviewDeptAvailability({
  snapshot,
  liveRows,
  coverageLimit,
  loading,
  error,
  onRetry,
  onDepartmentSelect,
}: Props) {
  const rows = useMemo(() => {
    if (liveRows) return liveRows
    if (!snapshot) return []
    return departmentAvailabilityToday(snapshot)
  }, [liveRows, snapshot])

  const rawLimit = snapshot?.settings.teamCoverage.maxSameDepartmentPerDay
  const limit =
    coverageLimit !== undefined
      ? coverageLimit
      : rawLimit !== undefined && isTeamCoverageConfigured(rawLimit)
        ? rawLimit
        : null

  const maxHead = Math.max(1, ...rows.map((row) => row.headcount))
  const empty = rows.length === 0

  return (
    <OverviewCard
      chrome="overview"
      title="Department availability"
      description="On leave today versus active headcount."
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={empty}
      fillHeight
      skeleton="list"
    >
      <ul className="space-y-4">
        {rows.map((row) => {
          const ratio = row.onLeave / maxHead
          const marker = limit !== null ? (limit / maxHead) * 100 : null
          const barClass = 'bg-[#5938DB]'

          return (
            <li key={row.department}>
              <button
                type="button"
                className={cn('w-full rounded-lg px-0.5 py-0.5 text-left hover:bg-[#F3F4F8]', OV_FOCUS)}
                onClick={() => onDepartmentSelect(row.department)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-[#17213A]">{row.department}</span>
                  <span className="text-[12.5px] text-[#667085]">
                    {row.onLeave} of {row.headcount} · {row.percent}%
                  </span>
                </div>
                <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EEF0F6]">
                  <span
                    className={cn('block h-2 rounded-full', barClass)}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
                  />
                  {marker !== null ? (
                    <span
                      className="absolute top-0 h-2 w-0.5 bg-[#17213A]/40"
                      style={{ left: `${Math.min(100, marker)}%` }}
                      title="Coverage limit"
                    />
                  ) : null}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {limit !== null ? (
        <p className="mt-4 text-xs text-[#98A2B3]">Marker = coverage limit ({limit} per department per day)</p>
      ) : (
        <p className="mt-4 text-xs text-[#98A2B3]">Coverage limits are not configured on the server.</p>
      )}
    </OverviewCard>
  )
}