import { LEAD_STATUSES } from '../../constants/leadOptions'
import { LEADS_OVERVIEW_STATUS_COLORS } from '../../constants/leadsOverviewStatusColors'
import type { LeadStatus } from '../../types/lead'
import { OVERVIEW_CARD, OVERVIEW_FOCUS, OVERVIEW_MOTION, OVERVIEW_TITLE } from './leadsOverviewUi'

type LeadsStatusSnapshotProps = {
  counts: Record<string, number>
  onOpenPipeline?: () => void
}

export function LeadsStatusSnapshot({ counts, onOpenPipeline }: LeadsStatusSnapshotProps) {
  return (
    <section className={`${OVERVIEW_CARD} px-5 py-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className={OVERVIEW_TITLE}>Status snapshot</h2>
        {onOpenPipeline ? (
          <button
            type="button"
            onClick={onOpenPipeline}
            className={`${OVERVIEW_MOTION} ${OVERVIEW_FOCUS} ml-auto text-[13px] font-semibold text-[#5938DB] hover:text-[#7055EB]`}
          >
            Open pipeline
          </button>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {LEAD_STATUSES.map((status) => {
          const count = counts[status] ?? 0
          const dot = LEADS_OVERVIEW_STATUS_COLORS[status as LeadStatus]
          return (
            <div key={status} className="flex h-[34px] items-center gap-2 rounded-full border border-[#E2E6EF] bg-white px-3">
              <span
                className="h-[9px] w-[9px] shrink-0 rounded-full"
                style={{ backgroundColor: dot }}
                aria-hidden
              />
              <span className="text-[13px] font-medium text-[#17213A]">{status}</span>
              <span className="text-[13px] font-bold tabular-nums text-[#667085]">{count}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}