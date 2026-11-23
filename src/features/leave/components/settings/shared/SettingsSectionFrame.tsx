/**
 * Section title, description, and "Used in" chips for Leave Settings panels.
 */

import type { ReactNode } from 'react'

import { LEAVE_SETTINGS_SECTIONS, type LeaveSettingsSectionId } from '../../../constants/leaveSettingsSections'
import { LEAVE_SETTINGS_SECTION_USES } from '../../../constants/leaveSettingsSectionUses'

export function SettingsSectionFrame({ sectionId, children }: { sectionId: LeaveSettingsSectionId; children: ReactNode }) {
  const meta = LEAVE_SETTINGS_SECTIONS.find((item) => item.id === sectionId)!
  const uses = LEAVE_SETTINGS_SECTION_USES[sectionId]

  return (
    <div className="min-w-0">
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-hrms-navy">{meta.label}</h3>
        <p className="mt-1 text-sm text-hrms-text-secondary">{meta.description}</p>
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-hrms-text-secondary">
          <span className="font-medium text-hrms-navy">Used in:</span>
          {uses.map((chip) => (
            <span key={chip} className="rounded-md bg-hrms-muted-bg px-2 py-0.5 font-medium">
              {chip}
            </span>
          ))}
        </p>
      </header>
      {children}
    </div>
  )
}
