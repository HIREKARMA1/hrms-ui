import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { RecruitmentPageHeader } from './RecruitmentPageHeader'
import {
  RECRUITMENT_PAGE_INNER,
  RECRUITMENT_PAGE_SHELL,
} from './shared/recruitmentUi'

type RecruitmentPageShellProps = {
  activeSection: string
  trailing?: ReactNode
  wide?: boolean
  children: ReactNode
}

export function RecruitmentPageShell({
  activeSection,
  trailing,
  wide,
  children,
}: RecruitmentPageShellProps) {
  return (
    <div className={RECRUITMENT_PAGE_SHELL}>
      <div
        className={cn(RECRUITMENT_PAGE_INNER, wide && 'max-w-[1600px]')}
      >
        <RecruitmentPageHeader activeSection={activeSection} trailing={trailing} />
        {children}
      </div>
    </div>
  )
}