import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { RecruitmentDemoPill } from './RecruitmentDemoPill'
import { RECRUITMENT_ACTIVE_SECTION_PILL } from './shared/recruitmentUi'

type RecruitmentPageHeaderProps = {
  activeSection: string
  trailing?: ReactNode
  className?: string
}

export function RecruitmentPageHeader({
  activeSection,
  trailing,
  className,
}: RecruitmentPageHeaderProps) {
  const isOverview = activeSection === 'Overview'

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <h1 className="text-[28px] font-bold tracking-tight text-[#17213A]">
          Recruitment &amp; ATS
        </h1>
        {isOverview ? (
          <RecruitmentDemoPill />
        ) : (
          <p className={RECRUITMENT_ACTIVE_SECTION_PILL}>{activeSection}</p>
        )}
      </div>
      {trailing ? <div className="flex shrink-0 flex-wrap items-center gap-2">{trailing}</div> : null}
    </div>
  )
}