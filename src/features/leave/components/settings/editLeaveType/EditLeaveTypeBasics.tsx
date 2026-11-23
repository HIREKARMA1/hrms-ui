/**
 * Basics block in leave type editor (days, eligibility, active).
 */

import { Switch } from '@/components/ui/switch'

import type { LeaveTypePolicy } from '../../../types/leaveSettings'
import type { LeaveEarningModel } from '../../../types/leaveEarningModel'
import { resolveEarningModel } from '../../../utils/leaveEarningModel'
import { SettingsField } from '../shared/SettingsField'
import { SettingsSegmented } from '../shared/SettingsSegmented'
import { SettingsNumberInput } from '../shared/SettingsNumberInput'

type EditLeaveTypeBasicsProps = {
  value: LeaveTypePolicy
  onChange: (next: LeaveTypePolicy) => void
}

export function EditLeaveTypeBasics({ value, onChange }: EditLeaveTypeBasicsProps) {
  const model = resolveEarningModel(value)
  const set = (patch: Partial<LeaveTypePolicy>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-hrms-text-secondary">Basics</p>
      <ModelDaysFields model={model} value={value} onChange={onChange} />
      <SettingsField label="Who can use it" helper="Restrict this leave to a gender where the law requires it.">
        <SettingsSegmented
          ariaLabel="Who can use it"
          value={value.eligibleGender}
          onChange={(v) => set({ eligibleGender: v as LeaveTypePolicy['eligibleGender'] })}
          options={[
            { value: 'All', label: 'All' },
            { value: 'Female', label: 'Female' },
            { value: 'Male', label: 'Male' },
          ]}
        />
      </SettingsField>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-hrms-navy">Active</span>
        <Switch checked={value.enabled} onCheckedChange={(enabled) => set({ enabled })} aria-label="Leave type active" />
      </div>
    </div>
  )
}

function ModelDaysFields({
  model,
  value,
  onChange,
}: {
  model: LeaveEarningModel
  value: LeaveTypePolicy
  onChange: (next: LeaveTypePolicy) => void
}) {
  const set = (patch: Partial<LeaveTypePolicy>) => onChange({ ...value, ...patch })
  if (model === 'unpaid') return null
  if (model === 'comp_off') {
    return (
      <SettingsField label="Expires after" helper="Unused compensatory off expires after this many days.">
        <SettingsNumberInput value={value.compOffExpiryDays ?? 60} onChange={(compOffExpiryDays) => set({ compOffExpiryDays })} unit="days" min={1} />
      </SettingsField>
    )
  }
  if (model === 'per_days_worked') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <SettingsField label="Days worked per 1 leave day">
          <SettingsNumberInput value={value.daysWorkedPerAccrualDay ?? 20} onChange={(n) => set({ daysWorkedPerAccrualDay: n })} unit="days" min={1} />
        </SettingsField>
        <SettingsField label="Qualifying days" tip="Working days counted before earning starts.">
          <SettingsNumberInput value={value.qualifyingDays ?? 0} onChange={(qualifyingDays) => set({ qualifyingDays })} unit="days" min={0} />
        </SettingsField>
      </div>
    )
  }
  if (model === 'per_event') {
    return (
      <div className="space-y-3">
        <SettingsField label="Days per event">
          <SettingsNumberInput value={value.annualQuotaDays ?? 0} onChange={(annualQuotaDays) => set({ annualQuotaDays })} unit="days" min={1} />
        </SettingsField>
        {value.code === 'MAT' ? (
          <SettingsField label="Days from the third child onwards" tip="Sample maternity split — confirm with your CA.">
            <SettingsNumberInput value={value.perEventDaysFromThirdChild ?? 84} onChange={(perEventDaysFromThirdChild) => set({ perEventDaysFromThirdChild })} unit="days" min={1} />
          </SettingsField>
        ) : null}
      </div>
    )
  }
  return (
    <SettingsField label="Yearly days" helper={model === 'earned_monthly' ? 'Total days credited across the year.' : 'Available at the start of the leave year.'}>
      <SettingsNumberInput value={value.annualQuotaDays ?? 0} onChange={(annualQuotaDays) => set({ annualQuotaDays })} unit="days" min={0} />
    </SettingsField>
  )
}
