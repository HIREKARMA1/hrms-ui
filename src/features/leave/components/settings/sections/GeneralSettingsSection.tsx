/**
 * General leave settings with plain labels and leave-year change confirmation.
 */

import { useState } from 'react'

import type { LeaveSettings } from '../../../types/leaveSettings'
import { LeaveConfirmDialog } from '../../shared/LeaveConfirmDialog'
import { SettingsField } from '../shared/SettingsField'
import { SettingsSegmented } from '../shared/SettingsSegmented'
import { WeekdayChips } from '../shared/WeekdayChips'
import { SettingsNumberInput } from '../shared/SettingsNumberInput'

type GeneralSettingsSectionProps = {
  draft: LeaveSettings
  onChange: (next: LeaveSettings) => void
}

export function GeneralSettingsSection({ draft, onChange }: GeneralSettingsSectionProps) {
  const [pendingYear, setPendingYear] = useState<LeaveSettings['leaveYearMode'] | null>(null)
  const sandwichExample =
    draft.sandwichRule === 'exclude'
      ? 'Leave on Friday and Monday counts as 2 days.'
      : 'Leave on Friday and Monday counts as 4 days — Saturday and Sunday included.'

  return (
    <div className="space-y-6">
      <SettingsField label="Leave year" helper="Balances are credited and reset at the start of each leave year." tip="Changing this shifts when yearly quotas reset.">
        <SettingsSegmented
          ariaLabel="Leave year"
          value={draft.leaveYearMode}
          onChange={(value) => setPendingYear(value as LeaveSettings['leaveYearMode'])}
          options={[
            { value: 'jan_dec', label: 'Jan – Dec' },
            { value: 'apr_mar', label: 'Apr – Mar' },
          ]}
        />
      </SettingsField>
      <SettingsField label="Weekly off days" helper="Shaded on the calendar and excluded from working-day counts. Select at least one.">
        <WeekdayChips value={draft.weeklyOffDays} onChange={(weeklyOffDays) => onChange({ ...draft, weeklyOffDays })} />
      </SettingsField>
      <SettingsField label="Weekends and holidays between leave days" helper="Whether days in the middle count as leave.">
        <SettingsSegmented
          ariaLabel="Sandwich rule"
          value={draft.sandwichRule}
          onChange={(value) => onChange({ ...draft, sandwichRule: value as LeaveSettings['sandwichRule'] })}
          options={[
            { value: 'exclude', label: "Don't count as leave" },
            { value: 'count', label: 'Count as leave' },
          ]}
        />
        <p className="mt-2 rounded-lg bg-hrms-muted-bg px-3 py-2 text-xs text-hrms-text-secondary">{sandwichExample}</p>
      </SettingsField>
      <SettingsField label="Minimum service before leave" helper="Applies to all leave types. A leave type can ask for longer in its own settings.">
        <SettingsNumberInput value={draft.minProbationMonths} onChange={(minProbationMonths) => onChange({ ...draft, minProbationMonths })} unit="months" min={0} />
      </SettingsField>
      <LeaveConfirmDialog
        open={pendingYear != null && pendingYear !== draft.leaveYearMode}
        onOpenChange={(open) => !open && setPendingYear(null)}
        title="Change leave year?"
        description="This changes when balances are credited and reset."
        confirmLabel="Change"
        onConfirm={() => {
          if (pendingYear) onChange({ ...draft, leaveYearMode: pendingYear })
          setPendingYear(null)
        }}
      />
    </div>
  )
}
