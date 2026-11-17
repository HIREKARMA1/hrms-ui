/**
 * Row of links to related payroll tabs for a settings section.
 */

import type { PayrollPageTabId } from '../../hooks/usePayrollPageTabs'
import type { PayrollSettingsRelatedLink } from '../../constants/payrollSettingsRelatedTabs'
import { PayrollSettingsModuleLink } from './PayrollSettingsModuleLink'

type PayrollSettingsRelatedActionsProps = {
  links: PayrollSettingsRelatedLink[]
  onNavigate: (tab: PayrollPageTabId) => void
}

export function PayrollSettingsRelatedActions({ links, onNavigate }: PayrollSettingsRelatedActionsProps) {
  if (links.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-hrms-border/60 pb-4">
      <span className="text-xs font-medium uppercase tracking-wide text-hrms-text-muted">Related</span>
      {links.map((item) => (
        <PayrollSettingsModuleLink key={item.tab} tab={item.tab} label={item.label} onNavigate={onNavigate} />
      ))}
    </div>
  )
}