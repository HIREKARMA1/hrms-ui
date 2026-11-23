/**
 * Section nav for Payroll Settings (vertical list; horizontal chips on small screens).
 */

import { cn } from '@/lib/utils'

import {
  PAYROLL_SETTINGS_SECTIONS,
  type PayrollSettingsSectionId,
} from '../../constants/payrollSettingsSections'
import type { PayrollSettingsValidationIssue } from '../../utils/validatePayrollSettings'
import { PAYROLL_MOTION } from '../shared/payrollUi'

type PayrollSettingsSectionMenuProps = {
  active: PayrollSettingsSectionId
  onSelect: (id: PayrollSettingsSectionId) => void
  issues: PayrollSettingsValidationIssue[]
  isDirty: boolean
}

export function PayrollSettingsSectionMenu({
  active,
  onSelect,
  issues,
  isDirty,
}: PayrollSettingsSectionMenuProps) {
  return (
    <nav aria-label="Payroll settings sections" className="min-w-0 lg:sticky lg:top-0 lg:self-start lg:w-56">
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {PAYROLL_SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon
          const isActive = active === section.id
          const errored = issues.some((item) => item.section === section.id)
          return (
            <li key={section.id} className="shrink-0 lg:w-full">
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={cn(
                  'flex w-full min-w-[8.5rem] items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium lg:min-w-0',
                  PAYROLL_MOTION,
                  isActive ? 'bg-hrms-lavender text-hrms-primary shadow-sm' : 'text-hrms-text-secondary hover:bg-hrms-row-hover',
                )}
                aria-current={isActive ? 'true' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{section.label}</span>
                {errored ? (
                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-hrms-danger" aria-label="Validation errors" />
                ) : null}
                {!errored && isActive && isDirty ? (
                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-hrms-primary" aria-label="Unsaved" />
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}