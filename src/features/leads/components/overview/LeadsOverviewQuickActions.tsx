import { Copy, GitBranch, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { LeadsPageTabId } from '../../hooks/useLeadsPageTabs'
import { OVERVIEW_FOCUS, OVERVIEW_MOTION } from './leadsOverviewUi'

type LeadsOverviewQuickActionsProps = {
  duplicateCount: number
  showAdminLinks: boolean
  onCreate?: () => void
  onNavigate: (tab: LeadsPageTabId) => void
}

const ACTION_BASE =
  'inline-flex h-11 items-center justify-center gap-1.5 rounded-[10px] px-4 text-sm font-semibold'

export function LeadsOverviewQuickActions({
  duplicateCount,
  showAdminLinks,
  onCreate,
  onNavigate,
}: LeadsOverviewQuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E6EF] px-5 py-4">
      <span className="text-xs font-semibold tracking-[0.06em] text-[#667085]">QUICK ACTIONS</span>
      <div className="flex flex-wrap gap-2">
        {onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className={cn(
              ACTION_BASE,
              OVERVIEW_MOTION,
              OVERVIEW_FOCUS,
              'bg-[#5938DB] text-white hover:bg-[#7055EB]',
            )}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Create lead
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onNavigate('Pipeline')}
          className={cn(
            ACTION_BASE,
            OVERVIEW_MOTION,
            OVERVIEW_FOCUS,
            'bg-[#F0EDFF] text-[#5938DB] hover:bg-[#E8E4FF]',
          )}
        >
          <GitBranch className="h-4 w-4" aria-hidden />
          Open pipeline
        </button>
        {showAdminLinks ? (
          <>
            <button
              type="button"
              onClick={() => onNavigate('All Leads')}
              className={cn(
                ACTION_BASE,
                OVERVIEW_MOTION,
                OVERVIEW_FOCUS,
                'border border-[#E2E6EF] bg-white text-[#17213A] hover:bg-[#F3F4F8]',
              )}
            >
              All leads
            </button>
            <button
              type="button"
              onClick={() => onNavigate('Duplicates')}
              className={cn(
                ACTION_BASE,
                OVERVIEW_MOTION,
                OVERVIEW_FOCUS,
                'border border-[#E2E6EF] bg-white text-[#17213A] hover:bg-[#F3F4F8]',
              )}
            >
              <Copy className="h-4 w-4" aria-hidden />
              Duplicates
              {duplicateCount > 0 ? (
                <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-semibold text-[#92400E]">
                  {duplicateCount}
                </span>
              ) : null}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('Team Leads')}
            className={cn(
              ACTION_BASE,
              OVERVIEW_MOTION,
              OVERVIEW_FOCUS,
              'border border-[#E2E6EF] bg-white text-[#17213A] hover:bg-[#F3F4F8]',
            )}
          >
            Team leads
          </button>
        )}
      </div>
    </div>
  )
}