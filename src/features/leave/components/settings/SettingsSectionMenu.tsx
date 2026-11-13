/**
 * Sticky section nav for Leave Settings (vertical or horizontal chips below 900px).
 */

import { cn } from '@/lib/utils'

import { LEAVE_SETTINGS_SECTIONS, type LeaveSettingsSectionId } from '../../constants/leaveSettingsSections'
import type { SettingsValidationIssue } from '../../utils/validateLeaveSettings'
import { leaveSettingsSectionDirty } from '../../utils/leaveSettingsSectionDiff'
import type { LeaveSettings } from '../../types/leaveSettings'
import { LEAVE_MOTION } from '../shared/leaveUi'

type SettingsSectionMenuProps = {
  active: LeaveSettingsSectionId
  onSelect: (id: LeaveSettingsSectionId) => void
  draft: LeaveSettings
  saved: LeaveSettings
  issues: SettingsValidationIssue[]
}

export function SettingsSectionMenu({ active, onSelect, draft, saved, issues }: SettingsSectionMenuProps) {
  return (
    <nav aria-label="Settings sections" className="min-w-0 lg:sticky lg:top-0 lg:self-start lg:w-56">
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {LEAVE_SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon
          const dirty = leaveSettingsSectionDirty(draft, saved, section.id)
          const errored = issues.some((item) => item.section === section.id)
          return (
            <li key={section.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium',
                  LEAVE_MOTION,
                  active === section.id ? 'bg-hrms-lavender text-hrms-primary' : 'text-hrms-text-secondary hover:bg-hrms-row-hover',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{section.label}</span>
                {errored ? <span className="ml-auto h-2 w-2 rounded-full bg-hrms-danger" aria-label="Has errors" /> : null}
                {!errored && dirty ? <span className="ml-auto h-2 w-2 rounded-full bg-hrms-primary" aria-label="Unsaved" /> : null}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
