/**
 * Section title and "Used in" chips for Payroll Settings panels.
 */

import type { ReactNode } from 'react'

import type { PayrollPageTabId } from '../../../hooks/usePayrollPageTabs'
import {
  PAYROLL_SETTINGS_SECTIONS,
  PAYROLL_SETTINGS_SECTION_USES,
  type PayrollSettingsSectionId,
} from '../../../constants/payrollSettingsSections'
import { PAYROLL_SETTINGS_SECTION_LINKS } from '../../../constants/payrollSettingsRelatedTabs'
import { PayrollSettingsRelatedActions } from '../PayrollSettingsRelatedActions'

type PayrollSettingsSectionFrameProps = {
  sectionId: PayrollSettingsSectionId
  onNavigateTab: (tab: PayrollPageTabId) => void
  children: ReactNode
}

export function PayrollSettingsSectionFrame({ sectionId, onNavigateTab, children }: PayrollSettingsSectionFrameProps) {
  const meta = PAYROLL_SETTINGS_SECTIONS.find((item) => item.id === sectionId)!
  const uses = PAYROLL_SETTINGS_SECTION_USES[sectionId]
  const relatedLinks = PAYROLL_SETTINGS_SECTION_LINKS[sectionId]

  return (
    <div className="min-w-0">
      <header className="mb-2">
        <h3 className="text-lg font-semibold text-hrms-navy">{meta.label}</h3>
        <p className="mt-1 text-sm text-hrms-text-secondary">{meta.description}</p>
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-hrms-text-secondary">
          <span className="font-medium text-hrms-navy">Affects:</span>
          {uses.map((chip) => (
            <span key={chip} className="rounded-md bg-hrms-muted-bg px-2 py-0.5 font-medium">
              {chip}
            </span>
          ))}
        </p>
      </header>
      <PayrollSettingsRelatedActions links={relatedLinks} onNavigate={onNavigateTab} />
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  )
}