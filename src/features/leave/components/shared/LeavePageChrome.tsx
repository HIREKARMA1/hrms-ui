/**
 * In-flow page title; optional legacy tab row (sidebar is primary nav).
 */

import type { ReactNode } from 'react'

type LeavePageChromeProps = {
  header: ReactNode
  tabs?: ReactNode
}

export function LeavePageChrome({ header, tabs }: LeavePageChromeProps) {
  return (
    <div className="w-full min-w-0">
      <div className="flex w-full flex-col gap-2">{header}</div>
      {tabs ? <div className="border-b border-hrms-border pt-1">{tabs}</div> : null}
    </div>
  )
}
