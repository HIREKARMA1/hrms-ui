import type { AccrualPolicyForm } from '../../../utils/buildLeavePolicyApiBody'
import { LeaveDialogField } from '../../shared/LeaveDialogField'
import { POLICY_DIALOG_INPUT, PolicyFormSection, PolicyToggleRow } from './PolicyDialogShared'

type Props = {
  form: AccrualPolicyForm
  loading?: boolean
  fromErr: string | null
  setForm: (patch: Partial<AccrualPolicyForm>) => void
  onBlurFrom: () => void
}

export function AccrualPolicyLimitsDatesFields({ form, loading, fromErr, setForm, onBlurFrom }: Props) {
  return (
    <>
      <PolicyFormSection title="Limits">
        <div className="grid gap-4 sm:grid-cols-2">
          <LeaveDialogField label="Annual allocation cap" htmlFor="ap-annual">
            <input
              id="ap-annual"
              type="number"
              min={0}
              step={0.01}
              className={POLICY_DIALOG_INPUT}
              value={form.annualAllocationLimit}
              disabled={loading}
              onChange={(e) => setForm({ annualAllocationLimit: e.target.value })}
              placeholder="No limit"
            />
          </LeaveDialogField>
          <LeaveDialogField label="Max accumulated balance" htmlFor="ap-max-bal">
            <input
              id="ap-max-bal"
              type="number"
              min={0}
              step={0.01}
              className={POLICY_DIALOG_INPUT}
              value={form.maxAccumulatedBalance}
              disabled={loading}
              onChange={(e) => setForm({ maxAccumulatedBalance: e.target.value })}
              placeholder="No limit"
            />
          </LeaveDialogField>
        </div>
      </PolicyFormSection>

      <PolicyFormSection title="Effective period">
        <div className="grid gap-4 sm:grid-cols-2">
          <LeaveDialogField
            label="Effective from"
            htmlFor="ap-from"
            required
            error={fromErr ?? undefined}
            touched={Boolean(fromErr)}
          >
            <input
              id="ap-from"
              type="date"
              className={POLICY_DIALOG_INPUT}
              value={form.effectiveFrom}
              disabled={loading}
              onChange={(e) => setForm({ effectiveFrom: e.target.value })}
              onBlur={onBlurFrom}
            />
          </LeaveDialogField>
          <LeaveDialogField label="Effective to" htmlFor="ap-to">
            <input
              id="ap-to"
              type="date"
              className={POLICY_DIALOG_INPUT}
              value={form.effectiveTo}
              disabled={loading}
              onChange={(e) => setForm({ effectiveTo: e.target.value })}
            />
            <p className="mt-1.5 text-xs text-hrms-text-secondary">Leave empty for an open-ended policy.</p>
          </LeaveDialogField>
        </div>
      </PolicyFormSection>

      <PolicyFormSection title="Status">
        <PolicyToggleRow
          label="Active policy"
          description="Inactive policies stay listed but do not drive new accrual runs."
          checked={form.isActive}
          disabled={loading}
          onCheckedChange={(isActive) => setForm({ isActive })}
        />
      </PolicyFormSection>
    </>
  )
}