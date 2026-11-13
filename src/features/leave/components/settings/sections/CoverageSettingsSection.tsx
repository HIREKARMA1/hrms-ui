/**
 * Team coverage limits with warn versus block behaviour on apply.
 */

import type { LeaveSettings } from '../../../types/leaveSettings'
import { SettingsField } from '../shared/SettingsField'
import { SettingsSegmented } from '../shared/SettingsSegmented'
import { SettingsNumberInput } from '../shared/SettingsNumberInput'

type CoverageSettingsSectionProps = {
  draft: LeaveSettings
  onChange: (next: LeaveSettings) => void
}

export function CoverageSettingsSection({ draft, onChange }: CoverageSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsField
        label="Maximum people from one department on leave on the same day"
        helper="Counts approved and pending leave in the department."
      >
        <SettingsNumberInput
          value={draft.teamCoverage.maxSameDepartmentPerDay}
          onChange={(maxSameDepartmentPerDay) => onChange({ ...draft, teamCoverage: { ...draft.teamCoverage, maxSameDepartmentPerDay } })}
          unit="people"
          min={1}
        />
      </SettingsField>
      <SettingsField label="When exceeded" helper="Warn shows a notice to the applicant and approvers. Block prevents the request.">
        <SettingsSegmented
          ariaLabel="When exceeded"
          value={draft.teamCoverage.mode}
          onChange={(value) => onChange({ ...draft, teamCoverage: { ...draft.teamCoverage, mode: value as LeaveSettings['teamCoverage']['mode'] } })}
          options={[
            { value: 'warn', label: 'Warn only' },
            { value: 'block', label: 'Block' },
          ]}
        />
      </SettingsField>
    </div>
  )
}
