import { ChevronRight } from 'lucide-react'

import type { LeadActivityRow } from '../../utils/leadsOverviewInsights'
import { formatLeadDate } from '../../utils/formatLeadDate'
import { LeadsOverviewActivityIcon } from './LeadsOverviewActivityIcon'
import { OVERVIEW_FOCUS, OVERVIEW_MOTION } from './leadsOverviewUi'

type LeadsRecentActivityListProps = {
  items: LeadActivityRow[]
  onOpenLead: (id: string) => void
}

const GRID_COLS =
  'grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_20px] items-center gap-3'

export function LeadsRecentActivityList({ items, onOpenLead }: LeadsRecentActivityListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={`${GRID_COLS} shrink-0 rounded-lg bg-[#EEF0F6] px-3 py-2`}>
        <span className="text-xs font-semibold text-[#667085]">Activity</span>
        <span className="hidden text-xs font-semibold text-[#667085] min-[640px]:block">Lead</span>
        <span className="text-xs font-semibold text-[#667085]">When</span>
        <span className="sr-only">Open</span>
      </div>
      {items.length === 0 ? (
        <p className="flex flex-1 items-center justify-center px-3 py-8 text-center text-sm text-[#667085]">
          No activity yet.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {items.map((item) => (
            <li key={item.id} className="border-b border-[#F3F4F8] last:border-0">
              <button
                type="button"
                onClick={() => onOpenLead(item.leadId)}
                className={`${GRID_COLS} w-full px-3 py-2.5 text-left ${OVERVIEW_MOTION} hover:bg-[#F3F4F8] ${OVERVIEW_FOCUS}`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <LeadsOverviewActivityIcon type={item.type} summary={item.summary} />
                  <span className="truncate text-[13.5px] font-semibold text-[#17213A]">{item.summary}</span>
                </span>
                <span className="hidden truncate text-[13px] text-[#17213A] min-[640px]:block">
                  {item.companyName}
                </span>
                <span className="whitespace-nowrap text-[12.5px] text-[#667085]">
                  {formatLeadDate(item.createdAt)}
                </span>
                <ChevronRight className="h-4 w-4 text-[#98A2B3]" aria-hidden />
              </button>
              <p className="px-3 pb-2 text-xs text-[#667085] min-[640px]:hidden">{item.companyName}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}