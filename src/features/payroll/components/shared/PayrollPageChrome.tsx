/**
 * In-flow page title and section tabs (no sticky) so tab panels keep full height below.
 * Sticky was overlapping content inside main's overflow scrollport.
 */

import type { ReactNode } from 'react'

import { PAYROLL_PAGE_SCROLL_BG } from './payrollUi'

type PayrollPageChromeProps = {
  header: ReactNode
  /** @deprecated Sidebar is primary nav (Phase A); optional legacy tab row. */
  tabs?: ReactNode
}

export function PayrollPageChrome({ header, tabs }: PayrollPageChromeProps) {
  return (
    <header className={`w-full border-b border-hrms-border pb-2 ${PAYROLL_PAGE_SCROLL_BG}`}>
      <div className="flex w-full flex-col gap-2">
        {header}
        {tabs}
      </div>
    </header>
  )
}
