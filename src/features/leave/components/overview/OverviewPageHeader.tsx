import { Info, Plus, RefreshCw, Download } from 'lucide-react'
import type { ReactNode } from 'react'

import { useLeaveViewer } from '../../hooks/useLeaveViewer'
import { formatOverviewTodayLabel } from '../../utils/formatOverviewToday'
import { OV_BTN_PRIMARY, OV_BTN_SECONDARY, OV_FOCUS } from './overviewVisual'
import { cn } from '@/lib/utils'

type Props = {
  actions: ReactNode
  infoOpen: boolean
  onToggleInfo: () => void
  infoContent: ReactNode
  superAdminSubtitle?: boolean
}

export function OverviewPageHeader({ actions, infoOpen, onToggleInfo, infoContent, superAdminSubtitle }: Props) {
  const { viewer, role } = useLeaveViewer()
  const email = viewer.email ?? viewer.displayName

  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-col flex-wrap justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#17213A]">Leave overview</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[#667085]">
            <span>{formatOverviewTodayLabel()}</span>
            <span className="rounded-full bg-[#F0EDFF] px-2.5 py-0.5 text-xs font-semibold text-[#5938DB]">
              {role.replaceAll('_', ' ')}
            </span>
            <span>{email}</span>
            <button
              type="button"
              aria-label="About overview data sources"
              aria-expanded={infoOpen}
              onClick={onToggleInfo}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#667085] transition-colors hover:bg-[#F3F4F8]',
                OV_FOCUS,
              )}
            >
              <Info className="h-4 w-4" aria-hidden />
            </button>
          </div>
          {superAdminSubtitle ? (
            <p className="mt-1 text-[13px] text-[#667085]">Company-wide leave posture with super admin tools.</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      {infoOpen ? (
        <div className="rounded-xl bg-[#EEF0F6] px-4 py-3 text-[13px] leading-relaxed text-[#667085]">{infoContent}</div>
      ) : null}
    </header>
  )
}

export function OverviewHeaderActionButtons({
  primary,
  secondary,
}: {
  primary?: ReactNode
  secondary?: ReactNode
}) {
  return (
    <>
      {primary}
      {secondary}
    </>
  )
}

export const overviewActionButtonPrimaryClass = OV_BTN_PRIMARY
export const overviewActionButtonSecondaryClass = OV_BTN_SECONDARY

export function OverviewActionIcons() {
  return {
    plus: Plus,
    refresh: RefreshCw,
    download: Download,
  }
}