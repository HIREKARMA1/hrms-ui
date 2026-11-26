import { cn } from '@/lib/utils'

import type { LeaveTypeOption } from '../../../api/leaveMappers'
import type { CarryForwardPolicyForm } from '../../../utils/buildLeavePolicyApiBody'
import { LeaveDialogField } from '../../shared/LeaveDialogField'
import { LEAVE_FILTER_SELECT, LEAVE_SETTINGS_NUMBER_INPUT } from '../../shared/leaveUi'
import { CarryForwardExpiryFields } from './CarryForwardExpiryFields'
import { POLICY_DIALOG_INPUT, PolicyFormSection } from './PolicyDialogShared'

type Touched = { leaveType: boolean; max: boolean; year: boolean; months: boolean }

type Props = {
  form: CarryForwardPolicyForm
  loading?: boolean
  activeTypes: LeaveTypeOption[]
  touched: Touched
  typeErr: string | null
  maxErr: string | null
  yearErr: string | null
  monthsErr: string | null
  setForm: (patch: Partial<CarryForwardPolicyForm>) => void
  setTouched: (patch: Partial<Touched>) => void
}

export function CarryForwardRulesFields(props: Props) {
  const { form, loading, activeTypes, touched, typeErr, maxErr, yearErr, monthsErr, setForm, setTouched } = props
  return (
    <>
      <PolicyFormSection title="Leave type">
        <LeaveDialogField label="Leave type" htmlFor="cf-type" required error={typeErr ?? undefined} touched={touched.leaveType}>
          <select
            id="cf-type"
            className={cn(LEAVE_FILTER_SELECT, 'w-full')}
            value={form.leaveTypeId}
            disabled={loading}
            onChange={(e) => setForm({ leaveTypeId: e.target.value })}
            onBlur={() => setTouched({ leaveType: true })}
          >
            <option value="">Select type…</option>
            {activeTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.code})
              </option>
            ))}
          </select>
        </LeaveDialogField>
      </PolicyFormSection>

      <PolicyFormSection title="Carry-forward rules">
        <div className="grid gap-4 sm:grid-cols-2">
          <LeaveDialogField
            label="Max carry-forward days"
            htmlFor="cf-max"
            required
            error={maxErr ?? undefined}
            touched={touched.max}
          >
            <input
              id="cf-max"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              className={LEAVE_SETTINGS_NUMBER_INPUT}
              value={form.maxCarryForwardDays}
              disabled={loading}
              onChange={(e) => setForm({ maxCarryForwardDays: e.target.value })}
              onBlur={() => setTouched({ max: true })}
              placeholder="e.g. 10"
            />
          </LeaveDialogField>
          <LeaveDialogField label="Effective year" htmlFor="cf-year" required error={yearErr ?? undefined} touched={touched.year}>
            <input
              id="cf-year"
              type="number"
              min={2000}
              max={2100}
              step={1}
              inputMode="numeric"
              className={POLICY_DIALOG_INPUT}
              value={form.effectiveYear}
              disabled={loading}
              onChange={(e) => setForm({ effectiveYear: e.target.value })}
              onBlur={() => setTouched({ year: true })}
              placeholder="2026"
            />
          </LeaveDialogField>
        </div>
        <CarryForwardExpiryFields
          expiryNever={form.expiryNever}
          expiryMonths={form.expiryMonths}
          monthsErr={monthsErr}
          loading={loading}
          onChange={setForm}
          onBlurMonths={() => setTouched({ months: true })}
        />
      </PolicyFormSection>
    </>
  )
}