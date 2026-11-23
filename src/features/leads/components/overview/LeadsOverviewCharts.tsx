import {
  LEADS_OVERVIEW_ACTIVE_STATUSES,
  LEADS_OVERVIEW_STATUS_COLORS,
} from '../../constants/leadsOverviewStatusColors'
import type { LeadStatus } from '../../types/lead'
import { OVERVIEW_FOCUS, OVERVIEW_MOTION } from './leadsOverviewUi'

type FunnelRow = { status: string; count: number }

export function LeadsPipelineFunnelCard({
  data,
  wonCount,
  lostCount,
  onStatusClick,
}: {
  data: FunnelRow[]
  wonCount: number
  lostCount: number
  onStatusClick?: () => void
}) {
  const activeRows = LEADS_OVERVIEW_ACTIVE_STATUSES.map((status) => {
    const row = data.find((item) => item.status === status)
    return { status, count: row?.count ?? 0 }
  })
  const maxCount = Math.max(1, ...activeRows.map((row) => row.count))

  return (
    <div className="flex h-full min-h-[220px] flex-col">
      <ul className="space-y-3">
        {activeRows.map((row) => {
          const color = LEADS_OVERVIEW_STATUS_COLORS[row.status as LeadStatus]
          const widthPct = row.count === 0 ? 0 : (row.count / maxCount) * 100
          return (
            <li key={row.status}>
              <div className="flex items-center gap-3">
                <span className="w-[92px] shrink-0 text-[13px] text-[#667085]">{row.status}</span>
                <div className="min-w-0 flex-1">
                  <div className="h-3.5 overflow-hidden rounded-full bg-[#EEF0F6]">
                    <button
                      type="button"
                      onClick={() => onStatusClick?.()}
                      className={`block h-full rounded-full ${OVERVIEW_MOTION} ${OVERVIEW_FOCUS} cursor-pointer hover:brightness-95`}
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: color,
                        minWidth: row.count > 0 ? '6px' : 0,
                      }}
                      aria-label={`${row.status}: ${row.count} leads`}
                    />
                  </div>
                </div>
                <span className="w-8 shrink-0 text-right text-[13px] font-bold tabular-nums text-[#17213A]">
                  {row.count}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      <footer className="mt-auto border-t border-[#E2E6EF] pt-3">
        <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-[#667085]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" aria-hidden />
            Won {wonCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" aria-hidden />
            Lost {lostCount}
          </span>
          <span>Closed stages, not shown in the funnel</span>
        </div>
      </footer>
    </div>
  )
}
